package africa.supertech.marketplace

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import java.text.NumberFormat
import java.util.Locale

/**
 * Website-aligned PDP:
 * - multi-image gallery (swipe / thumbs)
 * - mode-aware CTAs (shop vs motors/property)
 * - sticky bottom buy bar
 * - vendor block
 * - global bottom dock
 */
class ProductDetailActivity : BaseActivity() {

    private val money = NumberFormat.getNumberInstance(Locale.US)
    private var activeImage = 0
    override fun dockHighlight(): DockTab? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val e = intent
        val slug = e.getStringExtra("slug").orEmpty()
        val name = e.getStringExtra("name") ?: "Product"
        val category = e.getStringExtra("category") ?: "Tech"
        val description = e.getStringExtra("description").orEmpty()
        val price = e.getDoubleExtra("price", 0.0)
        val stockLabel = e.getStringExtra("stockLabel").orEmpty()
        val badge = e.getStringExtra("badge").orEmpty()
        val accent = e.getStringExtra("accent").orEmpty()
        val heroImage = e.getStringExtra("heroImage").orEmpty()
        val vendorSlug = e.getStringExtra("vendorSlug").orEmpty()
        val vendorName = e.getStringExtra("vendorName").orEmpty()
        val features = e.getStringArrayListExtra("features") ?: arrayListOf()
        val galleryExtra = e.getStringArrayListExtra("gallery") ?: arrayListOf()

        val images = LinkedHashSet<String>().apply {
            if (heroImage.isNotBlank()) add(heroImage)
            galleryExtra.forEach { if (it.isNotBlank()) add(it) }
        }.toList().ifEmpty { listOf(heroImage) }

        val mode = marketplaceMode(category)
        val outOfStock = isOutOfStock(stockLabel)
        val plan = buyPlan(mode, outOfStock)

        window.statusBarColor = backgroundStrong
        window.navigationBarColor = Color.WHITE
        Wishlist.init(this)

        val root = FrameLayout(this)
        root.addView(
            AppCanvasView(this).apply { zone = AppCanvasView.Zone.STOREFRONT },
            FrameLayout.LayoutParams(mp(), mp())
        )
        val column = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.TRANSPARENT)
        }
        column.addView(topBar(name.take(28), withBack = false), LinearLayout.LayoutParams(mp(), dp(56)))

        val scrollContent = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(12), dp(16), dp(120))
            setBackgroundColor(Color.TRANSPARENT)
        }
        val scroll = ScrollView(this).apply {
            isFillViewport = false
            overScrollMode = View.OVER_SCROLL_NEVER
            setBackgroundColor(Color.TRANSPARENT)
            addView(scrollContent)
        }
        column.addView(scroll, LinearLayout.LayoutParams(mp(), 0, 1f))
        val dock = globalBottomDock()
        column.addView(dock, LinearLayout.LayoutParams(mp(), dp(64)))
        ViewCompat.setOnApplyWindowInsetsListener(dock) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(dp(2), dp(6), dp(2), dp(8) + bars.bottom)
            v.layoutParams = (v.layoutParams as LinearLayout.LayoutParams).apply {
                height = dp(56) + bars.bottom + dp(8)
            }
            insets
        }
        root.addView(column, FrameLayout.LayoutParams(mp(), mp()))

        // —— Gallery
        val mainImage = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_INSIDE
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(parseColor(accent))
            setPadding(dp(36), dp(36), dp(36), dp(36))
        }
        roundView(mainImage, dp(16).toFloat())

        val screenW = resources.displayMetrics.widthPixels
        val galleryH = (screenW * 0.75).toInt()
        val galleryFrame = FrameLayout(this)
        galleryFrame.addView(mainImage, FrameLayout.LayoutParams(mp(), galleryH))

        // Floating Back Button
        val floatBack = FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, Color.argb(140, 0, 0, 0), dp(20).toFloat())
            elevation = dp(4).toFloat()
            pressable()
            setOnClickListener { finishSmart() }
        }
        floatBack.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_chevron)
            rotation = 180f
            setColorFilter(Color.WHITE)
            setPadding(dp(10), dp(10), dp(10), dp(10))
        }, FrameLayout.LayoutParams(dp(40), dp(40)))
        galleryFrame.addView(floatBack, FrameLayout.LayoutParams(wc(), wc(), Gravity.TOP or Gravity.START).apply {
            setMargins(dp(12), dp(12), 0, 0)
        })

        // Floating Wishlist Button
        if (slug.isNotBlank()) {
            val floatWish = likeButton(slug, onImage = true, sizeDp = 40)
            galleryFrame.addView(floatWish, FrameLayout.LayoutParams(wc(), wc(), Gravity.TOP or Gravity.END).apply {
                setMargins(0, dp(12), dp(12), 0)
            })
        }

        val counter = TextView(this).apply {
            text = "1/${images.size.coerceAtLeast(1)}"
            textSize = 11f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.WHITE)
            background = rounded(Color.TRANSPARENT, Color.argb(140, 0, 0, 0), dp(12).toFloat())
            setPadding(dp(10), dp(4), dp(10), dp(4))
            visibility = if (images.size > 1) View.VISIBLE else View.GONE
        }
        galleryFrame.addView(
            counter,
            FrameLayout.LayoutParams(wc(), wc(), Gravity.BOTTOM or Gravity.END).apply {
                setMargins(0, 0, dp(12), dp(12))
            }
        )
        scrollContent.block(galleryFrame, 10)
        loadImage(mainImage, images.firstOrNull().orEmpty())

        // Swipe Gesture for Gallery Navigation
        val thumbViews = ArrayList<ImageView>()
        fun refreshThumbHighlight() {
            thumbViews.forEachIndexed { idx, thumb ->
                if (idx == activeImage) {
                    thumb.background = rounded(brand, softGreen, dp(10).toFloat())
                    thumb.setPadding(dp(2), dp(2), dp(2), dp(2))
                } else {
                    thumb.background = rounded(Color.TRANSPARENT, softGreen, dp(10).toFloat())
                    thumb.setPadding(0, 0, 0, 0)
                }
            }
        }

        if (images.size > 1) {
            mainImage.setOnTouchListener(object : View.OnTouchListener {
                private var downX = 0f
                @SuppressLint("ClickableViewAccessibility")
                override fun onTouch(v: View, event: MotionEvent): Boolean {
                    when (event.action) {
                        MotionEvent.ACTION_DOWN -> {
                            downX = event.x
                            return true
                        }
                        MotionEvent.ACTION_UP -> {
                            val deltaX = event.x - downX
                            val minSwipe = dp(50)
                            if (Math.abs(deltaX) > minSwipe) {
                                if (deltaX < 0) {
                                    if (activeImage < images.size - 1) {
                                        activeImage++
                                        val nextUrl = images[activeImage]
                                        mainImage.animate().alpha(0f).setDuration(120).withEndAction {
                                            loadImage(mainImage, nextUrl)
                                            mainImage.animate().alpha(1f).setDuration(150).start()
                                        }.start()
                                        counter.text = "${activeImage + 1}/${images.size}"
                                        refreshThumbHighlight()
                                    }
                                } else {
                                    if (activeImage > 0) {
                                        activeImage--
                                        val nextUrl = images[activeImage]
                                        mainImage.animate().alpha(0f).setDuration(120).withEndAction {
                                            loadImage(mainImage, nextUrl)
                                            mainImage.animate().alpha(1f).setDuration(150).start()
                                        }.start()
                                        counter.text = "${activeImage + 1}/${images.size}"
                                        refreshThumbHighlight()
                                    }
                                }
                            }
                            v.performClick()
                            return true
                        }
                    }
                    return false
                }
            })
        }

        if (images.size > 1) {
            val thumbs = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            images.forEachIndexed { index, url ->
                val thumb = ImageView(this).apply {
                    scaleType = ImageView.ScaleType.CENTER_CROP
                    setBackgroundColor(softGreen)
                    pressable()
                    setOnClickListener {
                        activeImage = index
                        mainImage.animate().alpha(0f).setDuration(120).withEndAction {
                            loadImage(mainImage, url)
                            mainImage.animate().alpha(1f).setDuration(150).start()
                        }.start()
                        counter.text = "${index + 1}/${images.size}"
                        refreshThumbHighlight()
                    }
                }
                roundView(thumb, dp(10).toFloat())
                thumbs.addView(thumb, LinearLayout.LayoutParams(dp(64), dp(64)).apply {
                    rightMargin = dp(8)
                })
                loadImage(thumb, url)
                thumbViews.add(thumb)
            }
            refreshThumbHighlight()
            scrollContent.block(
                HorizontalScrollView(this).apply {
                    isHorizontalScrollBarEnabled = false
                    addView(thumbs)
                },
                12
            )
        }

        // —— Meta
        scrollContent.block(text(category.uppercase(Locale.US), 11f, muted, Typeface.BOLD), 4)
        scrollContent.block(text(name, 24f, ink, Typeface.BOLD), 6)

        val priceRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.BOTTOM or Gravity.CENTER_VERTICAL
        }
        val prefix = if (plan.priceEnquiry) "From RWF " else "RWF "
        priceRow.addView(text(prefix, 12f, muted, Typeface.BOLD).apply { setPadding(0, 0, 0, dp(2)) })
        priceRow.addView(text(money.format(price), 24f, brand, Typeface.BOLD))
        priceRow.addView(View(this), LinearLayout.LayoutParams(0, dp(1), 1f))

        val tag = stockLabel.ifBlank { badge }
        if (tag.isNotBlank()) {
            priceRow.addView(statusChip(tag, if (isOutOfStock(tag)) ChipStyle.REJECTED else ChipStyle.APPROVED))
        }
        scrollContent.block(priceRow, 8)

        scrollContent.block(
            chip(
                when (mode) {
                    "motors" -> "Motors · Enquire first"
                    "property" -> "Property · Enquire first"
                    else -> "Shop · Assisted checkout"
                },
                Color.rgb(255, 244, 229),
                brandDark
            ),
            12
        )

        scrollContent.block(
            text(plan.howItWorks, 13f, muted, Typeface.NORMAL).apply { setLineSpacing(0f, 1.25f) },
            14
        )

        // —— Vendor
        if (vendorSlug.isNotBlank() || vendorName.isNotBlank()) {
            val vendorCard = card()
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
            }
            val initial = (vendorName.ifBlank { vendorSlug }).take(1).uppercase(Locale.US)
            val bubble = FrameLayout(this).apply {
                background = rounded(Color.TRANSPARENT, softGreen, dp(22).toFloat())
            }
            bubble.addView(text(initial, 16f, brand, Typeface.BOLD).apply {
                gravity = Gravity.CENTER
            }, FrameLayout.LayoutParams(dp(44), dp(44)))
            row.addView(bubble, LinearLayout.LayoutParams(dp(44), dp(44)))

            val details = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(12), 0, 0, 0)
            }
            details.addView(text("SOLD BY", 10f, muted, Typeface.BOLD).apply { letterSpacing = 0.08f })
            details.addView(text(vendorName.ifBlank { vendorSlug }, 17f, ink, Typeface.BOLD))
            details.addView(text("Verified SuperTech Seller", 12f, brand, Typeface.BOLD))
            row.addView(details, LinearLayout.LayoutParams(0, wc(), 1f))
            vendorCard.addView(row)

            if (vendorSlug.isNotBlank()) {
                vendorCard.addView(
                    secondaryButton("Visit Store") {
                        startActivity(
                            Intent(this, VendorProfileActivity::class.java)
                                .putExtra("slug", vendorSlug)
                        )
                    }.apply {
                        minimumHeight = dp(44)
                        layoutParams = LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(14) }
                    }
                )
            }
            scrollContent.block(vendorCard, 12)
        }

        if (description.isNotBlank()) {
            val about = card()
            about.addView(text("About this product", 15f, ink, Typeface.BOLD))
            about.addView(
                text(description, 14f, muted).apply {
                    setPadding(0, dp(8), 0, 0)
                    setLineSpacing(0f, 1.2f)
                }
            )
            scrollContent.block(about, 12)
        }

        if (features.isNotEmpty()) {
            val feat = card(accentBorder = true)
            feat.addView(text("Key features", 16f, ink, Typeface.BOLD).apply {
                setPadding(0, 0, 0, dp(4))
            })
            features.forEach { f ->
                val row = LinearLayout(this).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    setPadding(0, dp(6), 0, dp(6))
                }
                row.addView(text("✓", 14f, brand, Typeface.BOLD).apply {
                    setPadding(0, 0, dp(8), 0)
                })
                row.addView(text(f, 14f, ink), LinearLayout.LayoutParams(0, wc(), 1f))
                feat.addView(row)
            }
            scrollContent.block(feat, 12)
        }

        // Secondary actions in-scroll
        if (plan.showAddToCart) {
            scrollContent.block(
                secondaryButton("Add to cart") {
                    Cart.add(slug, name, price, heroImage = heroImage)
                    toast("$name added to cart")
                }.apply { minimumHeight = dp(48) },
                8
            )
        }
        if (plan.showMessageSeller) {
            scrollContent.block(
                secondaryButton("Message seller") {
                    val msg = Uri.encode("Hello, I'm interested in $name on SuperTech.")
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/250783998231?text=$msg")))
                }.apply { minimumHeight = dp(48) },
                8
            )
        }

        // —— Sticky buy bar
        val sticky = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
            elevation = dp(16).toFloat()
        }
        sticky.addView(View(this).apply { setBackgroundColor(line) }, LinearLayout.LayoutParams(mp(), dp(1)))

        val buyBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(12), dp(14), dp(12))
        }
        val stickyCopy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        stickyCopy.addView(text(name, 12f, muted, Typeface.NORMAL).apply {
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
        })
        stickyCopy.addView(text("RWF ${money.format(price)}", 18f, brand, Typeface.BOLD))
        buyBar.addView(stickyCopy, LinearLayout.LayoutParams(0, wc(), 1f))

        buyBar.addView(
            primaryButton(plan.primaryLabel) {
                when (plan.primaryAction) {
                    "cart" -> {
                        Cart.add(slug, name, price, heroImage = heroImage)
                        startActivity(Intent(this@ProductDetailActivity, CheckoutActivity::class.java))
                    }
                    "request" -> openRequest(name, category)
                    "enquire" -> openRequest(name, category)
                    else -> openRequest(name, category)
                }
            }.apply {
                minimumHeight = dp(48)
                minimumWidth = dp(140)
            }
        )
        sticky.addView(buyBar)

        root.addView(
            sticky,
            FrameLayout.LayoutParams(mp(), wc(), Gravity.BOTTOM).apply {
                bottomMargin = dp(64)
            }
        )
        ViewCompat.setOnApplyWindowInsetsListener(sticky) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val dockH = dp(56) + bars.bottom + dp(8)
            (v.layoutParams as FrameLayout.LayoutParams).bottomMargin = dockH
            v.requestLayout()
            insets
        }
        setContentView(root)
    }

    private fun openRequest(productName: String, category: String) {
        startActivity(
            Intent(this, RequestProductActivity::class.java)
                .putExtra("productName", productName)
                .putExtra("category", category)
        )
    }

    private data class Plan(
        val primaryLabel: String,
        val primaryAction: String,
        val showAddToCart: Boolean,
        val showMessageSeller: Boolean,
        val howItWorks: String,
        val priceEnquiry: Boolean
    )

    private fun marketplaceMode(category: String): String {
        val c = category.lowercase(Locale.US)
        if (c.contains("car") || c.contains("motor")) return "motors"
        if (
            c.contains("apartment") || c.contains("land") ||
            c.contains("commercial") || c.contains("property")
        ) return "property"
        return "shop"
    }

    private fun isOutOfStock(stockLabel: String): Boolean {
        val v = stockLabel.trim().lowercase(Locale.US)
        return v.contains("out of stock") || v.contains("sold out") || v == "unavailable"
    }

    private fun buyPlan(mode: String, outOfStock: Boolean): Plan {
        if (outOfStock) {
            return Plan(
                primaryLabel = "Request this product",
                primaryAction = "request",
                showAddToCart = false,
                showMessageSeller = true,
                howItWorks = "This listing looks unavailable. Request it and SuperTech will help source it.",
                priceEnquiry = mode != "shop"
            )
        }
        return when (mode) {
            "motors" -> Plan(
                primaryLabel = "Enquire about vehicle",
                primaryAction = "enquire",
                showAddToCart = false,
                showMessageSeller = true,
                howItWorks = "Motors are enquiry-led. Send a request or message the seller — SuperTech helps coordinate.",
                priceEnquiry = true
            )
            "property" -> Plan(
                primaryLabel = "Enquire about listing",
                primaryAction = "enquire",
                showAddToCart = false,
                showMessageSeller = true,
                howItWorks = "Property is enquiry-led. Request a viewing or message the agent via SuperTech.",
                priceEnquiry = true
            )
            else -> Plan(
                primaryLabel = "Request order",
                primaryAction = "request",
                showAddToCart = true,
                showMessageSeller = true,
                howItWorks = "Request an assisted order, or add to cart and checkout. Pay with MoMoPay or your preferred method.",
                priceEnquiry = false
            )
        }
    }

    private fun parseColor(accent: String): Int = try {
        if (accent.isBlank()) Color.rgb(44, 105, 204) else Color.parseColor(accent)
    } catch (_: Exception) {
        Color.rgb(44, 105, 204)
    }

    private fun roundView(view: View, radius: Float) {
        view.clipToOutline = true
        view.outlineProvider = object : android.view.ViewOutlineProvider() {
            override fun getOutline(v: View, outline: android.graphics.Outline) {
                outline.setRoundRect(0, 0, v.width, v.height, radius)
            }
        }
    }
}
