package africa.supertech.marketplace

import android.annotation.SuppressLint
import android.content.res.ColorStateList
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Outline
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewOutlineProvider
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.view.inputmethod.EditorInfo
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.GridLayout
import android.widget.HorizontalScrollView
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.text.NumberFormat
import java.util.Collections
import java.util.Locale
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {
    private val apiBase = "https://supertech.africa"
    private val executor = Executors.newSingleThreadExecutor()
    private val imageExecutor = Executors.newFixedThreadPool(3)
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private val imageCache = Collections.synchronizedMap(HashMap<String, Bitmap>())

    private val ink = Color.rgb(49, 49, 51)
    private val muted = Color.rgb(117, 117, 122)
    private val line = Color.rgb(220, 221, 225)
    private val page = Color.rgb(241, 241, 242)
    private val brand = Color.rgb(246, 139, 30)
    private val brandDark = Color.rgb(224, 126, 23)
    private val softGreen = Color.rgb(255, 244, 229)
    private val amber = Color.rgb(249, 181, 76)
    private val skeleton = Color.rgb(229, 229, 231)
    private val blue = Color.rgb(39, 96, 118)

    private lateinit var content: LinearLayout
    private lateinit var bottomTabs: LinearLayout
    private lateinit var swipe: SwipeRefreshLayout
    private var currentTab = Tab.Home
    private var isLoading = true
    private var loadError: String? = null
    private var products = emptyList<Product>()
    private var displayedProducts = emptyList<Product>()
    private var vendors = emptyList<Vendor>()
    private var categories = listOf("All")
    private var selectedCategory = "All"


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // The UI is designed light; keep it consistent regardless of system theme.
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        window.statusBarColor = brand
        window.navigationBarColor = Color.WHITE

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(page)
        }

        content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(16), dp(18), dp(24))
        }

        val scroll = ScrollView(this).apply {
            isFillViewport = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(content)
        }

        swipe = SwipeRefreshLayout(this).apply {
            setColorSchemeColors(brand)
            setProgressBackgroundColorSchemeColor(Color.WHITE)
            setOnRefreshListener { loadMarketplace(fromSwipe = true) }
            addView(scroll)
        }

        bottomTabs = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(8), dp(8), dp(8), dp(8))
            setBackgroundColor(Color.WHITE)
            elevation = dp(12).toFloat()
        }

        root.addView(swipe, LinearLayout.LayoutParams(match(), 0, 1f))
        root.addView(bottomTabs, LinearLayout.LayoutParams(match(), dp(78)))

        // Overlay the global AI Support floating button above the content.
        val frame = FrameLayout(this).apply { setBackgroundColor(page) }
        frame.addView(root, FrameLayout.LayoutParams(match(), match()))
        val fabParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.BOTTOM or Gravity.END
        ).apply { setMargins(0, 0, dp(16), dp(78) + dp(16)) }
        frame.addView(aiFab(), fabParams)
        setContentView(frame)

        render(Tab.Home)
        loadMarketplace()
    }

    override fun onDestroy() {
        executor.shutdownNow()
        imageExecutor.shutdownNow()
        super.onDestroy()
    }

    private fun loadMarketplace(fromSwipe: Boolean = false) {
        isLoading = true
        loadError = null
        if (!fromSwipe) render(currentTab)

        executor.execute {
            try {
                val result = Net.get("/api/mobile/marketplace")
                if (!result.ok) error(result.errorMessage("Marketplace request failed (${result.code})."))
                val json = result.json()
                val nextProducts = parseProducts(json.optJSONArray("products") ?: JSONArray())
                val nextVendors = parseVendors(json.optJSONArray("vendors") ?: JSONArray())
                val nextCategories = parseStrings(json.optJSONArray("categories") ?: JSONArray()).ifEmpty {
                    listOf("All")
                }

                runOnUiThread {
                    products = nextProducts
                    displayedProducts = nextProducts
                    vendors = nextVendors
                    categories = if (nextCategories.firstOrNull() == "All") nextCategories else listOf("All") + nextCategories
                    selectedCategory = "All"
                    isLoading = false
                    loadError = null
                    swipe.isRefreshing = false
                    render(currentTab)
                }
            } catch (error: Exception) {
                runOnUiThread {
                    isLoading = false
                    loadError = error.message ?: "Could not load SuperTech data. Check internet and try again."
                    swipe.isRefreshing = false
                    render(currentTab)
                }
            }
        }
    }

    private fun searchProducts(query: String) {
        val cleanQuery = query.trim()
        if (cleanQuery.length < 2) return
        hideKeyboard()

        isLoading = true
        loadError = null
        currentTab = Tab.Shop
        selectedCategory = "All"
        render(Tab.Shop)

        executor.execute {
            val searched = try {
                val body = JSONObject()
                    .put("query", cleanQuery)
                    .put("limit", 20)
                val result = Net.post("/api/ai/search", body)
                if (!result.ok) error(result.errorMessage("Search request failed (${result.code})."))
                val json = result.json()
                parseProducts(json.optJSONArray("products") ?: JSONArray())
            } catch (_: Exception) {
                localSearch(cleanQuery)
            }

            runOnUiThread {
                displayedProducts = searched
                isLoading = false
                render(Tab.Shop)
            }
        }
    }

    private fun render(tab: Tab) {
        currentTab = tab
        // A screen can be rebuilt while loading or while a tab entrance animation is
        // still running. Cancel every animator first so detached views cannot leave
        // translucent hardware layers over the newly rendered content.
        content.animate().cancel()
        clearTransientAnimations(content)
        content.alpha = 1f
        content.translationY = 0f
        content.removeAllViews()
        when (tab) {
            Tab.Home -> renderHome()
            Tab.Shop -> renderShop()
            Tab.Vendors -> renderVendors()
            Tab.Cart -> renderCart()
            Tab.Menu -> renderMenu()
        }
        renderTabs()
        // Cross-fade the freshly built screen into view.
        content.alpha = 0f
        content.translationY = dp(8).toFloat()
        content.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(220)
            .setInterpolator(DecelerateInterpolator())
            .start()
    }

    private fun renderHome() {
        content.addView(appHeader("SuperTech", "Trusted tech marketplace · Rwanda"))
        content.addView(searchBox("Search laptops, phones, accessories"))
        content.addView(heroCarousel())
        content.addView(trustStrip())

        if (isLoading) {
            content.addView(sectionHeader("Featured", "Loading live picks…", null) {})
            repeat(3) { content.addView(skeletonCard()) }
            return
        }
        stateBlock()?.let { content.addView(it) }

        if (categories.size > 1) {
            content.addView(sectionHeader("Shop by category", "Find what you need faster", "See all") { render(Tab.Shop) })
            content.addView(categoryLauncher(categories.filterNot { it == "All" }.take(8)))
        }

        val featured = products.filter { it.featured }.ifEmpty { products }.take(8)
        if (featured.isNotEmpty()) {
            content.addView(sectionHeader("Featured", "Hand-picked from the marketplace", "See all") { render(Tab.Shop) })
            content.addView(featuredCarousel(featured))
        }

        val fresh = products.filterNot { it.featured }.take(4).ifEmpty { products.take(4) }
        if (fresh.isNotEmpty() && products.size > featured.size) {
            content.addView(sectionHeader("Fresh on the market", "Latest products from vendors", "See all") { render(Tab.Shop) })
            fresh.forEachIndexed { i, p -> content.addView(productCard(p).animateIn(i)) }
        }

        if (vendors.isNotEmpty()) {
            content.addView(sectionHeader("Top vendors", "Trusted sellers, fast response", "View all") { render(Tab.Vendors) })
            content.addView(vendorStrip(vendors))
        }

        content.addView(sectionHeader("Quick actions", "Move faster inside the app", null) {})
        content.addView(actionGrid())
    }

    private fun renderShop() {
        content.addView(appHeader("Shop", "Browse live products and AI search results"))
        content.addView(searchBox("Search the SuperTech catalogue"))
        content.addView(categoryChips(categories))

        if (isLoading) {
            repeat(4) { content.addView(skeletonCard()) }
            return
        }
        stateBlock()?.let { content.addView(it) }

        if (loadError == null && displayedProducts.isEmpty()) {
            content.addView(emptyCard("No products found", "Try a different search or refresh the marketplace."))
            return
        }

        if (loadError == null) {
            val countLabel = if (selectedCategory == "All") "${displayedProducts.size} products"
            else "${displayedProducts.size} in $selectedCategory"
            content.addView(text(countLabel, 12f, muted, Typeface.BOLD).withMargins(bottom = 8))
            content.addView(productGrid(displayedProducts))
        }
    }

    /** Two-column image-first product grid — the core marketplace view. */
    private fun productGrid(items: List<Product>): View {
        val grid = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        items.chunked(2).forEachIndexed { rowIndex, pair ->
            val rowView = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEachIndexed { col, product ->
                val lp = LinearLayout.LayoutParams(0, wrap(), 1f).apply {
                    leftMargin = if (col == 0) 0 else dp(5)
                    rightMargin = if (col == 0) dp(5) else 0
                    bottomMargin = dp(10)
                }
                rowView.addView(gridProductCard(product).animateIn(rowIndex), lp)
            }
            if (pair.size == 1) {
                rowView.addView(View(this), LinearLayout.LayoutParams(0, wrap(), 1f).apply { leftMargin = dp(5) })
            }
            grid.addView(rowView, LinearLayout.LayoutParams(match(), wrap()))
        }
        return grid
    }

    private fun gridProductCard(product: Product): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            clipToOutline = true
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, dp(16).toFloat())
                }
            }
            pressable()
            setOnClickListener { openProduct(product) }
        }

        val imageWrap = FrameLayout(this)
        val image = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_INSIDE
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(product.color)
            setPadding(dp(24), dp(24), dp(24), dp(24))
        }
        loadImage(image, product.heroImage)
        imageWrap.addView(image, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, dp(124)))

        val tag = product.stockLabel.ifBlank { product.badge }
        if (tag.isNotBlank()) {
            imageWrap.addView(TextView(this).apply {
                text = tag
                textSize = 9f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(brandDark)
                background = rounded(Color.TRANSPARENT, Color.argb(235, 255, 255, 255), dp(9).toFloat())
                setPadding(dp(7), dp(3), dp(7), dp(3))
            }, FrameLayout.LayoutParams(wrap(), wrap(), Gravity.TOP or Gravity.START).apply {
                topMargin = dp(7); leftMargin = dp(7)
            })
        }
        card.addView(imageWrap, LinearLayout.LayoutParams(match(), dp(124)))

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(11), dp(9), dp(11), dp(11))
        }
        copy.addView(text(product.name, 13f, ink, Typeface.BOLD).apply { maxLines = 2; minLines = 2 })
        val seller = vendorName(product.vendorSlug)
        copy.addView(text(seller?.let { "by $it" } ?: product.category, 10f, muted, Typeface.NORMAL).apply {
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
            setPadding(0, dp(3), 0, dp(4))
        })

        val priceRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        priceRow.addView(text("RWF ${money.format(product.price)}", 13f, brand, Typeface.BOLD).apply {
            maxLines = 1
        }, LinearLayout.LayoutParams(0, wrap(), 1f))
        priceRow.addView(TextView(this).apply {
            text = "＋"
            textSize = 16f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            background = rounded(Color.TRANSPARENT, brand, dp(14).toFloat())
            contentDescription = "Add to cart"
            pressable()
            setOnClickListener { addToCart(product) }
        }, LinearLayout.LayoutParams(dp(28), dp(28)))
        copy.addView(priceRow)
        card.addView(copy)
        return card
    }

    private fun vendorName(slug: String): String? =
        slug.takeIf { it.isNotBlank() }?.let { s -> vendors.firstOrNull { it.slug == s }?.name }

    private fun renderVendors() {
        content.addView(appHeader("Vendors", "Trusted suppliers from the backend"))

        if (isLoading) {
            repeat(3) { content.addView(skeletonCard()) }
            return
        }
        stateBlock()?.let { content.addView(it) }

        if (loadError == null && vendors.isEmpty()) {
            content.addView(emptyCard("No vendors yet", "Approved vendors will appear here."))
        }
        vendors.forEachIndexed { i, v -> content.addView(vendorCard(v).animateIn(i)) }
    }

    private fun renderMenu() {
        content.addView(appHeader("Menu", "Everything in SuperTech, in one place"))
        content.addView(profileCard().animateIn(0))

        content.addView(menuSection("Shop"))
        content.addView(menuGroup(
            MenuItem(R.drawable.ic_shop, "Full catalog", "Browse every product in the app") { render(Tab.Shop) },
            MenuItem(R.drawable.ic_box, "Request a product", "Ask vendors to source an item") { startActivity(Intent(this, RequestProductActivity::class.java)) },
            MenuItem(R.drawable.ic_truck, "Track an order", "Follow your delivery") { startActivity(Intent(this, TrackOrderActivity::class.java)) }
        ).animateIn(1))

        content.addView(menuSection("Sell on SuperTech"))
        content.addView(menuGroup(
            MenuItem(R.drawable.ic_store, "Become a vendor", "Start selling your tech") { startActivity(Intent(this, BecomeVendorActivity::class.java)) },
            MenuItem(R.drawable.ic_wallet, "Vendor dashboard", "Products, orders, payouts & storefront") { openAccount() },
            MenuItem(R.drawable.ic_shield, "Admin dashboard", "Approvals, orders, vendors & analytics") { openAccount() }
        ).animateIn(2))

        content.addView(menuSection("Help & company"))
        content.addView(menuGroup(
            MenuItem(R.drawable.ic_sparkle, "AI support", "Instant answers, day and night") { openAi() },
            MenuItem(R.drawable.ic_article, "Blog", "News, guides and updates") { startActivity(Intent(this, BlogActivity::class.java)) },
            MenuItem(R.drawable.ic_lock, "Privacy", "How we handle your data") { startActivity(Intent(this, PrivacyActivity::class.java)) }
        ).animateIn(3))

        content.addView(text("SuperTech · supertech.africa", 12f, muted, Typeface.NORMAL).apply {
            gravity = Gravity.CENTER
            setPadding(0, dp(18), 0, dp(8))
        })
    }

    /** Signed-in aware identity card at the top of the menu. */
    private fun profileCard(): View {
        val session = Net.session()
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            background = gradient(brand, brandDark, dp(18).toFloat())
            elevation = dp(4).toFloat()
            pressable()
            setOnClickListener { openAccount() }
        }

        val avatar = TextView(this).apply {
            text = if (session != null && Net.isLoggedIn()) session.name.trim().take(1).uppercase(Locale.US) else "?"
            textSize = 20f
            gravity = Gravity.CENTER
            setTextColor(brandDark)
            typeface = Typeface.DEFAULT_BOLD
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(24).toFloat())
        }
        card.addView(avatar, LinearLayout.LayoutParams(dp(48), dp(48)))

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, dp(8), 0)
        }
        if (session != null && Net.isLoggedIn()) {
            copy.addView(text(session.name, 17f, Color.WHITE, Typeface.BOLD).apply { maxLines = 1 })
            copy.addView(text(session.email, 12f, Color.argb(210, 255, 255, 255), Typeface.NORMAL).apply { maxLines = 1 })
            copy.addView(TextView(this).apply {
                text = when (session.role) {
                    "admin" -> "Administrator"
                    "vendor" -> "Vendor"
                    else -> "Customer"
                }
                textSize = 10f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(Color.WHITE)
                background = rounded(Color.TRANSPARENT, Color.argb(50, 255, 255, 255), dp(9).toFloat())
                setPadding(dp(8), dp(3), dp(8), dp(3))
            }, LinearLayout.LayoutParams(wrap(), wrap()).apply { topMargin = dp(5) })
        } else {
            copy.addView(text("Welcome to SuperTech", 17f, Color.WHITE, Typeface.BOLD))
            copy.addView(text("Sign in to track orders, sell, and manage your account.", 12f, Color.argb(210, 255, 255, 255), Typeface.NORMAL))
        }
        card.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))

        card.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_chevron)
            setColorFilter(Color.WHITE)
        }, LinearLayout.LayoutParams(dp(20), dp(20)))

        return card.withMargins(bottom = 6)
    }

    private class MenuItem(
        val iconRes: Int,
        val title: String,
        val subtitle: String,
        val onClick: () -> Unit
    )

    /** Grouped settings-style card: rows separated by inset dividers. */
    private fun menuGroup(vararg items: MenuItem): View {
        val group = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(18).toFloat())
            elevation = dp(2).toFloat()
            clipToOutline = true
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, dp(18).toFloat())
                }
            }
        }
        items.forEachIndexed { index, item ->
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(dp(14), dp(13), dp(14), dp(13))
                pressable()
                setOnClickListener { item.onClick() }
            }
            val bubble = FrameLayout(this).apply {
                background = rounded(Color.TRANSPARENT, softGreen, dp(19).toFloat())
            }
            bubble.addView(ImageView(this).apply {
                setImageResource(item.iconRes)
                setColorFilter(brand)
                setPadding(dp(8), dp(8), dp(8), dp(8))
            }, FrameLayout.LayoutParams(dp(38), dp(38)))
            row.addView(bubble, LinearLayout.LayoutParams(dp(38), dp(38)))

            val copy = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(12), 0, dp(8), 0)
            }
            copy.addView(text(item.title, 15f, ink, Typeface.BOLD))
            copy.addView(text(item.subtitle, 12f, muted, Typeface.NORMAL).apply { maxLines = 1 })
            row.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))

            row.addView(ImageView(this).apply {
                setImageResource(R.drawable.ic_chevron)
                setColorFilter(Color.rgb(190, 198, 207))
            }, LinearLayout.LayoutParams(dp(18), dp(18)))

            group.addView(row, LinearLayout.LayoutParams(match(), wrap()))

            if (index < items.size - 1) {
                group.addView(View(this).apply { setBackgroundColor(line) },
                    LinearLayout.LayoutParams(match(), dp(1)).apply { leftMargin = dp(64) })
            }
        }
        return group.withMargins(bottom = 6)
    }

    private fun renderCart() {
        content.addView(appHeader("Cart", "Review selected products before checkout"))

        val lines = Cart.lines.values.toList()

        if (lines.isEmpty()) {
            content.addView(emptyCard("Your cart is empty", "Add products from the shop and they will appear here."))
            content.addView(primaryButton("Browse products") { render(Tab.Shop) })
            return
        }

        lines.forEachIndexed { i, line ->
            content.addView(cartCard(line).animateIn(i))
        }

        content.addView(divider())
        content.addView(summaryRow("Items", Cart.count().toString()))
        content.addView(summaryRow("Estimated total", "RWF ${money.format(Cart.total())}"))
        content.addView(primaryButton("Checkout") {
            startActivity(Intent(this, CheckoutActivity::class.java))
        })
        content.addView(secondaryButton("Continue shopping") { render(Tab.Shop) })
    }

    private fun appHeader(title: String, subtitle: String): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(8), 0, dp(12))
        }

        // Official SuperTech lion/cart mark used by the website and launcher.
        val logo = FrameLayout(this).apply {
            background = rounded(line, Color.WHITE, dp(12).toFloat())
            elevation = dp(2).toFloat()
        }
        val bolt = ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher)
            scaleType = ImageView.ScaleType.CENTER_CROP
        }
        logo.addView(bolt, FrameLayout.LayoutParams(dp(48), dp(48)))

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
        }
        copy.addView(text(title, 24f, ink, Typeface.BOLD))
        copy.addView(text(subtitle, 13f, muted, Typeface.NORMAL))

        val account = ImageButton(this).apply {
            setImageResource(R.drawable.ic_person)
            setColorFilter(brand)
            background = rounded(line, Color.WHITE, dp(22).toFloat())
            elevation = dp(2).toFloat()
            setPadding(dp(10), dp(10), dp(10), dp(10))
            contentDescription = "Account"
            setOnClickListener { openAccount() }
            pressable()
        }

        row.addView(logo, LinearLayout.LayoutParams(dp(48), dp(48)))
        row.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        row.addView(account, LinearLayout.LayoutParams(dp(44), dp(44)))
        return row
    }

    private fun searchBox(hint: String): View {
        val input = EditText(this).apply {
            setSingleLine(true)
            this.hint = hint
            textSize = 15f
            setTextColor(ink)
            setHintTextColor(muted)
            imeOptions = EditorInfo.IME_ACTION_SEARCH
            setPadding(dp(14), 0, dp(16), 0)
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            elevation = dp(1).toFloat()
            val glass = androidx.core.content.ContextCompat.getDrawable(context, R.drawable.ic_search)?.mutate()
            glass?.setTint(muted)
            glass?.setBounds(0, 0, dp(20), dp(20))
            setCompoundDrawables(glass, null, null, null)
            compoundDrawablePadding = dp(10)
            setOnEditorActionListener { view, actionId, _ ->
                if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                    searchProducts(view.text.toString())
                    true
                } else {
                    false
                }
            }
            // Subtle lift when the field gains focus.
            setOnFocusChangeListener { v, hasFocus ->
                v.animate().scaleX(if (hasFocus) 1.01f else 1f).scaleY(if (hasFocus) 1.01f else 1f)
                    .setDuration(150).start()
                v.background = rounded(if (hasFocus) brand else line, Color.WHITE, dp(14).toFloat())
            }
        }
        return input.withMargins(bottom = 14, height = 52)
    }

    /** Snapping page scroller: always settles on a full page, no half states. */
    private inner class PagerScrollView(
        private val pageStride: Int,
        private val pageCount: Int,
        private val onPage: (Int) -> Unit
    ) : HorizontalScrollView(this@MainActivity) {
        init {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            viewTreeObserver.addOnScrollChangedListener {
                onPage(((scrollX + pageStride / 2) / pageStride).coerceIn(0, pageCount - 1))
            }
        }

        private fun snap() {
            val page = ((scrollX + pageStride / 2) / pageStride).coerceIn(0, pageCount - 1)
            post { smoothScrollTo(page * pageStride, 0) }
        }

        override fun fling(velocityX: Int) {
            // Convert the fling into a single-page move for a pager feel.
            val current = scrollX / pageStride
            val target = when {
                velocityX > 400 -> current + 1
                velocityX < -400 -> current
                else -> ((scrollX + pageStride / 2) / pageStride)
            }.coerceIn(0, pageCount - 1)
            post { smoothScrollTo(target * pageStride, 0) }
        }

        override fun onTouchEvent(ev: MotionEvent): Boolean {
            if (ev.action == MotionEvent.ACTION_UP || ev.action == MotionEvent.ACTION_CANCEL) {
                val handled = super.onTouchEvent(ev)
                snap()
                return handled
            }
            return super.onTouchEvent(ev)
        }
    }

    /** Hero carousel: fixed-height snapping slides with page dots. */
    private fun heroCarousel(): View {
        val gap = dp(10)
        val slideWidth = resources.displayMetrics.widthPixels - dp(36) - dp(28)
        val slideHeight = dp(196)
        val stride = slideWidth + gap

        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }

        val slides = listOf(
            Triple(gradient(brand, brandDark, dp(20).toFloat()), Triple("LIVE MARKETPLACE", "Buy, request, and track tech faster", "Products and vendors load straight from SuperTech."), "Browse products" to { render(Tab.Shop) }),
            Triple(gradient(Color.rgb(30, 41, 59), Color.rgb(15, 23, 42), dp(20).toFloat()), Triple("SUPERTECH AI", "Your personal shopping assistant", "Find the right product and get help instantly."), "Ask AI now" to { openAi() }),
            Triple(gradient(Color.rgb(154, 100, 16), Color.rgb(120, 72, 6), dp(20).toFloat()), Triple("SELL WITH US", "Turn your tech into income", "Join trusted vendors selling on SuperTech today."), "Become a vendor" to { startActivity(Intent(this, BecomeVendorActivity::class.java)) })
        )

        slides.forEachIndexed { index, (bg, copy, cta) ->
            val lp = LinearLayout.LayoutParams(slideWidth, slideHeight)
            lp.rightMargin = if (index == slides.size - 1) 0 else gap
            row.addView(heroSlide(bg, copy.first, copy.second, copy.third, cta.first, cta.second), lp)
        }

        // Page indicator dots
        val dotsRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, dp(10), 0, 0)
        }
        val dots = slides.indices.map { i ->
            View(this).apply {
                background = rounded(Color.TRANSPARENT, if (i == 0) brand else line, dp(4).toFloat())
            }.also { dot ->
                val lp = LinearLayout.LayoutParams(if (i == 0) dp(18) else dp(8), dp(8))
                lp.setMargins(dp(3), 0, dp(3), 0)
                dotsRow.addView(dot, lp)
            }
        }
        var activePage = 0
        val pager = PagerScrollView(stride, slides.size) { page ->
            if (page != activePage) {
                activePage = page
                dots.forEachIndexed { i, dot ->
                    dot.background = rounded(Color.TRANSPARENT, if (i == page) brand else line, dp(4).toFloat())
                    val lp = dot.layoutParams as LinearLayout.LayoutParams
                    lp.width = if (i == page) dp(18) else dp(8)
                    dot.layoutParams = lp
                }
            }
        }
        pager.addView(row)

        val wrap = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        wrap.addView(pager, LinearLayout.LayoutParams(match(), slideHeight))
        wrap.addView(dotsRow, LinearLayout.LayoutParams(match(), wrap()))
        return wrap.withMargins(bottom = 10)
    }

    private fun heroSlide(
        bg: android.graphics.drawable.GradientDrawable,
        kicker: String,
        headline: String,
        detail: String,
        cta: String,
        onClick: () -> Unit
    ): View {
        val frame = FrameLayout(this).apply {
            background = bg
            clipToOutline = true
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, dp(20).toFloat())
                }
            }
        }

        fun circle(size: Int, alphaWhite: Int): View = View(this).apply {
            background = rounded(Color.TRANSPARENT, Color.argb(alphaWhite, 255, 255, 255), dp(size / 2).toFloat())
        }
        frame.addView(circle(140, 14), FrameLayout.LayoutParams(dp(140), dp(140), Gravity.TOP or Gravity.END).apply {
            topMargin = dp(-46); rightMargin = dp(-34)
        })
        frame.addView(circle(80, 9), FrameLayout.LayoutParams(dp(80), dp(80), Gravity.BOTTOM or Gravity.START).apply {
            bottomMargin = dp(-26); leftMargin = dp(-20)
        })

        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(20), dp(14), dp(20), dp(14))
        }
        panel.addView(TextView(this).apply {
            text = kicker
            textSize = 10f
            typeface = Typeface.DEFAULT_BOLD
            letterSpacing = 0.14f
            setTextColor(Color.WHITE)
            background = rounded(Color.TRANSPARENT, Color.argb(46, 255, 255, 255), dp(10).toFloat())
            setPadding(dp(10), dp(4), dp(10), dp(4))
        }, LinearLayout.LayoutParams(wrap(), wrap()))
        panel.addView(text(headline, 21f, Color.WHITE, Typeface.BOLD).apply {
            maxLines = 2
            setPadding(0, dp(8), 0, 0)
        })
        panel.addView(text(detail, 13f, Color.argb(215, 255, 255, 255), Typeface.NORMAL).apply {
            maxLines = 2
            setPadding(0, dp(4), 0, 0)
        })
        panel.addView(Button(this).apply {
            text = cta
            textSize = 13f
            isAllCaps = false
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(ColorStateList.valueOf(brandDark))
            backgroundTintList = null
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(12).toFloat())
            stateListAnimator = null
            pressable()
            setOnClickListener { onClick() }
        }, LinearLayout.LayoutParams(wrap(), dp(40)).apply { topMargin = dp(12) })

        frame.addView(panel, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        return frame
    }

    /** Horizontal product gallery with tall image-first cards. */
    private fun featuredCarousel(items: List<Product>): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(2), 0, dp(6))
        }
        items.forEachIndexed { i, product ->
            val lp = LinearLayout.LayoutParams(dp(190), wrap())
            lp.rightMargin = dp(12)
            row.addView(featuredCard(product).animateIn(i), lp)
        }
        return HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(row)
        }.withMargins(bottom = 8)
    }

    private fun featuredCard(product: Product): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(18).toFloat())
            elevation = dp(3).toFloat()
            clipToOutline = true
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, dp(18).toFloat())
                }
            }
            pressable()
            setOnClickListener { openProduct(product) }
        }

        val imageWrap = FrameLayout(this)
        val image = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_INSIDE
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(product.color)
            setPadding(dp(26), dp(26), dp(26), dp(26))
        }
        loadImage(image, product.heroImage)
        imageWrap.addView(image, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, dp(132)))

        val tag = product.stockLabel.ifBlank { product.badge }
        if (tag.isNotBlank()) {
            imageWrap.addView(TextView(this).apply {
                text = tag
                textSize = 10f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(brandDark)
                background = rounded(Color.TRANSPARENT, Color.argb(235, 255, 255, 255), dp(10).toFloat())
                setPadding(dp(8), dp(4), dp(8), dp(4))
            }, FrameLayout.LayoutParams(wrap(), wrap(), Gravity.TOP or Gravity.START).apply {
                topMargin = dp(8); leftMargin = dp(8)
            })
        }
        card.addView(imageWrap, LinearLayout.LayoutParams(match(), dp(132)))

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), dp(10), dp(12), dp(12))
        }
        copy.addView(text(product.name, 14f, ink, Typeface.BOLD).apply { maxLines = 2; minLines = 2 })
        copy.addView(text(vendorName(product.vendorSlug)?.let { "by $it" } ?: product.category, 10f, muted, Typeface.NORMAL).apply {
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
            setPadding(0, dp(4), 0, dp(2))
        })

        val priceRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        priceRow.addView(text("RWF ${money.format(product.price)}", 15f, brand, Typeface.BOLD), LinearLayout.LayoutParams(0, wrap(), 1f))
        priceRow.addView(TextView(this).apply {
            text = "＋"
            textSize = 17f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            background = rounded(Color.TRANSPARENT, brand, dp(16).toFloat())
            contentDescription = "Add to cart"
            pressable()
            setOnClickListener { addToCart(product) }
        }, LinearLayout.LayoutParams(dp(32), dp(32)))
        copy.addView(priceRow)
        card.addView(copy)
        return card
    }

    /** Horizontal strip of compact vendor cards. */
    private fun vendorStrip(items: List<Vendor>): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(2), 0, dp(6))
        }
        items.take(8).forEachIndexed { i, vendor ->
            val lp = LinearLayout.LayoutParams(dp(150), wrap())
            lp.rightMargin = dp(10)
            row.addView(vendorMiniCard(vendor).animateIn(i), lp)
        }
        return HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(row)
        }.withMargins(bottom = 8)
    }

    private fun vendorMiniCard(vendor: Vendor): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(12), dp(16), dp(12), dp(14))
            background = rounded(line, Color.WHITE, dp(18).toFloat())
            elevation = dp(2).toFloat()
            pressable()
            setOnClickListener {
                startActivity(Intent(this@MainActivity, VendorProfileActivity::class.java).putExtra("slug", vendor.slug))
            }
        }
        val avatar = TextView(this).apply {
            text = vendor.name.trim().take(1).uppercase(Locale.US)
            textSize = 20f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            background = gradient(brand, brandDark, dp(24).toFloat())
        }
        card.addView(avatar, LinearLayout.LayoutParams(dp(48), dp(48)).apply { bottomMargin = dp(8) })
        card.addView(text(vendor.name, 13f, ink, Typeface.BOLD).apply {
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
            gravity = Gravity.CENTER
        })
        card.addView(text(vendor.location, 11f, muted, Typeface.NORMAL).apply {
            maxLines = 1
            gravity = Gravity.CENTER
        })
        if (vendor.rating > 0) {
            card.addView(text("★ ${String.format(Locale.US, "%.1f", vendor.rating)}", 11f, amber, Typeface.BOLD).apply {
                gravity = Gravity.CENTER
                setPadding(0, dp(3), 0, 0)
            })
        }
        return card
    }

    /** Section heading with optional trailing action ("See all ›"). */
    private fun sectionHeader(title: String, subtitle: String, action: String?, onAction: () -> Unit): View {
        val block = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(12), 0, dp(10))
        }
        val copy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        copy.addView(text(title, 19f, ink, Typeface.BOLD))
        copy.addView(text(subtitle, 12f, muted, Typeface.NORMAL))
        block.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        if (action != null) {
            block.addView(text(action, 13f, brand, Typeface.BOLD).apply {
                setPadding(dp(10), dp(6), dp(2), dp(6))
                pressable()
                setOnClickListener { onAction() }
            })
        }
        return block
    }

    private fun actionGrid(): View {
        val grid = GridLayout(this).apply { columnCount = 2 }

        fun add(iconRes: Int, title: String, detail: String, onClick: () -> Unit) {
            val tile = actionTile(iconRes, title, detail, onClick)
            val params = GridLayout.LayoutParams().apply {
                width = 0
                height = GridLayout.LayoutParams.WRAP_CONTENT
                columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
                setMargins(dp(4), dp(4), dp(4), dp(4))
            }
            grid.addView(tile, params)
        }

        add(R.drawable.ic_sparkle, "AI support", "Ask the assistant") { openAi() }
        add(R.drawable.ic_shop, "Full catalog", "Every product in app") { render(Tab.Shop) }
        add(R.drawable.ic_truck, "Track order", "Follow your delivery") { startActivity(Intent(this, TrackOrderActivity::class.java)) }
        add(R.drawable.ic_store, "Vendors", "View trusted suppliers") { render(Tab.Vendors) }
        add(R.drawable.ic_wallet, "Become vendor", "Start selling tech") { startActivity(Intent(this, BecomeVendorActivity::class.java)) }
        add(R.drawable.ic_box, "Request item", "Source any product") { startActivity(Intent(this, RequestProductActivity::class.java)) }
        return grid.withMargins(bottom = 18)
    }

    private fun trustStrip(): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(8), dp(10), dp(8), dp(10))
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            elevation = dp(1).toFloat()
        }
        listOf(
            Triple(R.drawable.ic_shield, "Verified", "sellers"),
            Triple(R.drawable.ic_truck, "Local", "delivery"),
            Triple(R.drawable.ic_sparkle, "AI", "support")
        ).forEachIndexed { index, item ->
            val cell = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER
            }
            cell.addView(ImageView(this).apply {
                setImageResource(item.first)
                setColorFilter(if (index == 1) blue else brand)
            }, LinearLayout.LayoutParams(dp(20), dp(20)))
            val copy = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(7), 0, 0, 0)
            }
            copy.addView(text(item.second, 11f, ink, Typeface.BOLD))
            copy.addView(text(item.third, 10f, muted, Typeface.NORMAL))
            cell.addView(copy)
            row.addView(cell, LinearLayout.LayoutParams(0, wrap(), 1f))
        }
        return row.withMargins(bottom = 4)
    }

    private fun categoryLauncher(items: List<String>): View {
        val grid = GridLayout(this).apply {
            columnCount = 4
            setPadding(0, 0, 0, dp(4))
        }
        val fills = intArrayOf(
            softGreen,
            Color.rgb(232, 241, 245),
            Color.rgb(255, 247, 226),
            Color.rgb(253, 231, 234)
        )
        items.forEachIndexed { index, category ->
            val tile = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
                setPadding(dp(4), dp(6), dp(4), dp(6))
                pressable()
                setOnClickListener {
                    selectedCategory = category
                    displayedProducts = products.filter { it.category.equals(category, ignoreCase = true) }
                    render(Tab.Shop)
                }
            }
            val bubble = FrameLayout(this).apply {
                background = rounded(Color.TRANSPARENT, fills[index % fills.size], dp(24).toFloat())
            }
            bubble.addView(ImageView(this).apply {
                setImageResource(categoryIcon(category))
                setColorFilter(if (index % 4 == 1) blue else brand)
                setPadding(dp(12), dp(12), dp(12), dp(12))
            }, FrameLayout.LayoutParams(dp(48), dp(48)))
            tile.addView(bubble, LinearLayout.LayoutParams(dp(48), dp(48)))
            tile.addView(text(category, 11f, ink, Typeface.BOLD).apply {
                gravity = Gravity.CENTER
                maxLines = 2
                minLines = 2
                setPadding(0, dp(6), 0, 0)
            }, LinearLayout.LayoutParams(match(), wrap()))
            grid.addView(tile, GridLayout.LayoutParams().apply {
                width = 0
                height = GridLayout.LayoutParams.WRAP_CONTENT
                columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
            })
        }
        return grid.withMargins(bottom = 8)
    }

    private fun categoryIcon(category: String): Int = when {
        category.contains("car", ignoreCase = true) -> R.drawable.ic_truck
        category.contains("home", ignoreCase = true) || category.contains("apartment", ignoreCase = true) -> R.drawable.ic_home
        category.contains("mobile", ignoreCase = true) || category.contains("wear", ignoreCase = true) -> R.drawable.ic_person
        category.contains("beauty", ignoreCase = true) || category.contains("health", ignoreCase = true) -> R.drawable.ic_star
        category.contains("game", ignoreCase = true) || category.contains("audio", ignoreCase = true) -> R.drawable.ic_sparkle
        else -> R.drawable.ic_box
    }

    private fun categoryChips(items: List<String>): View {
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        items.forEach { item ->
            val active = item.equals(selectedCategory, ignoreCase = true)
            val chip = label(item, if (active) Color.WHITE else brand).apply {
                background = rounded(
                    if (active) brand else line,
                    if (active) brand else Color.WHITE,
                    dp(20).toFloat()
                )
                setPadding(dp(16), dp(9), dp(16), dp(9))
                pressable()
                setOnClickListener {
                    selectedCategory = item
                    displayedProducts = if (item == "All") products else products.filter { product ->
                        product.category.equals(item, ignoreCase = true)
                    }
                    render(Tab.Shop)
                }
            }
            val params = LinearLayout.LayoutParams(wrap(), wrap()).apply { rightMargin = dp(8) }
            row.addView(chip, params)
        }
        return HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(row)
        }.withMargins(bottom = 14)
    }

    private fun productCard(product: Product): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(12), dp(12), dp(12), dp(12))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(3).toFloat()
            pressable()
            setOnClickListener { openProduct(product) }
        }

        val image = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_INSIDE
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(product.color)
            setPadding(dp(20), dp(20), dp(20), dp(20))
            roundCorners(dp(14).toFloat())
        }
        loadImage(image, product.heroImage)

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, dp(8), 0)
        }
        copy.addView(text(product.category.uppercase(Locale.US), 10f, muted, Typeface.BOLD).apply {
            letterSpacing = 0.06f
        })
        copy.addView(text(product.name, 15f, ink, Typeface.BOLD).apply {
            maxLines = 2
            setPadding(0, dp(2), 0, dp(2))
        })
        copy.addView(text("RWF ${money.format(product.price)}", 16f, brand, Typeface.BOLD))
        val tag = product.stockLabel.ifBlank { product.badge }
        if (tag.isNotBlank()) {
            copy.addView(TextView(this).apply {
                text = tag
                textSize = 10f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(amber)
                background = rounded(Color.TRANSPARENT, Color.rgb(252, 246, 230), dp(9).toFloat())
                setPadding(dp(8), dp(3), dp(8), dp(3))
            }, LinearLayout.LayoutParams(wrap(), wrap()).apply { topMargin = dp(5) })
        }

        val add = TextView(this).apply {
            text = "＋"
            textSize = 20f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            background = rounded(Color.TRANSPARENT, brand, dp(19).toFloat())
            elevation = dp(2).toFloat()
            contentDescription = "Add to cart"
            pressable()
            setOnClickListener { addToCart(product) }
        }

        card.addView(image, LinearLayout.LayoutParams(dp(92), dp(92)))
        card.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        card.addView(add, LinearLayout.LayoutParams(dp(38), dp(38)))
        return card.withMargins(bottom = 12)
    }

    private fun cartCard(itemLine: Cart.Line): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(3).toFloat()
        }

        val product = products.firstOrNull { it.slug == itemLine.slug }
        if (product != null) {
            val image = ImageView(this).apply {
                scaleType = ImageView.ScaleType.CENTER_INSIDE
                setImageResource(android.R.drawable.ic_menu_gallery)
                setColorFilter(Color.WHITE)
                setBackgroundColor(product.color)
                setPadding(dp(12), dp(12), dp(12), dp(12))
                roundCorners(dp(12).toFloat())
            }
            loadImage(image, product.heroImage)
            card.addView(image, LinearLayout.LayoutParams(dp(56), dp(56)))
        }

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, dp(8), 0)
        }
        copy.addView(text(itemLine.name, 15f, ink, Typeface.BOLD).apply { maxLines = 2 })
        copy.addView(text("RWF ${money.format(itemLine.price)}", 14f, brand, Typeface.BOLD))

        val stepper = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        stepper.addView(stepButton("−") { changeQty(itemLine.slug, -1) })
        stepper.addView(text(itemLine.qty.toString(), 16f, ink, Typeface.BOLD).apply {
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(dp(32), wrap())
        })
        stepper.addView(stepButton("+") { changeQty(itemLine.slug, 1) })

        card.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        card.addView(stepper)
        return card.withMargins(bottom = 12)
    }

    private fun stepButton(symbol: String, onClick: () -> Unit): View {
        return TextView(this).apply {
            text = symbol
            textSize = 18f
            gravity = Gravity.CENTER
            setTextColor(brand)
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            layoutParams = LinearLayout.LayoutParams(dp(34), dp(34))
            pressable()
            setOnClickListener { onClick() }
        }
    }

    private fun vendorCard(vendor: Vendor): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(3).toFloat()
        }

        val top = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val avatar = TextView(this).apply {
            text = vendor.name.trim().take(1).uppercase(Locale.US)
            textSize = 18f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            background = gradient(brand, brandDark, dp(22).toFloat())
        }
        top.addView(avatar, LinearLayout.LayoutParams(dp(44), dp(44)).apply { rightMargin = dp(12) })
        top.addView(text(vendor.name, 17f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wrap(), 1f))
        if (vendor.rating > 0) {
            top.addView(TextView(this).apply {
                text = "★ ${String.format(Locale.US, "%.1f", vendor.rating)}"
                textSize = 13f
                setTextColor(amber)
                typeface = Typeface.DEFAULT_BOLD
                background = rounded(Color.TRANSPARENT, Color.rgb(252, 246, 230), dp(12).toFloat())
                setPadding(dp(10), dp(5), dp(10), dp(5))
            })
        }

        card.addView(top)
        card.addView(text("${vendor.location} · ${vendor.headline}", 14f, muted, Typeface.NORMAL).apply {
            setPadding(0, dp(8), 0, 0)
        })
        card.addView(label("${vendor.activeProducts} products · ${vendor.responseTime}", brand))
        card.addView(secondaryButton("View vendor") {
            startActivity(Intent(this, VendorProfileActivity::class.java).putExtra("slug", vendor.slug))
        })
        return card.withMargins(bottom = 12)
    }

    private fun aiSupportBanner(): View {
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(20))
            background = gradient(brand, brandDark, dp(20).toFloat())
            elevation = dp(6).toFloat()
        }
        panel.addView(label("● SuperTech AI", Color.argb(220, 255, 255, 255)))
        panel.addView(text("Need help? Ask AI support", 20f, Color.WHITE, Typeface.BOLD))
        panel.addView(text("Find products, track orders, and get vendor help instantly — right inside the app.", 14f, Color.argb(215, 255, 255, 255), Typeface.NORMAL))
        panel.addView(onBrandButton("Open AI support") { openAi() })
        return panel.withMargins(bottom = 18)
    }

    private fun menuSection(title: String): View {
        return text(title.uppercase(Locale.US), 12f, muted, Typeface.BOLD).apply {
            letterSpacing = 0.1f
            setPadding(dp(2), dp(16), 0, dp(8))
        }
    }

    private fun menuRow(title: String, subtitle: String, iconRes: Int = R.drawable.ic_chevron, onClick: () -> Unit): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(13), dp(14), dp(13))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
            pressable()
            setOnClickListener { onClick() }
        }
        val bubble = FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, softGreen, dp(20).toFloat())
        }
        bubble.addView(ImageView(this).apply {
            setImageResource(iconRes)
            setColorFilter(brand)
            setPadding(dp(9), dp(9), dp(9), dp(9))
        }, FrameLayout.LayoutParams(dp(40), dp(40)))

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, dp(8), 0)
        }
        copy.addView(text(title, 16f, ink, Typeface.BOLD))
        copy.addView(text(subtitle, 13f, muted, Typeface.NORMAL))

        val chevron = ImageView(this).apply {
            setImageResource(R.drawable.ic_chevron)
            setColorFilter(muted)
        }
        row.addView(bubble, LinearLayout.LayoutParams(dp(40), dp(40)))
        row.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        row.addView(chevron, LinearLayout.LayoutParams(dp(20), dp(20)))
        return row.withMargins(bottom = 10)
    }

    private fun stateBlock(): View? {
        val error = loadError ?: return null
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(3).toFloat()
        }
        panel.addView(text("Connection problem", 17f, ink, Typeface.BOLD))
        panel.addView(text(error, 13f, muted, Typeface.NORMAL))
        panel.addView(primaryButton("Try again") { loadMarketplace() })
        return panel.withMargins(bottom = 14)
    }

    private fun emptyCard(title: String, detail: String): View {
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(16), dp(24), dp(16), dp(24))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
        }
        val bubble = FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, softGreen, dp(28).toFloat())
        }
        bubble.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_box)
            setColorFilter(brand)
            setPadding(dp(14), dp(14), dp(14), dp(14))
        }, FrameLayout.LayoutParams(dp(56), dp(56)))
        panel.addView(bubble, LinearLayout.LayoutParams(dp(56), dp(56)).apply { bottomMargin = dp(12) })
        panel.addView(text(title, 17f, ink, Typeface.BOLD).apply { gravity = Gravity.CENTER })
        panel.addView(text(detail, 13f, muted, Typeface.NORMAL).apply { gravity = Gravity.CENTER })
        return panel.withMargins(bottom = 14)
    }

    private fun skeletonCard(): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(12), dp(12), dp(12), dp(12))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
        }
        val thumb = View(this).apply { background = rounded(Color.TRANSPARENT, skeleton, dp(12).toFloat()) }
        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
        }
        copy.addView(skeletonBar(0.7f, 16))
        copy.addView(skeletonBar(0.4f, 12).withTopMargin(8))
        copy.addView(skeletonBar(0.55f, 14).withTopMargin(8))

        card.addView(thumb, LinearLayout.LayoutParams(dp(84), dp(84)))
        card.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))

        return card.withMargins(bottom = 12)
    }

    private fun clearTransientAnimations(view: View) {
        view.animate().cancel()
        view.clearAnimation()
        if (view is android.view.ViewGroup) {
            for (index in 0 until view.childCount) {
                clearTransientAnimations(view.getChildAt(index))
            }
        }
    }

    private fun skeletonBar(widthFraction: Float, height: Int): View {
        return View(this).apply {
            background = rounded(Color.TRANSPARENT, skeleton, dp(6).toFloat())
            layoutParams = LinearLayout.LayoutParams(0, dp(height)).apply { weight = widthFraction }
        }
    }

    private fun divider(): View {
        return View(this).apply {
            setBackgroundColor(line)
            layoutParams = LinearLayout.LayoutParams(match(), dp(1)).apply {
                topMargin = dp(6); bottomMargin = dp(6)
            }
        }
    }

    private fun summaryRow(label: String, value: String): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(10), 0, dp(10))
        }
        row.addView(text(label, 16f, muted, Typeface.NORMAL), LinearLayout.LayoutParams(0, wrap(), 1f))
        row.addView(text(value, 16f, ink, Typeface.BOLD))
        return row
    }

    private fun sectionTitle(title: String, subtitle: String): View {
        val block = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, dp(4), 0, dp(10))
        }
        block.addView(text(title, 20f, ink, Typeface.BOLD))
        block.addView(text(subtitle, 13f, muted, Typeface.NORMAL))
        return block
    }

    private fun primaryButton(label: String, onClick: () -> Unit): View {
        return Button(this).apply {
            text = label
            textSize = 14f
            isAllCaps = false
            setTextColor(ColorStateList.valueOf(Color.WHITE))
            backgroundTintList = null
            background = rounded(Color.TRANSPARENT, brand, dp(14).toFloat())
            elevation = dp(2).toFloat()
            stateListAnimator = null
            pressable()
            setOnClickListener { onClick() }
        }.withMargins(top = 12, height = 48)
    }

    private fun secondaryButton(label: String, onClick: () -> Unit): View {
        return Button(this).apply {
            text = label
            textSize = 14f
            isAllCaps = false
            setTextColor(ColorStateList.valueOf(brand))
            backgroundTintList = null
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            stateListAnimator = null
            pressable()
            setOnClickListener { onClick() }
        }.withMargins(top = 10, height = 46)
    }

    private fun onBrandButton(label: String, onClick: () -> Unit): View {
        return Button(this).apply {
            text = label
            textSize = 14f
            isAllCaps = false
            setTextColor(ColorStateList.valueOf(brand))
            backgroundTintList = null
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(14).toFloat())
            elevation = dp(2).toFloat()
            stateListAnimator = null
            pressable()
            setOnClickListener { onClick() }
        }.withMargins(top = 14, height = 48)
    }

    private fun ghostButton(label: String, onClick: () -> Unit): View {
        return Button(this).apply {
            text = label
            textSize = 14f
            isAllCaps = false
            setTextColor(ColorStateList.valueOf(Color.WHITE))
            backgroundTintList = null
            background = rounded(Color.argb(100, 255, 255, 255), Color.TRANSPARENT, dp(14).toFloat())
            stateListAnimator = null
            pressable()
            setOnClickListener { onClick() }
        }.withMargins(top = 10, height = 46)
    }

    private fun actionTile(iconRes: Int, title: String, detail: String, onClick: () -> Unit): View {
        val tile = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
            pressable()
            setOnClickListener { onClick() }
        }
        val bubble = FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, softGreen, dp(18).toFloat())
        }
        bubble.addView(ImageView(this).apply {
            setImageResource(iconRes)
            setColorFilter(brand)
            setPadding(dp(7), dp(7), dp(7), dp(7))
        }, FrameLayout.LayoutParams(dp(36), dp(36)))
        tile.addView(bubble, LinearLayout.LayoutParams(dp(36), dp(36)).apply { bottomMargin = dp(10) })
        tile.addView(text(title, 15f, ink, Typeface.BOLD))
        tile.addView(text(detail, 12f, muted, Typeface.NORMAL))
        return tile
    }

    private fun renderTabs() {
        bottomTabs.removeAllViews()
        Tab.values().forEach { tab ->
            val active = tab == currentTab

            // Material-3 style item: icon inside a pill, label centered below.
            val item = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL
                pressable()
                setOnClickListener { if (tab != currentTab) render(tab) }
            }

            val pill = FrameLayout(this).apply {
                background = rounded(Color.TRANSPARENT, if (active) softGreen else Color.WHITE, dp(15).toFloat())
            }
            val icon = ImageView(this).apply {
                setImageResource(tab.iconRes)
                setColorFilter(if (active) brand else muted)
            }
            pill.addView(icon, FrameLayout.LayoutParams(dp(22), dp(22), Gravity.CENTER))

            if (tab == Tab.Cart && cartCount() > 0) {
                pill.addView(TextView(this).apply {
                    text = cartCount().toString()
                    textSize = 9f
                    gravity = Gravity.CENTER
                    setTextColor(Color.WHITE)
                    typeface = Typeface.DEFAULT_BOLD
                    background = rounded(Color.TRANSPARENT, Color.rgb(214, 64, 64), dp(8).toFloat())
                }, FrameLayout.LayoutParams(dp(16), dp(16), Gravity.TOP or Gravity.END))
            }

            val labelView = TextView(this).apply {
                text = tab.label
                gravity = Gravity.CENTER
                textSize = 11f
                typeface = if (active) Typeface.DEFAULT_BOLD else Typeface.DEFAULT
                setTextColor(if (active) brand else muted)
            }

            item.addView(pill, LinearLayout.LayoutParams(dp(52), dp(30)))
            item.addView(labelView, LinearLayout.LayoutParams(wrap(), wrap()).apply {
                topMargin = dp(4)
                gravity = Gravity.CENTER_HORIZONTAL
            })

            bottomTabs.addView(item, LinearLayout.LayoutParams(0, match(), 1f))
        }
    }

    // ---- Cart ----

    private fun addToCart(product: Product) {
        Cart.add(product.slug, product.name, product.price)
        Toast.makeText(this, "${product.name} added to cart", Toast.LENGTH_SHORT).show()
        bumpCartTab()
    }

    private fun changeQty(slug: String, delta: Int) {
        Cart.changeQty(slug, delta)
        render(Tab.Cart)
    }

    private fun cartCount(): Int = Cart.count()

    private fun bumpCartTab() {
        // Rebuild tabs so the badge updates, then pulse the cart tab.
        renderTabs()
        val cartIndex = Tab.values().indexOf(Tab.Cart)
        bottomTabs.getChildAt(cartIndex)?.let { v ->
            v.animate().scaleX(1.18f).scaleY(1.18f).setDuration(120)
                .setInterpolator(OvershootInterpolator()).withEndAction {
                    v.animate().scaleX(1f).scaleY(1f).setDuration(120).start()
                }.start()
        }
    }

    // ---- Parsing ----

    private fun parseProducts(array: JSONArray): List<Product> {
        return (0 until array.length()).mapNotNull { index ->
            val item = array.optJSONObject(index) ?: return@mapNotNull null
            Product(
                slug = item.optString("slug"),
                name = item.optString("name", "Product"),
                category = item.optString("category", "Tech"),
                badge = item.optString("badge"),
                description = item.optString("description"),
                price = item.optDouble("price", 0.0),
                stockLabel = item.optString("stockLabel"),
                accent = item.optString("accent"),
                heroImage = item.optString("heroImage"),
                features = parseStrings(item.optJSONArray("features") ?: JSONArray()),
                vendorSlug = item.optString("vendorSlug"),
                featured = item.optBoolean("featured", false)
            )
        }
    }

    private fun parseVendors(array: JSONArray): List<Vendor> {
        return (0 until array.length()).mapNotNull { index ->
            val item = array.optJSONObject(index) ?: return@mapNotNull null
            Vendor(
                slug = item.optString("slug"),
                name = item.optString("name", "Vendor"),
                headline = item.optString("headline", "SuperTech vendor"),
                location = item.optString("location", "Rwanda"),
                responseTime = item.optString("responseTime", "Fast response"),
                rating = item.optDouble("rating", 0.0),
                activeProducts = item.optInt("activeProducts", 0)
            )
        }
    }

    private fun parseStrings(array: JSONArray): List<String> {
        return (0 until array.length()).mapNotNull { index ->
            array.optString(index).takeIf { it.isNotBlank() }
        }
    }

    private fun localSearch(query: String): List<Product> {
        val terms = query.lowercase(Locale.US).split(Regex("[^a-z0-9]+")).filter { it.length > 1 }
        if (terms.isEmpty()) return products
        return products.filter { product ->
            val text = "${product.name} ${product.category} ${product.description}".lowercase(Locale.US)
            terms.any { term -> text.contains(term) }
        }
    }

    // ---- Networking ----

    private fun loadImage(target: ImageView, rawUrl: String) {
        val url = normalizeImage(rawUrl) ?: return
        imageCache[url]?.let { applyImage(target, it, animate = false); return }
        target.setTag(R_TAG_KEY, url)
        imageExecutor.execute {
            try {
                val connection = URL(url).openConnection() as HttpURLConnection
                connection.connectTimeout = 12000
                connection.readTimeout = 12000
                connection.instanceFollowRedirects = true
                val bitmap = connection.inputStream.use { BitmapFactory.decodeStream(it) }
                connection.disconnect()
                if (bitmap != null) {
                    imageCache[url] = bitmap
                    runOnUiThread {
                        // Guard against recycled cards: only apply if still the target.
                        if (target.getTag(R_TAG_KEY) == url) applyImage(target, bitmap, animate = true)
                    }
                }
            } catch (_: Exception) {
                // Keep the colored placeholder on failure.
            }
        }
    }

    private fun applyImage(target: ImageView, bitmap: Bitmap, animate: Boolean) {
        target.setImageBitmap(bitmap)
        target.scaleType = ImageView.ScaleType.CENTER_CROP
        target.clearColorFilter()
        target.setBackgroundColor(Color.TRANSPARENT)
        target.setPadding(0, 0, 0, 0)
        if (animate) {
            target.alpha = 0f
            target.animate().alpha(1f).setDuration(240).start()
        }
    }

    private fun normalizeImage(raw: String): String? {
        val value = raw.trim()
        if (value.isBlank()) return null
        return when {
            value.startsWith("http", ignoreCase = true) -> value
            value.startsWith("//") -> "https:$value"
            value.startsWith("/") -> "$apiBase$value"
            else -> "$apiBase/$value"
        }
    }

    private fun openAi() {
        startActivity(Intent(this, AiSupportActivity::class.java))
    }

    private fun openProduct(product: Product) {
        startActivity(Intent(this, ProductDetailActivity::class.java).apply {
            putExtra("slug", product.slug)
            putExtra("name", product.name)
            putExtra("category", product.category)
            putExtra("description", product.description)
            putExtra("price", product.price)
            putExtra("stockLabel", product.stockLabel)
            putExtra("badge", product.badge)
            putExtra("accent", product.accent)
            putExtra("heroImage", product.heroImage)
            putExtra("features", ArrayList(product.features))
        })
    }

    /** Account button: jump to the dashboard if signed in, otherwise sign in. */
    private fun openAccount() {
        val target = if (Net.isLoggedIn()) DashboardActivity::class.java else SignInActivity::class.java
        startActivity(Intent(this, target))
    }

    private fun aiFab(): View {
        val fab = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = gradient(brand, brandDark, dp(28).toFloat())
            elevation = dp(12).toFloat()
            setPadding(dp(18), dp(14), dp(20), dp(14))
            pressable()
            setOnClickListener { openAi() }
        }
        fab.addView(ImageView(this).apply { setImageResource(R.drawable.ic_sparkle); setColorFilter(Color.WHITE) }, LinearLayout.LayoutParams(dp(20), dp(20)))
        fab.addView(text("AI Support", 14f, Color.WHITE, Typeface.BOLD).apply { setPadding(dp(8), 0, 0, 0) })
        return fab
    }

    private fun hideKeyboard() {
        currentFocus?.let { v ->
            val imm = getSystemService(INPUT_METHOD_SERVICE) as? android.view.inputmethod.InputMethodManager
            imm?.hideSoftInputFromWindow(v.windowToken, 0)
            v.clearFocus()
        }
    }

    // ---- View helpers ----

    private fun text(value: String, size: Float, color: Int, style: Int): TextView {
        return TextView(this).apply {
            text = value
            textSize = size
            setTextColor(color)
            typeface = Typeface.create(Typeface.DEFAULT, style)
            includeFontPadding = true
            setLineSpacing(0f, 1.08f)
        }
    }

    private fun label(value: String, color: Int): TextView {
        return text(value, 12f, color, Typeface.BOLD).apply {
            setPadding(0, dp(6), dp(10), dp(6))
        }
    }

    private fun View.withMargins(
        left: Int = 0,
        top: Int = 0,
        right: Int = 0,
        bottom: Int = 0,
        height: Int = wrap()
    ): View {
        layoutParams = LinearLayout.LayoutParams(match(), if (height == wrap()) wrap() else dp(height)).apply {
            setMargins(dp(left), dp(top), dp(right), dp(bottom))
        }
        return this
    }

    private fun View.withTopMargin(top: Int): View {
        layoutParams = LinearLayout.LayoutParams(
            (layoutParams as? LinearLayout.LayoutParams)?.width ?: match(),
            (layoutParams as? LinearLayout.LayoutParams)?.height ?: wrap()
        ).apply {
            (this@withTopMargin.layoutParams as? LinearLayout.LayoutParams)?.let { weight = it.weight }
            topMargin = dp(top)
        }
        return this
    }

    /** Entrance animation: fade + rise, staggered by list position. */
    private fun View.animateIn(position: Int): View {
        alpha = 0f
        translationY = dp(16).toFloat()
        animate()
            .alpha(1f)
            .translationY(0f)
            .setStartDelay((position.coerceAtMost(8) * 45).toLong())
            .setDuration(260)
            .setInterpolator(DecelerateInterpolator())
            .start()
        return this
    }

    /** Tactile press feedback without consuming the click. */
    @SuppressLint("ClickableViewAccessibility")
    private fun View.pressable(): View {
        setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN ->
                    v.animate().scaleX(0.96f).scaleY(0.96f).setDuration(90).start()
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL ->
                    v.animate().scaleX(1f).scaleY(1f).setDuration(140)
                        .setInterpolator(OvershootInterpolator()).start()
            }
            false
        }
        return this
    }

    private fun ImageView.roundCorners(radius: Float) {
        clipToOutline = true
        outlineProvider = object : ViewOutlineProvider() {
            override fun getOutline(view: View, outline: Outline) {
                outline.setRoundRect(0, 0, view.width, view.height, radius)
            }
        }
    }

    private fun rounded(stroke: Int, fill: Int, radius: Float): GradientDrawable {
        return GradientDrawable().apply {
            setColor(fill)
            cornerRadius = radius
            if (stroke != Color.TRANSPARENT) setStroke(dp(1), stroke)
        }
    }

    private fun gradient(start: Int, end: Int, radius: Float): GradientDrawable {
        return GradientDrawable(
            GradientDrawable.Orientation.TL_BR,
            intArrayOf(start, end)
        ).apply { cornerRadius = radius }
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
    private fun match() = LinearLayout.LayoutParams.MATCH_PARENT
    private fun wrap() = LinearLayout.LayoutParams.WRAP_CONTENT

    private enum class Tab(val label: String, val iconRes: Int) {
        Home("Home", R.drawable.ic_home),
        Shop("Shop", R.drawable.ic_shop),
        Vendors("Vendors", R.drawable.ic_store),
        Cart("Cart", R.drawable.ic_cart),
        Menu("Menu", R.drawable.ic_menu)
    }

    private data class Product(
        val slug: String,
        val name: String,
        val category: String,
        val badge: String,
        val description: String,
        val price: Double,
        val stockLabel: String,
        val accent: String,
        val heroImage: String,
        val features: List<String>,
        val vendorSlug: String,
        val featured: Boolean
    ) {
        val color: Int
            get() = try {
                Color.parseColor(accent)
            } catch (_: Exception) {
                Color.rgb(44, 105, 204)
            }
    }

    private data class Vendor(
        val slug: String,
        val name: String,
        val headline: String,
        val location: String,
        val responseTime: String,
        val rating: Double,
        val activeProducts: Int
    )

    private companion object {
        // Stable key for tagging async image targets.
        const val R_TAG_KEY = 0x7f5a0001
    }
}
