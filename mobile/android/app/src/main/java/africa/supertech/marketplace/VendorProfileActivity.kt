package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Official store page — full-bleed cover hero, identity card, 2-col retail products.
 */
class VendorProfileActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout
    private var slug: String = ""
    override fun dockHighlight(): DockTab = DockTab.STORES
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.STOREFRONT

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        slug = intent.getStringExtra("slug").orEmpty()
        if (slug.isBlank()) {
            toast("Missing vendor")
            finish()
            return
        }
        val content = scaffold("Store", withBack = true)
        try {
            val topBar = (content.parent.parent as LinearLayout).getChildAt(0)
            topBar.visibility = View.GONE
        } catch (_: Exception) {}
        content.setPadding(0, 0, 0, dp(32))

        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        MarketplaceCache.init(this)
        MarketplaceCache.get()?.let { cached ->
            renderFromJson(cached, fromCache = true)
        }
        load()
    }

    private fun load() {
        if (body.childCount == 0) {
            body.addView(skeletonList(3))
        }
        executor.execute {
            try {
                val json = MarketplaceCache.fetchWithRetry(2)
                    ?: run {
                        val result = Net.get("/api/mobile/marketplace")
                        if (!result.ok) {
                            runOnUiThread {
                                if (MarketplaceCache.get() == null) {
                                    body.removeAllViews()
                                    body.addView(
                                        errorState(
                                            result.errorMessage("Could not load store."),
                                            onRetry = { load() }
                                        )
                                    )
                                } else {
                                    toast("Using saved catalog")
                                }
                            }
                            return@execute
                        }
                        result.json()
                    }
                MarketplaceCache.put(this, json)
                runOnUiThread { renderFromJson(json, fromCache = false) }
            } catch (e: Exception) {
                runOnUiThread {
                    if (MarketplaceCache.get() == null) {
                        body.removeAllViews()
                        body.addView(
                            errorState(
                                e.message ?: "Could not load store.",
                                onRetry = { load() }
                            )
                        )
                    }
                }
            }
        }
    }

    private fun render(result: Net.Result) {
        if (!result.ok) {
            body.removeAllViews()
            body.addView(errorState(result.errorMessage("Could not load store."), onRetry = { load() }))
            return
        }
        renderFromJson(result.json(), fromCache = false)
    }

    private fun renderFromJson(json: JSONObject, fromCache: Boolean) {
        val vendors = json.optJSONArray("vendors")
        val vendor = (0 until (vendors?.length() ?: 0))
            .mapNotNull { vendors?.optJSONObject(it) }
            .firstOrNull { it.optString("slug") == slug }
        if (vendor == null) {
            if (!fromCache) {
                body.removeAllViews()
                body.addView(errorState("Store is not available right now.", onRetry = { load() }))
            }
            return
        }

        val catalog = ArrayList<CatalogProduct>()
        val products = json.optJSONArray("products")
        for (i in 0 until (products?.length() ?: 0)) {
            val p = products?.optJSONObject(i) ?: continue
            // Case-insensitive match so vendor store pages don't drop listings
            if (!p.optString("vendorSlug").equals(slug, ignoreCase = true)) continue
            catalog.add(
                CatalogProduct(
                    slug = p.optString("slug"),
                    name = p.optString("name", "Product"),
                    category = p.optString("category", "Tech"),
                    badge = p.optString("badge"),
                    description = p.optString("description"),
                    price = p.optDouble("price", 0.0),
                    compareAt = p.optDouble("compareAt", 0.0),
                    rating = p.optDouble("rating", 0.0),
                    reviewCount = p.optInt("reviewCount", 0),
                    stockLabel = p.optString("stockLabel"),
                    accent = p.optString("accent", "#276076"),
                    heroImage = p.optString("heroImage"),
                    vendorSlug = p.optString("vendorSlug"),
                    vendorName = vendor.optString("name"),
                    featured = p.optBoolean("featured")
                )
            )
        }

        body.removeAllViews()
        body.addView(vendorHero(vendor, catalog.size))
        body.addView(
            text("Products from this store", 18f, ink, Typeface.BOLD).apply {
                setPadding(0, dp(18), 0, dp(4))
            }
        )
        body.addView(
            text(
                if (catalog.isEmpty()) "No live listings right now"
                else "${catalog.size} product${if (catalog.size == 1) "" else "s"} · official SuperTech store",
                13f,
                muted
            ).apply { setPadding(0, 0, 0, dp(12)) }
        )

        if (catalog.isEmpty()) {
            body.addView(
                emptyState(
                    "No active products yet",
                    "This store has no live listings right now. Check back soon or browse the marketplace.",
                    "Browse marketplace"
                ) { openMainTab("Shop") }
            )
        } else {
            body.addView(retailProductGrid(catalog))
        }
        animateContentIn(body)
    }

    private fun vendorHero(vendor: JSONObject, productCount: Int): View {
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }

        val coverH = dp(168)
        val cover = FrameLayout(this)
        val accent = try {
            Color.parseColor(vendor.optString("accent", "#0A0F1A"))
        } catch (_: Exception) {
            backgroundStrong
        }
        val coverBg = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setBackgroundColor(accent)
        }
        cover.addView(coverBg, FrameLayout.LayoutParams(mp(), coverH))
        val coverUrl = vendor.optString("coverImage")
        if (coverUrl.isNotBlank()) loadImage(coverBg, coverUrl)

        cover.addView(View(this).apply {
            background = GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                intArrayOf(Color.TRANSPARENT, Color.argb(160, 8, 12, 20))
            )
        }, FrameLayout.LayoutParams(mp(), dp(90), Gravity.BOTTOM))

        cover.addView(TextView(this).apply {
            text = "Official store"
            textSize = 11f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.WHITE)
            background = rounded(Color.TRANSPARENT, Color.argb(180, 14, 159, 110), dp(12).toFloat())
            setPadding(dp(10), dp(5), dp(10), dp(5))
        }, FrameLayout.LayoutParams(wc(), wc(), Gravity.TOP or Gravity.END).apply {
            topMargin = dp(12); rightMargin = dp(12)
        })

        // Floating circular back button on top-left of the cover
        cover.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_chevron)
            setColorFilter(Color.WHITE)
            rotation = 180f
            setPadding(dp(12), dp(12), dp(12), dp(12))
            background = rounded(Color.TRANSPARENT, Color.argb(140, 0, 0, 0), dp(20).toFloat())
            pressable()
            setOnClickListener { finishSmart() }
        }, FrameLayout.LayoutParams(dp(40), dp(40)).apply {
            topMargin = dp(12); leftMargin = dp(12)
        })

        col.addView(cover, LinearLayout.LayoutParams(mp(), coverH))

        // Overlapping Identity card
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(18).toFloat())
            elevation = dp(8).toFloat()
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }

        val top = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val logo = FrameLayout(this).apply {
            background = rounded(line, softGreen, dp(16).toFloat())
            elevation = dp(2).toFloat()
        }
        val logoUrl = vendor.optString("logoMark")
        if (logoUrl.isNotBlank()) {
            logo.addView(ImageView(this).apply {
                scaleType = ImageView.ScaleType.CENTER_CROP
                loadImage(this, logoUrl)
            }, FrameLayout.LayoutParams(dp(64), dp(64)))
        } else {
            logo.addView(TextView(this).apply {
                text = vendor.optString("name", "ST").trim().take(2).uppercase(Locale.US)
                textSize = 18f
                gravity = Gravity.CENTER
                setTextColor(Color.WHITE)
                typeface = Typeface.DEFAULT_BOLD
                background = gradient(brand, brandDark, dp(16).toFloat())
            }, FrameLayout.LayoutParams(dp(64), dp(64)))
        }
        top.addView(logo, LinearLayout.LayoutParams(dp(64), dp(64)))

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
        }
        copy.addView(text(vendor.optString("name", "Vendor"), 20f, ink, Typeface.BOLD).apply {
            maxLines = 2
        })
        val rating = vendor.optDouble("rating", 0.0)
        val location = vendor.optString("location", "Rwanda")
        copy.addView(
            text(
                buildString {
                    if (rating > 0) append("★ ${String.format(Locale.US, "%.1f", rating)} · ")
                    append(location)
                },
                13f,
                if (rating > 0) amber else muted,
                Typeface.BOLD
            ).apply { setPadding(0, dp(3), 0, 0) }
        )
        top.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))
        card.addView(top)

        card.addView(
            text(
                vendor.optString("headline", "Trusted SuperTech vendor"),
                14f,
                muted
            ).apply {
                setPadding(0, dp(12), 0, 0)
                setLineSpacing(0f, 1.2f)
            }
        )

        val chips = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(12), 0, 0)
        }
        fun makeChip(label: String, fill: Int, textClr: Int) = TextView(this).apply {
            text = label
            textSize = 11f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(textClr)
            background = rounded(fill, fill, dp(10).toFloat())
            setPadding(dp(10), dp(6), dp(10), dp(6))
        }
        chips.addView(makeChip("$productCount products", Color.rgb(243, 244, 246), ink))
        chips.addView(
            makeChip(vendor.optString("responseTime", "Fast response"), Color.rgb(254, 243, 199), Color.rgb(180, 83, 9)),
            LinearLayout.LayoutParams(wc(), wc()).apply { leftMargin = dp(6) }
        )
        chips.addView(
            makeChip("✓ Verified", Color.rgb(220, 252, 231), Color.rgb(21, 128, 61)),
            LinearLayout.LayoutParams(wc(), wc()).apply { leftMargin = dp(6) }
        )
        card.addView(chips)

        val actions = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(14), 0, 0)
        }
        actions.addView(
            primaryButton("Request product") {
                startActivity(
                    android.content.Intent(this@VendorProfileActivity, RequestProductActivity::class.java)
                        .putExtra("vendorSlug", slug)
                        .putExtra("vendorName", vendor.optString("name"))
                )
            }.apply { minimumHeight = dp(48) },
            LinearLayout.LayoutParams(0, wc(), 1f)
        )
        actions.addView(
            secondaryButton("Shop all") { openMainTab("Shop") }.apply { minimumHeight = dp(48) },
            LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(8) }
        )
        card.addView(actions)

        col.addView(
            card,
            LinearLayout.LayoutParams(mp(), wc()).apply {
                topMargin = -dp(36)
                leftMargin = dp(16)
                rightMargin = dp(16)
                bottomMargin = dp(12)
            }
        )
        return col
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
