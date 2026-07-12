package africa.supertech.marketplace

import android.annotation.SuppressLint
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Outline
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
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
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import org.json.JSONArray
import org.json.JSONObject
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

    // Website-aligned tokens
    private val ink = Color.rgb(49, 49, 51)
    private val muted = Color.rgb(117, 117, 122)
    private val line = Color.rgb(228, 229, 233)
    private val page = Color.rgb(245, 244, 240) // canvas base
    private val brand = Color.rgb(232, 119, 10)
    private val brandDark = Color.rgb(208, 106, 8)
    private val softGreen = Color.rgb(255, 244, 229)
    private val amber = Color.rgb(245, 166, 42)
    private val gold = Color.rgb(245, 166, 42)
    private val likeRose = Color.rgb(225, 29, 72)
    private val danger = Color.rgb(224, 36, 36)
    private val skeleton = Color.rgb(229, 229, 231)
    private val blue = Color.rgb(39, 96, 118)
    private val backgroundStrong = Color.rgb(10, 15, 26)
    private val blueStart = Color.rgb(11, 61, 145)
    private val blueMid = Color.rgb(21, 101, 192)
    private val blueEnd = Color.rgb(13, 71, 161)

    private val supportPhoneTel = "+250783998231"
    private val supportWhatsApp =
        "https://wa.me/250783998231?text=" + Uri.encode("Hello SuperTech, I need help shopping.")

    private lateinit var content: LinearLayout
    private lateinit var bottomTabs: LinearLayout
    private lateinit var swipe: SwipeRefreshLayout
    private lateinit var shellRoot: LinearLayout
    private lateinit var shellFrame: FrameLayout
    private lateinit var pinnedHeader: LinearLayout
    private lateinit var cartSticky: LinearLayout
    private lateinit var aiFabView: View
    private lateinit var appCanvas: AppCanvasView
    private lateinit var contentScroll: ScrollView
    private var headerSearch: EditText? = null
    private var browseOverlay: View? = null
    private var searchSuggestPanel: LinearLayout? = null
    private var searchSuggestOpen = false
    private val suggestHandler = android.os.Handler(android.os.Looper.getMainLooper())
    private var suggestRunnable: Runnable? = null
    private var currentTab = Tab.Home
    private var browseSheetOpen = false
    private var dockHeightPx = 0
    private var isLoading = true
    private var loadError: String? = null
    private var products = emptyList<Product>()
    private var displayedProducts = emptyList<Product>()
    private var vendors = emptyList<Vendor>()
    private var categories = listOf("All")
    private var selectedCategory = "All"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        Wishlist.init(this)
        window.statusBarColor = backgroundStrong
        window.navigationBarColor = backgroundStrong

        // Structure:
        //   appCanvas (ambient, under all)
        //   pinnedHeader (never scrolls)
        //   shellFrame [swipe content + browse overlay]
        //   dock (never covered by browse)
        shellRoot = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.TRANSPARENT)
        }

        pinnedHeader = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            elevation = dp(8).toFloat()
        }

        content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, 0, 0, dp(28))
            setBackgroundColor(Color.TRANSPARENT)
        }

        contentScroll = ScrollView(this).apply {
            isFillViewport = false
            overScrollMode = View.OVER_SCROLL_NEVER
            setBackgroundColor(Color.TRANSPARENT)
            addView(content)
            viewTreeObserver.addOnScrollChangedListener {
                if (currentTab == Tab.Home && ::appCanvas.isInitialized) {
                    val span = (resources.displayMetrics.heightPixels * 1.1f).toInt()
                    appCanvas.scrollT = AppCanvasView.scrollProgress(scrollY, span)
                }
            }
        }

        swipe = SwipeRefreshLayout(this).apply {
            setColorSchemeColors(brand)
            setProgressBackgroundColorSchemeColor(Color.WHITE)
            setOnRefreshListener { loadMarketplace(fromSwipe = true) }
            setBackgroundColor(Color.TRANSPARENT)
            addView(contentScroll)
        }

        shellFrame = FrameLayout(this).apply {
            setBackgroundColor(Color.TRANSPARENT)
            addView(swipe, FrameLayout.LayoutParams(match(), match()))
        }

        // Website-style search suggestions dropdown (over content, under header)
        searchSuggestPanel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
            elevation = dp(16).toFloat()
            visibility = View.GONE
            setPadding(0, 0, 0, dp(8))
            background = GradientDrawable().apply {
                setColor(Color.WHITE)
                setStroke(dp(1), line)
                cornerRadii = floatArrayOf(0f, 0f, 0f, 0f, dp(14).toFloat(), dp(14).toFloat(), dp(14).toFloat(), dp(14).toFloat())
            }
        }
        shellFrame.addView(
            searchSuggestPanel,
            FrameLayout.LayoutParams(match(), wrap(), Gravity.TOP)
        )

        bottomTabs = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(2), dp(6), dp(2), dp(8))
            setBackgroundColor(backgroundStrong)
            elevation = dp(20).toFloat()
        }

        cartSticky = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.WHITE)
            elevation = dp(12).toFloat()
            setPadding(dp(14), dp(12), dp(14), dp(12))
            visibility = View.GONE
        }

        shellRoot.addView(pinnedHeader, LinearLayout.LayoutParams(match(), wrap()))
        shellRoot.addView(shellFrame, LinearLayout.LayoutParams(match(), 0, 1f))
        shellRoot.addView(cartSticky, LinearLayout.LayoutParams(match(), wrap()))
        shellRoot.addView(bottomTabs, LinearLayout.LayoutParams(match(), dp(64)))

        // Apply system nav-bar inset so dock never sits under gesture bar
        ViewCompat.setOnApplyWindowInsetsListener(bottomTabs) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(dp(2), dp(6), dp(2), dp(8) + bars.bottom)
            v.layoutParams = (v.layoutParams as LinearLayout.LayoutParams).apply {
                height = dp(56) + bars.bottom + dp(8)
            }
            dockHeightPx = v.layoutParams.height
            insets
        }

        appCanvas = AppCanvasView(this).apply { zone = AppCanvasView.Zone.STOREFRONT }
        val outer = FrameLayout(this)
        outer.addView(appCanvas, FrameLayout.LayoutParams(match(), match()))
        outer.addView(shellRoot, FrameLayout.LayoutParams(match(), match()))
        aiFabView = aiFab()
        val fabParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.BOTTOM or Gravity.END
        ).apply { setMargins(0, 0, dp(16), dp(80)) }
        outer.addView(aiFabView, fabParams)
        setContentView(outer)
        requestNotificationPermissionIfNeeded()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                when {
                    searchSuggestOpen -> hideSearchSuggestions()
                    browseSheetOpen -> closeBrowseSheet()
                    else -> {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                        isEnabled = true
                    }
                }
            }
        })

        // Deep-link from global dock / intents, else last shell tab
        applyOpenIntent(intent)
        loadMarketplace()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        applyOpenIntent(intent)
    }

    /** Handle openTab / openBrowse extras from global bottom dock on other screens. */
    private fun applyOpenIntent(intent: Intent?) {
        val openTab = intent?.getStringExtra("openTab")
        val openBrowse = intent?.getBooleanExtra("openBrowse", false) == true
        val startTab = when (openTab) {
            "Shop" -> Tab.Shop
            "Stores" -> Tab.Stores
            "Cart" -> Tab.Cart
            "Home" -> Tab.Home
            else -> when (ShellPrefs.lastTab(this, "Home")) {
                "Shop" -> Tab.Shop
                "Stores" -> Tab.Stores
                else -> Tab.Home
            }
        }
        render(startTab)
        if (openBrowse) {
            content.post {
                if (!browseSheetOpen) openBrowseSheet()
            }
        }
        // Clear so rotate/recreate doesn't re-open browse forever
        intent?.removeExtra("openBrowse")
    }

    override fun onDestroy() {
        executor.shutdownNow()
        imageExecutor.shutdownNow()
        super.onDestroy()
    }

    private fun loadMarketplace(fromSwipe: Boolean = false) {
        MarketplaceCache.init(this)
        // Stale-while-revalidate: paint cache immediately when available
        val cached = MarketplaceCache.get()
        if (cached != null && products.isEmpty() && !fromSwipe) {
            applyMarketplaceJson(cached, fromCache = true)
        }

        isLoading = products.isEmpty()
        loadError = null
        if (!fromSwipe) render(currentTab)

        executor.execute {
            try {
                val result = Net.get("/api/mobile/marketplace")
                if (!result.ok) error(result.errorMessage("Marketplace request failed (${result.code})."))
                val json = result.json()
                MarketplaceCache.put(this@MainActivity, json)
                runOnUiThread {
                    applyMarketplaceJson(json, fromCache = false)
                    swipe.isRefreshing = false
                    render(currentTab)
                }
            } catch (error: Exception) {
                runOnUiThread {
                    isLoading = false
                    // Keep cached content if we have it
                    if (products.isEmpty()) {
                        loadError = error.message ?: "Could not load SuperTech data. Check internet and try again."
                    } else {
                        loadError = null
                        Toast.makeText(this, "Using saved marketplace · refresh failed", Toast.LENGTH_SHORT).show()
                    }
                    swipe.isRefreshing = false
                    render(currentTab)
                }
            }
        }
    }

    private fun applyMarketplaceJson(json: JSONObject, fromCache: Boolean) {
        val nextProducts = parseProducts(json.optJSONArray("products") ?: JSONArray())
        val nextVendors = parseVendors(json.optJSONArray("vendors") ?: JSONArray())
        val nextCategories = parseStrings(json.optJSONArray("categories") ?: JSONArray()).ifEmpty {
            listOf("All")
        }
        products = nextProducts
        if (selectedCategory == "All" || displayedProducts.isEmpty()) {
            displayedProducts = nextProducts
        }
        vendors = nextVendors
        categories = if (nextCategories.firstOrNull() == "All") nextCategories else listOf("All") + nextCategories
        isLoading = false
        loadError = null
        if (fromCache && !MarketplaceCache.isFresh()) {
            // Soft indicator only via re-fetch already running
        }
    }

    private fun scheduleSearchSuggest(raw: String) {
        suggestRunnable?.let { suggestHandler.removeCallbacks(it) }
        val run = Runnable { showSearchSuggestions(raw) }
        suggestRunnable = run
        suggestHandler.postDelayed(run, 160)
    }

    private fun hideSearchSuggestions() {
        searchSuggestOpen = false
        searchSuggestPanel?.visibility = View.GONE
        searchSuggestPanel?.removeAllViews()
    }

    /**
     * Website-like suggest panel: products (image), stores, categories.
     * Uses local marketplace data immediately (same shapes as /api/search/suggest).
     */
    private fun showSearchSuggestions(raw: String) {
        val panel = searchSuggestPanel ?: return
        val q = raw.trim().lowercase(Locale.US)
        panel.removeAllViews()

        // Header
        val head = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(12), dp(10), dp(8))
        }
        head.addView(ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher)
            scaleType = ImageView.ScaleType.CENTER_CROP
            background = rounded(Color.TRANSPARENT, softGreen, dp(6).toFloat())
        }, LinearLayout.LayoutParams(dp(22), dp(22)).apply { rightMargin = dp(8) })
        head.addView(text(if (q.isEmpty()) "Popular on SuperTech" else "Suggestions", 13f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wrap(), 1f))
        head.addView(TextView(this).apply {
            text = "Close"
            textSize = 12f
            setTextColor(brand)
            typeface = Typeface.DEFAULT_BOLD
            setPadding(dp(8), dp(6), dp(8), dp(6))
            pressable()
            setOnClickListener { hideSearchSuggestions() }
        })
        panel.addView(head)

        val productHits = if (q.isEmpty()) {
            products.filter { it.featured }.ifEmpty { products }.take(5)
        } else {
            products.filter {
                "${it.name} ${it.category} ${it.vendorName} ${it.description}".lowercase(Locale.US).contains(q)
            }.take(5)
        }
        val vendorHits = if (q.isEmpty()) {
            vendors.take(3)
        } else {
            vendors.filter {
                "${it.name} ${it.headline} ${it.location}".lowercase(Locale.US).contains(q)
            }.take(4)
        }
        val catHits = if (q.isEmpty()) {
            categories.filter { it != "All" }.take(6)
        } else {
            categories.filter { it != "All" && it.lowercase(Locale.US).contains(q) }.take(5)
        }

        if (productHits.isEmpty() && vendorHits.isEmpty() && catHits.isEmpty()) {
            panel.addView(text("No matches — try another word or Request a product", 13f, muted, Typeface.NORMAL).apply {
                setPadding(dp(14), dp(8), dp(14), dp(14))
            })
            panel.visibility = View.VISIBLE
            searchSuggestOpen = true
            return
        }

        if (productHits.isNotEmpty()) {
            panel.addView(suggestSectionTitle("Products"))
            productHits.forEach { p ->
                panel.addView(suggestProductRow(p))
            }
        }
        if (vendorHits.isNotEmpty()) {
            panel.addView(suggestSectionTitle("Stores"))
            vendorHits.forEach { v ->
                panel.addView(suggestVendorRow(v))
            }
        }
        if (catHits.isNotEmpty()) {
            panel.addView(suggestSectionTitle("Categories"))
            catHits.forEach { cat ->
                panel.addView(suggestCategoryRow(cat))
            }
        }

        if (q.length >= 2) {
            panel.addView(TextView(this).apply {
                text = "Search all for “${raw.trim()}”"
                textSize = 13f
                setTextColor(brand)
                typeface = Typeface.DEFAULT_BOLD
                setPadding(dp(14), dp(12), dp(14), dp(14))
                pressable()
                setOnClickListener {
                    hideSearchSuggestions()
                    searchProducts(raw)
                }
            })
        }

        panel.visibility = View.VISIBLE
        searchSuggestOpen = true
    }

    private fun suggestSectionTitle(label: String): View {
        return text(label.uppercase(Locale.US), 11f, muted, Typeface.BOLD).apply {
            setPadding(dp(14), dp(10), dp(14), dp(4))
            letterSpacing = 0.06f
        }
    }

    private fun suggestProductRow(p: Product): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(12), dp(8), dp(12), dp(8))
            pressable()
            setOnClickListener {
                hideSearchSuggestions()
                hideKeyboard()
                openProduct(p)
            }
        }
        val thumb = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setBackgroundColor(p.color)
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setPadding(dp(8), dp(8), dp(8), dp(8))
        }
        if (p.heroImage.isNotBlank()) loadImage(thumb, p.heroImage)
        row.addView(thumb, LinearLayout.LayoutParams(dp(44), dp(44)).apply { rightMargin = dp(10) })
        val copy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        copy.addView(text(p.name, 14f, ink, Typeface.BOLD).apply { maxLines = 1; ellipsize = android.text.TextUtils.TruncateAt.END })
        copy.addView(text("RWF ${money.format(p.price)} · ${p.category}", 12f, muted, Typeface.NORMAL).apply { maxLines = 1 })
        row.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        return row
    }

    private fun suggestVendorRow(v: Vendor): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(12), dp(8), dp(12), dp(8))
            pressable()
            setOnClickListener {
                hideSearchSuggestions()
                hideKeyboard()
                startActivity(Intent(this@MainActivity, VendorProfileActivity::class.java).putExtra("slug", v.slug))
                overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
            }
        }
        val mark = TextView(this).apply {
            text = v.logoMark.ifBlank { v.name.take(1).uppercase(Locale.US) }
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            textSize = 13f
            background = gradient(brand, brandDark, dp(22).toFloat())
        }
        row.addView(mark, LinearLayout.LayoutParams(dp(44), dp(44)).apply { rightMargin = dp(10) })
        val copy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        copy.addView(text(v.name, 14f, ink, Typeface.BOLD).apply { maxLines = 1 })
        copy.addView(text("${v.activeProducts} products · ${v.location}", 12f, muted, Typeface.NORMAL).apply { maxLines = 1 })
        row.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        return row
    }

    private fun suggestCategoryRow(cat: String): View {
        return TextView(this).apply {
            text = cat
            textSize = 14f
            setTextColor(ink)
            typeface = Typeface.DEFAULT_BOLD
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = rounded(Color.TRANSPARENT, Color.TRANSPARENT, 0f)
            pressable()
            setOnClickListener {
                hideSearchSuggestions()
                hideKeyboard()
                selectedCategory = cat
                displayedProducts = products.filter { it.category.equals(cat, true) }
                render(Tab.Shop)
            }
        }
    }

    private fun searchProducts(query: String) {
        val cleanQuery = query.trim()
        if (cleanQuery.length < 2) return
        hideSearchSuggestions()
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
        if (tab == Tab.Browse) {
            // Toggle: open if closed, close if open — dock always stays usable
            if (browseSheetOpen) closeBrowseSheet() else openBrowseSheet()
            return
        }
        // Leaving Browse via another real destination closes sheet first
        if (browseSheetOpen && tab != Tab.Browse) closeBrowseSheet()

        if (tab == Tab.Request) {
            startActivity(Intent(this, RequestProductActivity::class.java))
            overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
            return
        }
        if (tab == Tab.Account) {
            openAccount()
            return
        }

        currentTab = tab
        // Remember last real shell tab for smarter relaunch
        if (tab == Tab.Home || tab == Tab.Shop || tab == Tab.Stores || tab == Tab.Cart) {
            ShellPrefs.saveTab(this, tab.name)
        }
        ensurePinnedHeader()
        if (tab != Tab.Cart) hideCartSticky()
        // AI chat must never cover cart checkout sticky
        if (::aiFabView.isInitialized) {
            if (tab == Tab.Cart || browseSheetOpen) {
                aiFabView.visibility = View.GONE
            } else {
                aiFabView.visibility = View.VISIBLE
                positionAiFab(aboveSticky = false)
            }
        }
        content.animate().cancel()
        clearTransientAnimations(content)
        content.alpha = 1f
        content.translationY = 0f
        content.removeAllViews()
        if (::appCanvas.isInitialized) {
            if (tab == Tab.Home) {
                // scrollT updates from scroll listener
            } else {
                appCanvas.scrollT = 1f // dim canvas when browsing lists
            }
        }
        when (tab) {
            Tab.Home -> renderHome()
            Tab.Shop -> renderShop()
            Tab.Stores -> renderVendors()
            Tab.Cart -> renderCart()
            Tab.Browse, Tab.Request, Tab.Account -> Unit
        }
        renderTabs()
        content.alpha = 0f
        content.translationY = dp(8).toFloat()
        content.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(220)
            .setInterpolator(DecelerateInterpolator())
            .start()
    }

    /** Keeps dark header fixed above the scroll surface (website mobile chrome). */
    private fun ensurePinnedHeader() {
        if (pinnedHeader.childCount == 0) {
            pinnedHeader.addView(darkShopperHeader(), LinearLayout.LayoutParams(match(), wrap()))
        }
    }

    private fun renderHome() {
        content.addView(heroCarousel())
        if (!isLoading && categories.size > 1) {
            content.addView(blueCategoryRail(categories.filterNot { it == "All" }.take(12)))
        }
        content.addView(paddedSection {
            addView(trustStrip())
            if (isLoading) {
                addView(sectionHeader("Featured", "Loading live picks…", null) {})
                repeat(3) { addView(skeletonCard()) }
                return@paddedSection
            }
            stateBlock()?.let { addView(it) }

            val featured = products.filter { it.featured }.ifEmpty { products }.take(8)
            if (featured.isNotEmpty()) {
                addView(sectionHeader("Featured", "Hand-picked from the marketplace", "See all") { render(Tab.Shop) })
                addView(featuredCarousel(featured))
            }

            // 2-col grid for consistency with Shop (not horizontal list cards)
            val fresh = products.filterNot { it.featured }.take(6).ifEmpty { products.take(6) }
            if (fresh.isNotEmpty()) {
                addView(sectionHeader("Fresh on the market", "Latest products from vendors", "See all") { render(Tab.Shop) })
                addView(productGrid(fresh))
            }

            if (vendors.isNotEmpty()) {
                addView(sectionHeader("Top vendors", "Trusted sellers, fast response", "View all") { render(Tab.Stores) })
                addView(vendorStrip(vendors))
            }

            addView(sectionHeader("Quick actions", "Most-used shopper tools", null) {})
            addView(actionGrid())
        })
    }

    private fun paddedSection(build: LinearLayout.() -> Unit): View {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(12), dp(18), dp(8))
            build()
        }
    }

    private fun renderShop() {
        content.addView(paddedSection {
            val title = when {
                selectedCategory != "All" -> selectedCategory
                else -> "Shop"
            }
            addView(sectionHeader(title, "Browse verified listings", null) {})
            addView(categoryChips(categories))
            if (isLoading) {
                repeat(4) { addView(skeletonCard()) }
                return@paddedSection
            }
            stateBlock()?.let { addView(it) }
            if (loadError == null && displayedProducts.isEmpty()) {
                addView(emptyCard("No products found", "Try another category or request the product."))
                addView(primaryButton("Request a product") {
                    startActivity(Intent(this@MainActivity, RequestProductActivity::class.java))
                })
                return@paddedSection
            }
            if (loadError == null) {
                val countLabel = if (selectedCategory == "All") "${displayedProducts.size} products"
                else "${displayedProducts.size} in $selectedCategory"
                addView(text(countLabel, 12f, muted, Typeface.BOLD).withMargins(bottom = 8))
                addView(productGrid(displayedProducts))
            }
        })
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
                // Same retail product card everywhere (Home / Shop / popular / empty cart)
                rowView.addView(gridProductCard(product).animateIn(rowIndex), lp)
            }
            if (pair.size == 1) {
                rowView.addView(View(this), LinearLayout.LayoutParams(0, wrap(), 1f).apply { leftMargin = dp(5) })
            }
            grid.addView(rowView, LinearLayout.LayoutParams(match(), wrap()))
        }
        return grid
    }

    /**
     * Website-parity retail card (product-card.tsx):
     * image + badges + white ♥ · vendor·★ · title · price · full Add + WhatsApp footer
     */
    private fun gridProductCard(product: Product): View {
        val mode = productMode(product.category)
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            elevation = dp(3).toFloat()
            clipToOutline = true
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, dp(14).toFloat())
                }
            }
        }

        val imageH = dp(148)
        val imageWrap = FrameLayout(this).apply {
            pressable()
            setOnClickListener { openProduct(product) }
        }
        val image = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(product.color)
            setPadding(dp(24), dp(24), dp(24), dp(24))
        }
        loadImage(image, product.heroImage)
        imageWrap.addView(image, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, imageH))

        // Badges top-start (mode / discount / stock / badge)
        val badgeCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(8), dp(8), dp(8), 0)
        }
        val discount = if (mode == "shop" && product.compareAt > product.price && product.compareAt > 0) {
            (((1.0 - product.price / product.compareAt) * 100).toInt()).coerceIn(1, 99)
        } else null
        if (discount != null) {
            badgeCol.addView(TextView(this).apply {
                text = "-$discount%"
                textSize = 10f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(Color.WHITE)
                background = rounded(Color.TRANSPARENT, brand, dp(6).toFloat())
                setPadding(dp(7), dp(3), dp(7), dp(3))
            }, LinearLayout.LayoutParams(wrap(), wrap()).apply { bottomMargin = dp(4) })
        }
        when (mode) {
            "motors", "property" -> {
                badgeCol.addView(TextView(this).apply {
                    text = if (mode == "motors") "Motors" else "Property"
                    textSize = 9f
                    typeface = Typeface.DEFAULT_BOLD
                    setTextColor(Color.WHITE)
                    background = rounded(Color.TRANSPARENT, blueMid, dp(6).toFloat())
                    setPadding(dp(7), dp(3), dp(7), dp(3))
                })
            }
            else -> {
                val tag = product.badge.ifBlank { product.stockLabel }
                if (tag.isNotBlank()) {
                    badgeCol.addView(TextView(this).apply {
                        text = tag
                        textSize = 9f
                        typeface = Typeface.DEFAULT_BOLD
                        setTextColor(ink)
                        background = rounded(Color.TRANSPARENT, Color.argb(242, 255, 255, 255), dp(6).toFloat())
                        setPadding(dp(7), dp(3), dp(7), dp(3))
                        maxLines = 1
                        ellipsize = android.text.TextUtils.TruncateAt.END
                    })
                }
            }
        }
        imageWrap.addView(badgeCol, FrameLayout.LayoutParams(wrap(), wrap(), Gravity.TOP or Gravity.START))

        // Website-style white wishlist circle
        imageWrap.addView(
            likeButtonOnImage(product.slug),
            FrameLayout.LayoutParams(dp(34), dp(34), Gravity.TOP or Gravity.END).apply {
                topMargin = dp(8); rightMargin = dp(8)
            }
        )

        card.addView(imageWrap, LinearLayout.LayoutParams(match(), imageH))

        val body = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(10), dp(10), dp(10), dp(8))
            pressable()
            setOnClickListener { openProduct(product) }
        }

        // Vendor · ★ rating | New
        val seller = product.vendorName.ifBlank { vendorName(product.vendorSlug).orEmpty() }
            .ifBlank { product.category }
        val ratingLabel = if (product.reviewCount > 0 && product.rating > 0) {
            String.format(Locale.US, "%.1f", product.rating)
        } else "New"
        val metaRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        metaRow.addView(text(seller, 11f, muted, Typeface.NORMAL).apply {
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
        }, LinearLayout.LayoutParams(0, wrap(), 1f))
        metaRow.addView(text("·", 11f, line, Typeface.NORMAL).apply {
            setPadding(dp(4), 0, dp(4), 0)
        })
        val starRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        starRow.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_star)
            setColorFilter(gold)
        }, LinearLayout.LayoutParams(dp(12), dp(12)).apply { rightMargin = dp(3) })
        starRow.addView(text(ratingLabel, 11f, ink, Typeface.BOLD))
        metaRow.addView(starRow)
        body.addView(metaRow)

        body.addView(text(product.name, 13f, ink, Typeface.BOLD).apply {
            maxLines = 2
            minLines = 2
            ellipsize = android.text.TextUtils.TruncateAt.END
            setPadding(0, dp(6), 0, dp(4))
        })

        // Price block
        val priceRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        priceRow.addView(text("RWF ${money.format(product.price)}", 15f, brand, Typeface.BOLD).apply {
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
        })
        if (mode != "shop") {
            priceRow.addView(text(" asking", 10f, muted, Typeface.BOLD).apply {
                setPadding(dp(4), 0, 0, 0)
            })
        } else if (product.compareAt > product.price) {
            priceRow.addView(TextView(this).apply {
                text = "RWF ${money.format(product.compareAt)}"
                textSize = 11f
                setTextColor(muted)
                paintFlags = paintFlags or android.graphics.Paint.STRIKE_THRU_TEXT_FLAG
                setPadding(dp(6), 0, 0, 0)
            })
        }
        body.addView(priceRow)
        if (product.stockLabel.isNotBlank() && mode == "shop") {
            body.addView(text(product.stockLabel, 11f, muted, Typeface.NORMAL).apply {
                setPadding(0, dp(2), 0, 0)
                maxLines = 1
            })
        }
        card.addView(body)

        // Footer: full Add/Enquire + WhatsApp (website parity)
        val footer = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(8), dp(8), dp(8), dp(8))
            background = GradientDrawable().apply {
                setColor(Color.WHITE)
                setStroke(dp(1), line)
            }
        }

        val primaryLabel = when (mode) {
            "motors", "property" -> "Enquire"
            else -> if (isOutOfStock(product.stockLabel)) "Request" else "Add"
        }
        val primary = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            background = rounded(Color.TRANSPARENT, brand, dp(8).toFloat())
            minimumHeight = dp(40)
            pressable()
            setOnClickListener {
                when {
                    mode != "shop" -> openProduct(product)
                    isOutOfStock(product.stockLabel) -> {
                        startActivity(Intent(this@MainActivity, RequestProductActivity::class.java).apply {
                            putExtra("productName", product.name)
                            putExtra("category", product.category)
                        })
                        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
                    }
                    else -> addToCart(product)
                }
            }
        }
        if (mode == "shop" && !isOutOfStock(product.stockLabel)) {
            primary.addView(ImageView(this).apply {
                setImageResource(R.drawable.ic_cart)
                setColorFilter(Color.WHITE)
            }, LinearLayout.LayoutParams(dp(16), dp(16)).apply { rightMargin = dp(6) })
        }
        primary.addView(text(primaryLabel, 12f, Color.WHITE, Typeface.BOLD))
        footer.addView(primary, LinearLayout.LayoutParams(0, dp(40), 1f).apply { rightMargin = dp(6) })

        val wa = FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, Color.rgb(31, 174, 91), dp(8).toFloat())
            contentDescription = "WhatsApp about ${product.name}"
            pressable()
            setOnClickListener {
                val msg = Uri.encode("Hello, I'm interested in ${product.name} on SuperTech.")
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/250783998231?text=$msg")))
            }
        }
        wa.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_whatsapp)
            setColorFilter(Color.WHITE)
            setPadding(dp(10), dp(10), dp(10), dp(10))
        }, FrameLayout.LayoutParams(dp(40), dp(40)))
        footer.addView(wa, LinearLayout.LayoutParams(dp(40), dp(40)))
        card.addView(footer)

        return card
    }

    private fun isOutOfStock(stockLabel: String): Boolean {
        val v = stockLabel.trim().lowercase(Locale.US)
        return v.contains("out of stock") || v.contains("sold out") || v == "unavailable"
    }

    /** Website-style white circle wishlist control. */
    private fun likeButtonOnImage(slug: String): View {
        val wrap = FrameLayout(this).apply {
            background = rounded(Color.argb(20, 0, 0, 0), Color.argb(245, 255, 255, 255), dp(17).toFloat())
            elevation = dp(2).toFloat()
            contentDescription = if (Wishlist.isSaved(slug)) "Remove from saved" else "Save product"
            isClickable = true
            pressable()
        }
        val icon = ImageView(this).apply {
            val saved = Wishlist.isSaved(slug)
            setImageResource(if (saved) R.drawable.ic_heart_fill else R.drawable.ic_heart)
            setColorFilter(if (saved) likeRose else muted)
            setPadding(dp(8), dp(8), dp(8), dp(8))
        }
        wrap.addView(icon, FrameLayout.LayoutParams(dp(34), dp(34)))
        wrap.setOnClickListener {
            val saved = Wishlist.toggle(slug)
            icon.setImageResource(if (saved) R.drawable.ic_heart_fill else R.drawable.ic_heart)
            icon.setColorFilter(if (saved) likeRose else muted)
            wrap.contentDescription = if (saved) "Remove from saved" else "Save product"
            icon.animate().scaleX(0.8f).scaleY(0.8f).setDuration(80).withEndAction {
                icon.animate().scaleX(1.12f).scaleY(1.12f).setDuration(100).withEndAction {
                    icon.animate().scaleX(1f).scaleY(1f).setDuration(80).start()
                }.start()
            }.start()
            Toast.makeText(this, if (saved) "Saved" else "Removed from saved", Toast.LENGTH_SHORT).show()
        }
        return wrap
    }

    private fun productMode(category: String): String {
        val c = category.lowercase(Locale.US)
        if (c.contains("car") || c.contains("motor")) return "motors"
        if (c.contains("apartment") || c.contains("land") || c.contains("commercial") || c.contains("property")) {
            return "property"
        }
        return "shop"
    }

    private fun vendorName(slug: String): String? =
        slug.takeIf { it.isNotBlank() }?.let { s -> vendors.firstOrNull { it.slug == s }?.name }

    private fun renderVendors() {
        content.addView(paddedSection {
            addView(sectionHeader("Official stores", "Verified sellers on SuperTech", null) {})
            if (isLoading) {
                repeat(3) { addView(skeletonCard()) }
                return@paddedSection
            }
            stateBlock()?.let { addView(it) }
            if (loadError == null && vendors.isEmpty()) {
                addView(emptyCard("No vendors yet", "Approved vendors will appear here."))
            }
            vendors.forEachIndexed { i, v -> addView(vendorCard(v).animateIn(i)) }
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
        content.addView(paddedSection {
            // Brand cart header
            val head = LinearLayout(this@MainActivity).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, dp(4), 0, dp(12))
            }
            head.addView(ImageView(this@MainActivity).apply {
                setImageResource(R.mipmap.ic_launcher)
                scaleType = ImageView.ScaleType.CENTER_CROP
                background = rounded(Color.TRANSPARENT, Color.WHITE, dp(10).toFloat())
            }, LinearLayout.LayoutParams(dp(36), dp(36)).apply { rightMargin = dp(10) })
            val headCopy = LinearLayout(this@MainActivity).apply { orientation = LinearLayout.VERTICAL }
            headCopy.addView(text("Your cart", 20f, ink, Typeface.BOLD))
            headCopy.addView(text("SuperTech · Review before checkout", 12f, muted, Typeface.NORMAL))
            head.addView(headCopy, LinearLayout.LayoutParams(0, wrap(), 1f))
            addView(head)

            val lines = Cart.lines.values.toList()
            if (lines.isEmpty()) {
                hideCartSticky()
                val empty = LinearLayout(this@MainActivity).apply {
                    orientation = LinearLayout.VERTICAL
                    gravity = Gravity.CENTER_HORIZONTAL
                    setPadding(dp(16), dp(28), dp(16), dp(20))
                    background = rounded(line, Color.WHITE, dp(16).toFloat())
                    elevation = dp(2).toFloat()
                }
                empty.addView(ImageView(this@MainActivity).apply {
                    setImageResource(R.drawable.ic_cart)
                    setColorFilter(brand)
                }, LinearLayout.LayoutParams(dp(48), dp(48)).apply { bottomMargin = dp(12) })
                empty.addView(text("Your cart is empty", 18f, ink, Typeface.BOLD).apply { gravity = Gravity.CENTER })
                empty.addView(text("Add products from the shop — they’ll show up here with photos and totals.", 13f, muted, Typeface.NORMAL).apply {
                    gravity = Gravity.CENTER
                    setPadding(dp(8), dp(8), dp(8), dp(16))
                })
                empty.addView(primaryButton("Browse products") { render(Tab.Shop) }.apply { minimumHeight = dp(52) })
                addView(empty.withMargins(bottom = 16))
                val picks = products.filter { it.featured }.ifEmpty { products }.take(4)
                if (picks.isNotEmpty()) {
                    addView(sectionHeader("Popular now", "Same product cards as the shop", "See all") { render(Tab.Shop) })
                    addView(productGrid(picks))
                }
                return@paddedSection
            }
            lines.forEachIndexed { i, line ->
                addView(cartCard(line).animateIn(i))
            }
            // Summary card
            val sum = LinearLayout(this@MainActivity).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(16), dp(16), dp(16), dp(16))
                background = rounded(line, Color.WHITE, dp(16).toFloat())
                elevation = dp(3).toFloat()
            }
            sum.addView(text("Order summary", 15f, ink, Typeface.BOLD))
            sum.addView(summaryRow("Items", Cart.count().toString()))
            sum.addView(summaryRow("Estimated total", "RWF ${money.format(Cart.total())}"))
            sum.addView(secondaryButton("Continue shopping") { render(Tab.Shop) }.apply {
                minimumHeight = dp(48)
            }.also { v ->
                // layout margin via parent later
            })
            addView(sum.withMargins(bottom = 12))
            val cont = sum.getChildAt(sum.childCount - 1)
            (cont.layoutParams as? LinearLayout.LayoutParams)?.topMargin = dp(12)
            showCartSticky()
        })
    }

    private fun showCartSticky() {
        cartSticky.removeAllViews()
        cartSticky.visibility = View.VISIBLE
        cartSticky.setBackgroundColor(Color.WHITE)
        cartSticky.elevation = dp(16).toFloat()
        cartSticky.setPadding(dp(14), dp(12), dp(14), dp(12))
        cartSticky.background = GradientDrawable().apply {
            setColor(Color.WHITE)
            setStroke(dp(1), line)
        }
        val logo = ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher)
            scaleType = ImageView.ScaleType.CENTER_CROP
            background = rounded(Color.TRANSPARENT, softGreen, dp(8).toFloat())
        }
        cartSticky.addView(logo, LinearLayout.LayoutParams(dp(40), dp(40)).apply { rightMargin = dp(10) })
        val copy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        copy.addView(text("${Cart.count()} items · SuperTech", 12f, muted, Typeface.NORMAL))
        copy.addView(text("RWF ${money.format(Cart.total())}", 18f, brand, Typeface.BOLD))
        cartSticky.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        val checkout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            background = gradient(brand, brandDark, dp(12).toFloat())
            elevation = dp(4).toFloat()
            setPadding(dp(16), dp(12), dp(16), dp(12))
            pressable()
            setOnClickListener {
                startActivity(Intent(this@MainActivity, CheckoutActivity::class.java))
                overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
            }
        }
        // Hide AI chat FAB so it never covers Checkout on cart
        if (::aiFabView.isInitialized) aiFabView.visibility = View.GONE

        checkout.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_cart)
            setColorFilter(Color.WHITE)
        }, LinearLayout.LayoutParams(dp(18), dp(18)).apply { rightMargin = dp(8) })
        checkout.addView(text("Checkout", 14f, Color.WHITE, Typeface.BOLD))
        cartSticky.addView(checkout, LinearLayout.LayoutParams(wrap(), dp(48)))
    }

    private fun hideCartSticky() {
        cartSticky.removeAllViews()
        cartSticky.visibility = View.GONE
        // Restore AI FAB when leaving cart (unless Browse sheet open)
        if (::aiFabView.isInitialized && !browseSheetOpen && currentTab != Tab.Cart) {
            aiFabView.visibility = View.VISIBLE
            positionAiFab(aboveSticky = false)
        }
    }

    private fun positionAiFab(aboveSticky: Boolean) {
        if (!::aiFabView.isInitialized) return
        val lp = aiFabView.layoutParams as? FrameLayout.LayoutParams ?: return
        // Cart sticky ~56dp + dock ~64 + margin; normal only dock
        val bottom = if (aboveSticky) dp(150) else dp(88)
        lp.setMargins(0, 0, dp(16), bottom)
        aiFabView.layoutParams = lp
    }

    /** Photo Factory–style dark shopper header: logo | search | phone | WhatsApp */
    private fun darkShopperHeader(): View {
        val wrap = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(backgroundStrong)
        }

        // Promo strip — tappable shortcuts
        val promo = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(6), dp(6), dp(6), dp(4))
            setBackgroundColor(backgroundStrong)
        }
        fun promoLink(label: String, color: Int = gold, onClick: () -> Unit) {
            promo.addView(TextView(this).apply {
                text = label
                textSize = 11f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(color)
                setPadding(dp(6), dp(2), dp(6), dp(2))
                pressable()
                setOnClickListener { onClick() }
            })
        }
        promoLink("Verified sellers", Color.WHITE) { render(Tab.Stores) }
        promo.addView(text(" · ", 11f, Color.WHITE, Typeface.NORMAL))
        promoLink("Request") { startActivity(Intent(this, RequestProductActivity::class.java)) }
        promo.addView(text(" · ", 11f, Color.WHITE, Typeface.NORMAL))
        promoLink("Track") { startActivity(Intent(this, TrackOrderActivity::class.java)) }
        promo.addView(text(" · ", 11f, Color.WHITE, Typeface.NORMAL))
        promoLink("Sell") { startActivity(Intent(this, BecomeVendorActivity::class.java)) }
        wrap.addView(promo, LinearLayout.LayoutParams(match(), wrap()))

        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(10), dp(8), dp(10), dp(10))
            setBackgroundColor(backgroundStrong)
        }

        // Logo with notification badge when unread exist
        val logoWrap = FrameLayout(this).apply {
            contentDescription = "SuperTech · notifications"
            pressable()
            setOnClickListener {
                if (NotificationsStore.unreadCount() > 0) {
                    startActivity(Intent(this@MainActivity, NotificationsActivity::class.java))
                    overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
                } else {
                    hideSearchSuggestions()
                    render(Tab.Home)
                }
            }
        }
        logoWrap.addView(FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(10).toFloat())
            elevation = dp(3).toFloat()
            addView(ImageView(this@MainActivity).apply {
                setImageResource(R.mipmap.ic_launcher)
                scaleType = ImageView.ScaleType.CENTER_CROP
            }, FrameLayout.LayoutParams(dp(40), dp(40)))
        }, FrameLayout.LayoutParams(dp(40), dp(40)))
        val unreadLogo = NotificationsStore.unreadCount()
        if (unreadLogo > 0) {
            logoWrap.addView(TextView(this).apply {
                text = if (unreadLogo > 9) "9+" else unreadLogo.toString()
                textSize = 9f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(Color.WHITE)
                gravity = Gravity.CENTER
                background = rounded(Color.TRANSPARENT, danger, dp(10).toFloat())
                minWidth = dp(18)
                setPadding(dp(4), dp(1), dp(4), dp(1))
            }, FrameLayout.LayoutParams(wrap(), wrap(), Gravity.TOP or Gravity.END).apply {
                topMargin = dp(-2); rightMargin = dp(-4)
            })
        }
        row.addView(logoWrap, LinearLayout.LayoutParams(dp(44), dp(44)).apply { rightMargin = dp(6) })

        // Notification bell on home header
        row.addView(FrameLayout(this).apply {
            contentDescription = "Notifications"
            pressable()
            setOnClickListener {
                startActivity(Intent(this@MainActivity, NotificationsActivity::class.java))
                overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
            }
            addView(ImageView(this@MainActivity).apply {
                setImageResource(R.drawable.ic_bell)
                setColorFilter(Color.WHITE)
                setPadding(dp(10), dp(10), dp(10), dp(10))
            }, FrameLayout.LayoutParams(dp(40), dp(40)))
            val u = NotificationsStore.unreadCount()
            if (u > 0) {
                addView(TextView(this@MainActivity).apply {
                    text = if (u > 9) "9+" else u.toString()
                    textSize = 9f
                    typeface = Typeface.DEFAULT_BOLD
                    setTextColor(Color.WHITE)
                    gravity = Gravity.CENTER
                    background = rounded(Color.TRANSPARENT, danger, dp(9).toFloat())
                    setPadding(dp(4), 0, dp(4), 0)
                }, FrameLayout.LayoutParams(wrap(), wrap(), Gravity.TOP or Gravity.END).apply {
                    topMargin = dp(2); rightMargin = dp(2)
                })
            }
        }, LinearLayout.LayoutParams(dp(40), dp(40)).apply { rightMargin = dp(2) })

        val search = EditText(this).apply {
            setSingleLine(true)
            hint = "Search products, stores…"
            textSize = 14f
            setTextColor(ink)
            setHintTextColor(muted)
            imeOptions = EditorInfo.IME_ACTION_SEARCH
            setPadding(dp(14), 0, dp(40), 0)
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(20).toFloat())
            setOnEditorActionListener { view, actionId, _ ->
                if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                    hideSearchSuggestions()
                    searchProducts(view.text.toString())
                    true
                } else false
            }
            setOnFocusChangeListener { _, hasFocus ->
                if (hasFocus) scheduleSearchSuggest(text?.toString().orEmpty())
                else suggestHandler.postDelayed({ hideSearchSuggestions() }, 180)
            }
            addTextChangedListener(object : android.text.TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    scheduleSearchSuggest(s?.toString().orEmpty())
                }
                override fun afterTextChanged(s: android.text.Editable?) {}
            })
        }
        headerSearch = search
        val searchWrap = FrameLayout(this)
        searchWrap.addView(search, FrameLayout.LayoutParams(match(), dp(42)))
        searchWrap.addView(ImageButton(this).apply {
            setImageResource(R.drawable.ic_search)
            setColorFilter(brand)
            setBackgroundColor(Color.TRANSPARENT)
            setPadding(dp(8), dp(8), dp(8), dp(8))
            contentDescription = "Search"
            setOnClickListener {
                hideSearchSuggestions()
                searchProducts(search.text.toString())
            }
        }, FrameLayout.LayoutParams(dp(42), dp(42), Gravity.END or Gravity.CENTER_VERTICAL))
        row.addView(searchWrap, LinearLayout.LayoutParams(0, dp(42), 1f))

        fun contactBtn(icon: Int, desc: String, onClick: () -> Unit): View {
            return ImageButton(this).apply {
                setImageResource(icon)
                setColorFilter(Color.WHITE)
                setBackgroundColor(Color.TRANSPARENT)
                contentDescription = desc
                setPadding(dp(8), dp(8), dp(8), dp(8))
                minimumWidth = dp(44)
                minimumHeight = dp(44)
                setOnClickListener { onClick() }
            }
        }

        row.addView(contactBtn(R.drawable.ic_phone, "Call support") {
            startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$supportPhoneTel")))
        }, LinearLayout.LayoutParams(dp(44), dp(44)).apply { leftMargin = dp(2) })

        row.addView(contactBtn(R.drawable.ic_whatsapp, "WhatsApp support") {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(supportWhatsApp)))
        }, LinearLayout.LayoutParams(dp(44), dp(44)))

        wrap.addView(row, LinearLayout.LayoutParams(match(), wrap()))
        return wrap
    }

    /**
     * Snapping page scroller for the hero.
     * Claims horizontal gestures so parent ScrollView / SwipeRefresh do not steal them.
     */
    private inner class PagerScrollView(
        private val pageStride: Int,
        private val pageCount: Int,
        private val onPage: (Int) -> Unit
    ) : HorizontalScrollView(this@MainActivity) {
        private var downX = 0f
        private var downY = 0f
        private var draggingHorizontal = false
        private val touchSlop = android.view.ViewConfiguration.get(context).scaledTouchSlop

        init {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            isFillViewport = true
            viewTreeObserver.addOnScrollChangedListener {
                if (pageStride > 0) {
                    onPage(((scrollX + pageStride / 2) / pageStride).coerceIn(0, pageCount - 1))
                }
            }
        }

        private fun snap() {
            if (pageStride <= 0) return
            val page = ((scrollX + pageStride / 2) / pageStride).coerceIn(0, pageCount - 1)
            post { smoothScrollTo(page * pageStride, 0) }
        }

        override fun fling(velocityX: Int) {
            if (pageStride <= 0) return
            val current = (scrollX + pageStride / 2) / pageStride
            val target = when {
                velocityX > 400 -> current + 1
                velocityX < -400 -> current - 1
                else -> current
            }.coerceIn(0, pageCount - 1)
            post { smoothScrollTo(target * pageStride, 0) }
        }

        override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
            when (ev.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    downX = ev.x
                    downY = ev.y
                    draggingHorizontal = false
                    parent?.requestDisallowInterceptTouchEvent(true)
                    swipe.isEnabled = false
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = kotlin.math.abs(ev.x - downX)
                    val dy = kotlin.math.abs(ev.y - downY)
                    if (dx > touchSlop || dy > touchSlop) {
                        if (dx > dy) {
                            draggingHorizontal = true
                            parent?.requestDisallowInterceptTouchEvent(true)
                            swipe.isEnabled = false
                        } else {
                            parent?.requestDisallowInterceptTouchEvent(false)
                            swipe.isEnabled = true
                            return false
                        }
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    parent?.requestDisallowInterceptTouchEvent(false)
                    swipe.isEnabled = true
                }
            }
            return super.onInterceptTouchEvent(ev)
        }

        override fun onTouchEvent(ev: MotionEvent): Boolean {
            when (ev.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    downX = ev.x
                    downY = ev.y
                    parent?.requestDisallowInterceptTouchEvent(true)
                    swipe.isEnabled = false
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = kotlin.math.abs(ev.x - downX)
                    val dy = kotlin.math.abs(ev.y - downY)
                    if (dx > dy) {
                        parent?.requestDisallowInterceptTouchEvent(true)
                        swipe.isEnabled = false
                    } else if (dy > touchSlop && dy > dx) {
                        parent?.requestDisallowInterceptTouchEvent(false)
                        swipe.isEnabled = true
                    }
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    val handled = super.onTouchEvent(ev)
                    snap()
                    parent?.requestDisallowInterceptTouchEvent(false)
                    swipe.isEnabled = true
                    return handled
                }
            }
            return super.onTouchEvent(ev)
        }
    }

    /**
     * Adorama-style full-bleed hero: dark overlay, gold accent word, gold CTA, feature chips.
     */
    private fun heroCarousel(): View {
        val slideWidth = resources.displayMetrics.widthPixels
        val slideHeight = dp(290)
        val stride = slideWidth

        data class HeroSpec(
            val brand: String,
            val accentWord: String,
            val title: String,
            val body: String,
            val cta: String,
            val onCta: () -> Unit,
            val features: List<Pair<Int, String>>,
            val bannerUrl: String?
        )

        val slides = listOf(
            HeroSpec(
                "VIP", "Rewards",
                "Earn more when you shop SuperTech.",
                "Verified sellers, exclusive deals, and trackable orders.",
                "Shop flash sale",
                { render(Tab.Shop) },
                listOf(
                    R.drawable.ic_shield to "Verified sellers",
                    R.drawable.ic_bolt to "Live deals",
                    R.drawable.ic_truck to "Track orders",
                    R.drawable.ic_store to "Official stores"
                ),
                "$apiBase/banners/hero-flash-sale.jpg"
            ),
            HeroSpec(
                "Smart", "Gadgets",
                "Phones, wearables, everyday gear.",
                "Mobile essentials from verified marketplace sellers.",
                "Shop gadgets",
                {
                    selectedCategory = "Mobile Essentials"
                    displayedProducts = products.filter { it.category.contains("Mobile", true) || it.category.contains("Wear", true) }
                        .ifEmpty { products }
                    render(Tab.Shop)
                },
                listOf(
                    R.drawable.ic_bolt to "Phones",
                    R.drawable.ic_shield to "Verified stock",
                    R.drawable.ic_person to "Seller support",
                    R.drawable.ic_truck to "Track delivery"
                ),
                "$apiBase/banners/hero-gadgets.jpg"
            ),
            HeroSpec(
                "Request", "& Track",
                "Missing a product? We help source it.",
                "Send a request or follow any order status in-app.",
                "Request a product",
                { startActivity(Intent(this, RequestProductActivity::class.java)) },
                listOf(
                    R.drawable.ic_box to "Product requests",
                    R.drawable.ic_truck to "Live tracking",
                    R.drawable.ic_store to "Official stores",
                    R.drawable.ic_shield to "Buyer protection"
                ),
                "$apiBase/banners/hero-request-track.jpg"
            )
        )

        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        slides.forEach { spec ->
            row.addView(
                adoramaHeroSlide(spec.brand, spec.accentWord, spec.title, spec.body, spec.cta, spec.onCta, spec.features, spec.bannerUrl),
                LinearLayout.LayoutParams(slideWidth, slideHeight)
            )
        }

        val dotsRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(0, dp(0), 0, dp(0))
        }
        val dots = slides.indices.map { i ->
            View(this).apply {
                background = rounded(Color.TRANSPARENT, if (i == 0) Color.WHITE else Color.argb(90, 255, 255, 255), dp(5).toFloat())
            }.also { dot ->
                val lp = LinearLayout.LayoutParams(if (i == 0) dp(16) else dp(8), dp(8))
                lp.setMargins(dp(3), 0, dp(3), 0)
                dotsRow.addView(dot, lp)
            }
        }

        var activePage = 0
        val pager = PagerScrollView(stride, slides.size) { page ->
            if (page != activePage) {
                activePage = page
                dots.forEachIndexed { i, dot ->
                    dot.background = rounded(
                        Color.TRANSPARENT,
                        if (i == page) Color.WHITE else Color.argb(90, 255, 255, 255),
                        dp(5).toFloat()
                    )
                    val lp = dot.layoutParams as LinearLayout.LayoutParams
                    lp.width = if (i == page) dp(16) else dp(8)
                    dot.layoutParams = lp
                }
            }
        }
        pager.addView(row)

        val frame = FrameLayout(this)
        frame.addView(pager, FrameLayout.LayoutParams(match(), slideHeight))
        frame.addView(dotsRow, FrameLayout.LayoutParams(match(), wrap(), Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL).apply {
            bottomMargin = dp(10)
        })
        return frame
    }

    private fun adoramaHeroSlide(
        brandLine: String,
        accentWord: String,
        title: String,
        body: String,
        cta: String,
        onCta: () -> Unit,
        features: List<Pair<Int, String>>,
        bannerUrl: String?
    ): View {
        val frame = FrameLayout(this).apply {
            setBackgroundColor(backgroundStrong)
        }

        val bgImage = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            alpha = 0.55f
        }
        frame.addView(bgImage, FrameLayout.LayoutParams(match(), match()))
        if (!bannerUrl.isNullOrBlank()) loadImage(bgImage, bannerUrl)

        // Dark gradient overlay (left-heavy for copy)
        frame.addView(View(this).apply {
            background = GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                intArrayOf(
                    Color.argb(245, 6, 10, 18),
                    Color.argb(200, 6, 10, 18),
                    Color.argb(90, 6, 10, 18)
                )
            )
        }, FrameLayout.LayoutParams(match(), match()))

        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(20), dp(18), dp(36))
        }

        panel.addView(TextView(this).apply {
            text = "LIVE NOW"
            textSize = 10f
            typeface = Typeface.DEFAULT_BOLD
            letterSpacing = 0.12f
            setTextColor(gold)
            background = rounded(gold, Color.argb(30, 245, 166, 42), dp(4).toFloat())
            setPadding(dp(10), dp(4), dp(10), dp(4))
        }, LinearLayout.LayoutParams(wrap(), wrap()))

        panel.addView(text(brandLine, 28f, Color.WHITE, Typeface.BOLD).apply {
            setPadding(0, dp(10), 0, 0)
        })
        panel.addView(text(accentWord, 28f, gold, Typeface.BOLD))
        panel.addView(text(title, 15f, Color.WHITE, Typeface.BOLD).apply {
            setPadding(0, dp(6), 0, 0)
            maxLines = 2
        })
        panel.addView(text(body, 13f, Color.argb(200, 255, 255, 255), Typeface.NORMAL).apply {
            setPadding(0, dp(4), 0, 0)
            maxLines = 2
        })

        panel.addView(Button(this).apply {
            text = cta
            textSize = 12f
            isAllCaps = true
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(ColorStateList.valueOf(Color.rgb(21, 17, 10)))
            backgroundTintList = null
            background = rounded(Color.TRANSPARENT, gold, dp(8).toFloat())
            stateListAnimator = null
            minimumHeight = dp(44)
            pressable()
            setOnClickListener { onCta() }
        }, LinearLayout.LayoutParams(wrap(), dp(44)).apply { topMargin = dp(12) })

        // Feature chips — non-scrolling so they never steal hero swipes
        val chipRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(12), 0, dp(4))
        }
        features.take(3).forEach { (iconRes, label) ->
            val chip = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                background = rounded(gold, Color.argb(55, 0, 0, 0), dp(6).toFloat())
                setPadding(dp(8), dp(6), dp(10), dp(6))
            }
            chip.addView(ImageView(this).apply {
                setImageResource(iconRes)
                setColorFilter(gold)
            }, LinearLayout.LayoutParams(dp(14), dp(14)).apply { rightMargin = dp(6) })
            chip.addView(text(label, 11f, Color.WHITE, Typeface.BOLD).apply {
                maxLines = 1
                ellipsize = android.text.TextUtils.TruncateAt.END
            })
            chipRow.addView(chip, LinearLayout.LayoutParams(wrap(), wrap()).apply { rightMargin = dp(6) })
        }
        panel.addView(chipRow)

        frame.addView(panel, FrameLayout.LayoutParams(match(), match()))
        frame.contentDescription = "Promo carousel slide"
        return frame
    }

    /** Adorama-style blue product strip under the hero. */
    private fun blueCategoryRail(items: List<String>): View {
        val wrap = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                intArrayOf(blueStart, blueMid, blueEnd)
            )
            setPadding(0, dp(10), 0, dp(10))
        }
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp(8), 0, dp(8), 0)
        }
        items.forEach { category ->
            val sample = products.firstOrNull { it.category.equals(category, true) }
            val cell = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER_HORIZONTAL
                setPadding(dp(8), dp(4), dp(8), dp(4))
                pressable()
                setOnClickListener {
                    selectedCategory = category
                    displayedProducts = products.filter { it.category.equals(category, true) }
                    render(Tab.Shop)
                }
            }
            val image = ImageView(this).apply {
                scaleType = ImageView.ScaleType.CENTER_INSIDE
                setImageResource(android.R.drawable.ic_menu_gallery)
                setColorFilter(Color.WHITE)
                setBackgroundColor(Color.argb(30, 255, 255, 255))
            }
            if (sample != null) loadImage(image, sample.heroImage)
            cell.addView(image, LinearLayout.LayoutParams(dp(72), dp(72)))
            cell.addView(text(category, 11f, Color.WHITE, Typeface.BOLD).apply {
                gravity = Gravity.CENTER
                maxLines = 2
                minLines = 2
                setPadding(0, dp(6), 0, 0)
            }, LinearLayout.LayoutParams(dp(88), wrap()))
            row.addView(cell)
        }
        wrap.addView(HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(row)
        })
        return wrap
    }

    /**
     * Browse sheet as an in-activity overlay inside [shellFrame] (above content, BELOW dock).
     * Dock stays fully visible and tappable — Browse toggles open/close.
     */
    private fun openBrowseSheet() {
        if (browseSheetOpen) return
        browseSheetOpen = true
        aiFabView.visibility = View.GONE
        renderTabs()

        fun dismissAnd(action: () -> Unit = {}) {
            closeBrowseSheet()
            action()
        }

        val overlay = FrameLayout(this).apply {
            setBackgroundColor(Color.argb(150, 0, 0, 0))
            isClickable = true
            isFocusable = true
            setOnClickListener { closeBrowseSheet() }
            alpha = 0f
        }

        val sheet = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(Color.TRANSPARENT, Color.rgb(245, 245, 246), dp(18).toFloat())
            elevation = dp(12).toFloat()
            isClickable = true
            setOnClickListener { /* consume — don't close when tapping sheet */ }
            translationY = dp(40).toFloat()
            alpha = 0.96f
        }

        // —— Header: handle + title + close
        val header = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(backgroundStrong)
            setPadding(dp(12), dp(10), dp(12), dp(0))
        }
        header.addView(View(this).apply {
            background = rounded(Color.TRANSPARENT, Color.argb(120, 255, 255, 255), dp(3).toFloat())
        }, LinearLayout.LayoutParams(dp(44), dp(4)).apply {
            gravity = Gravity.CENTER_HORIZONTAL
            bottomMargin = dp(10)
        })

        val titleRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, dp(8))
        }
        titleRow.addView(text("Browse", 18f, Color.WHITE, Typeface.BOLD), LinearLayout.LayoutParams(0, wrap(), 1f))
        titleRow.addView(TextView(this).apply {
            text = "Close"
            textSize = 13f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(gold)
            setPadding(dp(12), dp(8), dp(4), dp(8))
            pressable()
            setOnClickListener { closeBrowseSheet() }
            contentDescription = "Close browse menu"
        })
        header.addView(titleRow)

        // —— Sheet tabs
        val tabStrip = HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            setBackgroundColor(backgroundStrong)
        }
        val tabRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp(8), 0, dp(8), 0)
        }
        tabStrip.addView(tabRow)

        val sheetTabs = listOf("Categories", "Vendors", "Tools", "Deals")
        var activeSheetTab = 0
        val sheetBody = ScrollView(this).apply {
            setPadding(dp(12), dp(12), dp(12), dp(12))
            isFillViewport = true
        }
        val sheetContent = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        sheetBody.addView(sheetContent)

        fun paintSheet() {
            sheetContent.removeAllViews()
            if (isLoading && products.isEmpty()) {
                sheetContent.addView(text("Loading marketplace…", 14f, muted, Typeface.NORMAL).apply {
                    gravity = Gravity.CENTER
                    setPadding(0, dp(32), 0, dp(32))
                })
                return
            }
            when (activeSheetTab) {
                0 -> {
                    val pills = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
                    listOf(
                        "All products" to { dismissAnd { selectedCategory = "All"; displayedProducts = products; render(Tab.Shop) } },
                        "Request" to { dismissAnd { startActivity(Intent(this, RequestProductActivity::class.java)) } },
                        "Track" to { dismissAnd { startActivity(Intent(this, TrackOrderActivity::class.java)) } },
                        "Stores" to { dismissAnd { render(Tab.Stores) } }
                    ).forEach { (label, action) ->
                        pills.addView(TextView(this).apply {
                            text = label
                            textSize = 12f
                            typeface = Typeface.DEFAULT_BOLD
                            setTextColor(ink)
                            background = rounded(line, Color.WHITE, dp(16).toFloat())
                            setPadding(dp(12), dp(8), dp(12), dp(8))
                            pressable()
                            setOnClickListener { action() }
                        }, LinearLayout.LayoutParams(wrap(), wrap()).apply { rightMargin = dp(8) })
                    }
                    sheetContent.addView(HorizontalScrollView(this).apply {
                        isHorizontalScrollBarEnabled = false
                        addView(pills)
                    }, LinearLayout.LayoutParams(match(), wrap()).apply { bottomMargin = dp(12) })

                    val cats = categories.filterNot { it == "All" }
                    if (cats.isEmpty()) {
                        sheetContent.addView(text("No categories yet. Pull to refresh on Home.", 13f, muted, Typeface.NORMAL))
                    }
                    cats.forEach { category ->
                        val sample = products.firstOrNull { it.category.equals(category, true) }
                        val row = LinearLayout(this).apply {
                            orientation = LinearLayout.HORIZONTAL
                            gravity = Gravity.CENTER_VERTICAL
                            minimumHeight = dp(72)
                            background = rounded(Color.argb(18, 0, 0, 0), Color.WHITE, dp(12).toFloat())
                            setPadding(dp(10), dp(10), dp(12), dp(10))
                            pressable()
                            setOnClickListener {
                                dismissAnd {
                                    selectedCategory = category
                                    displayedProducts = products.filter { it.category.equals(category, true) }
                                    render(Tab.Shop)
                                }
                            }
                        }
                        val thumb = ImageView(this).apply {
                            scaleType = ImageView.ScaleType.CENTER_CROP
                            setBackgroundColor(softGreen)
                        }
                        if (sample != null) loadImage(thumb, sample.heroImage)
                        else {
                            thumb.setImageResource(categoryIcon(category))
                            thumb.setColorFilter(brand)
                            thumb.setPadding(dp(14), dp(14), dp(14), dp(14))
                        }
                        row.addView(thumb, LinearLayout.LayoutParams(dp(56), dp(56)).apply { rightMargin = dp(12) })
                        row.addView(text(category, 15f, ink, Typeface.BOLD).apply {
                            maxLines = 2
                        }, LinearLayout.LayoutParams(0, wrap(), 1f))
                        row.addView(ImageView(this).apply {
                            setImageResource(R.drawable.ic_chevron)
                            setColorFilter(muted)
                        }, LinearLayout.LayoutParams(dp(20), dp(20)))
                        sheetContent.addView(row, LinearLayout.LayoutParams(match(), wrap()).apply { bottomMargin = dp(8) })
                    }
                }
                1 -> {
                    if (vendors.isEmpty()) {
                        sheetContent.addView(text("No stores yet.", 14f, muted, Typeface.NORMAL))
                    }
                    vendors.take(30).forEach { vendor ->
                        val row = LinearLayout(this).apply {
                            orientation = LinearLayout.HORIZONTAL
                            gravity = Gravity.CENTER_VERTICAL
                            minimumHeight = dp(72)
                            background = rounded(Color.argb(18, 0, 0, 0), Color.WHITE, dp(12).toFloat())
                            setPadding(dp(12), dp(12), dp(12), dp(12))
                            pressable()
                            setOnClickListener {
                                dismissAnd {
                                    startActivity(
                                        Intent(this@MainActivity, VendorProfileActivity::class.java)
                                            .putExtra("slug", vendor.slug)
                                    )
                                }
                            }
                        }
                        row.addView(
                            iconBubbleLocal(R.drawable.ic_store, brand, softGreen),
                            LinearLayout.LayoutParams(dp(44), dp(44)).apply { rightMargin = dp(12) }
                        )
                        val copy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
                        copy.addView(text(vendor.name, 15f, ink, Typeface.BOLD))
                        copy.addView(
                            text(
                                vendor.headline.ifBlank { "${vendor.activeProducts} products · ${vendor.location}" },
                                12f,
                                muted,
                                Typeface.NORMAL
                            )
                        )
                        row.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
                        sheetContent.addView(row, LinearLayout.LayoutParams(match(), wrap()).apply { bottomMargin = dp(8) })
                    }
                }
                2 -> {
                    listOf(
                        Triple(R.drawable.ic_box, "Request a product", Intent(this, RequestProductActivity::class.java)),
                        Triple(R.drawable.ic_truck, "Track your order", Intent(this, TrackOrderActivity::class.java)),
                        Triple(R.drawable.ic_store, "Become a vendor", Intent(this, BecomeVendorActivity::class.java)),
                        Triple(R.drawable.ic_lock, "Privacy policy", Intent(this, PrivacyActivity::class.java))
                    ).forEach { (icon, label, intent) ->
                        val row = LinearLayout(this).apply {
                            orientation = LinearLayout.HORIZONTAL
                            gravity = Gravity.CENTER_VERTICAL
                            minimumHeight = dp(64)
                            background = rounded(Color.argb(18, 0, 0, 0), Color.WHITE, dp(12).toFloat())
                            setPadding(dp(12), dp(12), dp(12), dp(12))
                            pressable()
                            setOnClickListener { dismissAnd { startActivity(intent) } }
                        }
                        row.addView(
                            iconBubbleLocal(icon, brand, softGreen),
                            LinearLayout.LayoutParams(dp(44), dp(44)).apply { rightMargin = dp(12) }
                        )
                        row.addView(text(label, 15f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wrap(), 1f))
                        row.addView(ImageView(this).apply {
                            setImageResource(R.drawable.ic_chevron)
                            setColorFilter(muted)
                        }, LinearLayout.LayoutParams(dp(20), dp(20)))
                        sheetContent.addView(row, LinearLayout.LayoutParams(match(), wrap()).apply { bottomMargin = dp(8) })
                    }
                }
                else -> {
                    listOf(
                        "All catalog" to {
                            selectedCategory = "All"
                            displayedProducts = products
                            render(Tab.Shop)
                        },
                        "Flash / featured picks" to {
                            displayedProducts = products.filter { it.featured }.ifEmpty { products }
                            selectedCategory = "All"
                            render(Tab.Shop)
                        },
                        "Beauty & personal care" to {
                            selectedCategory = "Beauty & Personal Care"
                            displayedProducts = products.filter { it.category.contains("Beauty", true) }
                            render(Tab.Shop)
                        },
                        "Mobile essentials" to {
                            selectedCategory = "Mobile Essentials"
                            displayedProducts = products.filter { it.category.contains("Mobile", true) }
                            render(Tab.Shop)
                        }
                    ).forEach { (label, action) ->
                        val row = TextView(this).apply {
                            text = label
                            textSize = 15f
                            typeface = Typeface.DEFAULT_BOLD
                            setTextColor(ink)
                            background = rounded(Color.argb(18, 0, 0, 0), Color.WHITE, dp(12).toFloat())
                            setPadding(dp(16), dp(18), dp(16), dp(18))
                            pressable()
                            setOnClickListener { dismissAnd { action() } }
                        }
                        sheetContent.addView(row, LinearLayout.LayoutParams(match(), wrap()).apply { bottomMargin = dp(8) })
                    }
                }
            }
        }

        sheetTabs.forEachIndexed { index, label ->
            val btn = TextView(this).apply {
                text = label
                textSize = 13f
                typeface = Typeface.DEFAULT_BOLD
                setPadding(dp(14), dp(10), dp(14), dp(12))
                setTextColor(if (index == 0) ink else Color.WHITE)
                background = rounded(
                    Color.TRANSPARENT,
                    if (index == 0) Color.WHITE else Color.TRANSPARENT,
                    dp(8).toFloat()
                )
                pressable()
                setOnClickListener {
                    activeSheetTab = index
                    for (i in 0 until tabRow.childCount) {
                        val child = tabRow.getChildAt(i) as TextView
                        val on = i == index
                        child.setTextColor(if (on) ink else Color.WHITE)
                        child.background = rounded(
                            Color.TRANSPARENT,
                            if (on) Color.WHITE else Color.TRANSPARENT,
                            dp(8).toFloat()
                        )
                    }
                    paintSheet()
                }
            }
            tabRow.addView(btn, LinearLayout.LayoutParams(wrap(), wrap()).apply { rightMargin = dp(4) })
        }

        // Done footer — always visible, clear way to close without hunting for X
        val doneBar = TextView(this).apply {
            text = "Done — close browse"
            gravity = Gravity.CENTER
            textSize = 14f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.WHITE)
            background = gradient(brand, brandDark, 0f)
            setPadding(dp(16), dp(16), dp(16), dp(16))
            pressable()
            setOnClickListener { closeBrowseSheet() }
            contentDescription = "Close browse menu"
        }

        sheet.addView(header, LinearLayout.LayoutParams(match(), wrap()))
        sheet.addView(tabStrip, LinearLayout.LayoutParams(match(), wrap()))
        sheet.addView(sheetBody, LinearLayout.LayoutParams(match(), 0, 1f))
        sheet.addView(doneBar, LinearLayout.LayoutParams(match(), wrap()))
        paintSheet()

        // Sheet fills the content area only (shellFrame) — dock remains below
        val sheetLp = FrameLayout.LayoutParams(match(), match(), Gravity.BOTTOM).apply {
            leftMargin = dp(0)
            rightMargin = dp(0)
            topMargin = dp(12)
        }
        overlay.addView(sheet, sheetLp)
        shellFrame.addView(overlay, FrameLayout.LayoutParams(match(), match()))
        browseOverlay = overlay

        overlay.animate().alpha(1f).setDuration(180).start()
        sheet.animate().translationY(0f).alpha(1f).setDuration(220)
            .setInterpolator(DecelerateInterpolator()).start()
    }

    private fun closeBrowseSheet() {
        val overlay = browseOverlay ?: run {
            browseSheetOpen = false
            aiFabView.visibility = View.VISIBLE
            renderTabs()
            return
        }
        browseSheetOpen = false
        overlay.animate().alpha(0f).setDuration(150).withEndAction {
            (overlay.parent as? ViewGroup)?.removeView(overlay)
            if (browseOverlay === overlay) browseOverlay = null
        }.start()
        aiFabView.visibility = View.VISIBLE
        renderTabs()
    }

    private fun iconBubbleLocal(iconRes: Int, tint: Int, fill: Int): View {
        return FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, fill, dp(22).toFloat())
            val iv = ImageView(this@MainActivity).apply {
                setImageResource(iconRes)
                setColorFilter(tint)
                setPadding(dp(10), dp(10), dp(10), dp(10))
            }
            addView(iv, FrameLayout.LayoutParams(dp(44), dp(44)))
        }
    }

    /** Horizontal product gallery — same retail product card, fixed width. */
    private fun featuredCarousel(items: List<Product>): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(2), 0, dp(6))
        }
        items.forEachIndexed { i, product ->
            val lp = LinearLayout.LayoutParams(dp(188), wrap())
            lp.rightMargin = dp(12)
            row.addView(gridProductCard(product).animateIn(i), lp)
        }
        return HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(row)
        }.withMargins(bottom = 8)
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

        // Four high-value actions only (cleaner home)
        add(R.drawable.ic_box, "Request item", "Source any product") {
            startActivity(Intent(this, RequestProductActivity::class.java))
        }
        add(R.drawable.ic_truck, "Track order", "Follow your delivery") {
            startActivity(Intent(this, TrackOrderActivity::class.java))
        }
        add(R.drawable.ic_store, "Sell on SuperTech", "Become a vendor") {
            startActivity(Intent(this, BecomeVendorActivity::class.java))
        }
        add(R.drawable.ic_sparkle, "AI support", "Ask the assistant") { openAi() }
        return grid.withMargins(bottom = 18)
    }

    private fun trustStrip(): View {
        val productCount = if (isLoading) "…" else products.size.toString()
        val vendorCount = if (isLoading) "…" else vendors.size.toString()
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(6), dp(12), dp(6), dp(12))
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            elevation = dp(1).toFloat()
        }
        listOf(
            productCount to "products",
            vendorCount to "vendors",
            "Verified" to "sellers"
        ).forEachIndexed { index, item ->
            val cell = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
            }
            cell.addView(text(item.first, 16f, brand, Typeface.BOLD).apply { gravity = Gravity.CENTER })
            cell.addView(text(item.second, 11f, muted, Typeface.NORMAL).apply {
                gravity = Gravity.CENTER
                setPadding(0, dp(2), 0, 0)
            })
            row.addView(cell, LinearLayout.LayoutParams(0, wrap(), 1f))
            if (index < 2) {
                row.addView(View(this).apply { setBackgroundColor(line) }, LinearLayout.LayoutParams(dp(1), dp(36)))
            }
        }
        return row.withMargins(bottom = 14)
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
            setOnClickListener {
                if (productMode(product.category) == "shop") addToCart(product) else openProduct(product)
            }
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
            elevation = dp(4).toFloat()
        }

        val product = products.firstOrNull { it.slug == itemLine.slug }
        val imageUrl = itemLine.heroImage.ifBlank { product?.heroImage.orEmpty() }
        val image = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(product?.color ?: softGreen)
            if (imageUrl.isBlank()) setPadding(dp(16), dp(16), dp(16), dp(16))
            roundCorners(dp(14).toFloat())
        }
        if (imageUrl.isNotBlank()) loadImage(image, imageUrl)
        card.addView(image, LinearLayout.LayoutParams(dp(88), dp(88)).apply { rightMargin = dp(12) })

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, 0, dp(4), 0)
        }
        copy.addView(text(itemLine.name, 15f, ink, Typeface.BOLD).apply {
            maxLines = 2
            ellipsize = android.text.TextUtils.TruncateAt.END
        })
        copy.addView(text("RWF ${money.format(itemLine.price)} each", 12f, muted, Typeface.NORMAL).apply {
            setPadding(0, dp(4), 0, 0)
        })
        copy.addView(text("Line total  RWF ${money.format(itemLine.price * itemLine.qty)}", 15f, brand, Typeface.BOLD).apply {
            setPadding(0, dp(4), 0, dp(10))
        })

        val controls = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        controls.addView(stepButton("−") { changeQty(itemLine.slug, -1) })
        controls.addView(text(itemLine.qty.toString(), 16f, ink, Typeface.BOLD).apply {
            gravity = Gravity.CENTER
            background = rounded(line, softGreen, dp(10).toFloat())
            setPadding(dp(4), dp(6), dp(4), dp(6))
            layoutParams = LinearLayout.LayoutParams(dp(40), dp(40)).apply {
                leftMargin = dp(6); rightMargin = dp(6)
            }
        })
        controls.addView(stepButton("+") { changeQty(itemLine.slug, 1) })
        controls.addView(TextView(this).apply {
            text = "Remove"
            textSize = 12f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(danger)
            gravity = Gravity.CENTER
            background = rounded(danger, Color.rgb(255, 241, 242), dp(10).toFloat())
            setPadding(dp(12), dp(10), dp(12), dp(10))
            pressable()
            setOnClickListener {
                Cart.remove(itemLine.slug)
                render(Tab.Cart)
            }
        }, LinearLayout.LayoutParams(wrap(), dp(40)).apply { leftMargin = dp(10) })
        copy.addView(controls)

        card.addView(copy, LinearLayout.LayoutParams(0, wrap(), 1f))
        return card.withMargins(bottom = 12)
    }

    private fun stepButton(symbol: String, onClick: () -> Unit): View {
        return TextView(this).apply {
            text = symbol
            textSize = 20f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            background = gradient(brand, brandDark, dp(12).toFloat())
            elevation = dp(2).toFloat()
            layoutParams = LinearLayout.LayoutParams(dp(40), dp(40))
            pressable()
            setOnClickListener { onClick() }
        }
    }

    private fun vendorCard(vendor: Vendor): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(3).toFloat()
            clipToOutline = true
        }

        // Cover image
        val cover = FrameLayout(this)
        val coverBg = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setBackgroundColor(try {
                Color.parseColor(vendor.accent.ifBlank { "#102019" })
            } catch (_: Exception) {
                backgroundStrong
            })
        }
        cover.addView(coverBg, FrameLayout.LayoutParams(match(), dp(96)))
        if (vendor.coverImage.isNotBlank()) loadImage(coverBg, vendor.coverImage)

        // Logo circle overlapping bottom of cover
        val logoWrap = FrameLayout(this).apply {
            background = rounded(Color.WHITE, Color.WHITE, dp(24).toFloat())
            elevation = dp(4).toFloat()
        }
        if (vendor.coverImage.isNotBlank()) {
            val logoImg = ImageView(this).apply {
                scaleType = ImageView.ScaleType.CENTER_CROP
            }
            logoWrap.addView(logoImg, FrameLayout.LayoutParams(dp(48), dp(48)))
            // Use cover as logo crop fallback
            loadImage(logoImg, vendor.coverImage)
        } else {
            logoWrap.addView(TextView(this).apply {
                text = vendor.logoMark.ifBlank { vendor.name.trim().take(2).uppercase(Locale.US) }
                textSize = 14f
                gravity = Gravity.CENTER
                setTextColor(Color.WHITE)
                typeface = Typeface.DEFAULT_BOLD
                background = gradient(brand, brandDark, dp(24).toFloat())
            }, FrameLayout.LayoutParams(dp(48), dp(48)))
        }
        cover.addView(
            logoWrap,
            FrameLayout.LayoutParams(dp(48), dp(48), Gravity.BOTTOM or Gravity.START).apply {
                leftMargin = dp(14); bottomMargin = dp(-24)
            }
        )
        card.addView(cover, LinearLayout.LayoutParams(match(), dp(96)))

        val body = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(32), dp(14), dp(14))
        }
        val top = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        top.addView(text(vendor.name, 17f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wrap(), 1f))
        if (vendor.rating > 0) {
            top.addView(TextView(this).apply {
                text = "★ ${String.format(Locale.US, "%.1f", vendor.rating)}"
                textSize = 12f
                setTextColor(amber)
                typeface = Typeface.DEFAULT_BOLD
                background = rounded(Color.TRANSPARENT, Color.rgb(252, 246, 230), dp(12).toFloat())
                setPadding(dp(10), dp(5), dp(10), dp(5))
            })
        }
        body.addView(top)
        body.addView(text("${vendor.location} · ${vendor.headline}", 13f, muted, Typeface.NORMAL).apply {
            setPadding(0, dp(6), 0, 0)
            maxLines = 2
        })
        body.addView(text("${vendor.activeProducts} products · ${vendor.responseTime}", 12f, brand, Typeface.BOLD).apply {
            setPadding(0, dp(6), 0, dp(10))
        })
        body.addView(secondaryButton("Visit store") {
            startActivity(Intent(this, VendorProfileActivity::class.java).putExtra("slug", vendor.slug))
            overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
        })
        card.addView(body)
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
        // Shop is an internal surface (search/category), not a dock tab
        Tab.values().filter { it != Tab.Shop }.forEach { tab ->
            val active = when (tab) {
                Tab.Browse -> browseSheetOpen
                Tab.Home, Tab.Stores, Tab.Cart -> tab == currentTab && !browseSheetOpen
                Tab.Shop -> false
                Tab.Request, Tab.Account -> false
            }

            val item = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER_HORIZONTAL or Gravity.CENTER_VERTICAL
                setPadding(0, if (tab == Tab.Browse && active) dp(0) else dp(2), 0, 0)
                if (tab == Tab.Browse && active) {
                    background = GradientDrawable().apply {
                        setColor(Color.TRANSPARENT)
                        setStroke(0, Color.TRANSPARENT)
                    }
                    // gold top border accent
                    setBackgroundColor(Color.TRANSPARENT)
                }
                pressable()
                setOnClickListener { render(tab) }
            }

            // Gold top edge for active Browse (Photo Factory)
            if (tab == Tab.Browse) {
                item.addView(View(this).apply {
                    setBackgroundColor(if (active) gold else Color.TRANSPARENT)
                }, LinearLayout.LayoutParams(dp(28), dp(3)).apply {
                    bottomMargin = dp(2)
                    gravity = Gravity.CENTER_HORIZONTAL
                })
            }

            val iconWrap = FrameLayout(this)
            val icon = ImageView(this).apply {
                setImageResource(tab.iconRes)
                setColorFilter(if (active) gold else Color.argb(200, 255, 255, 255))
            }
            iconWrap.addView(icon, FrameLayout.LayoutParams(dp(22), dp(22), Gravity.CENTER))

            if (tab == Tab.Cart && cartCount() > 0) {
                iconWrap.addView(TextView(this).apply {
                    text = if (cartCount() > 9) "9+" else cartCount().toString()
                    textSize = 9f
                    gravity = Gravity.CENTER
                    setTextColor(Color.WHITE)
                    typeface = Typeface.DEFAULT_BOLD
                    background = rounded(Color.TRANSPARENT, brand, dp(8).toFloat())
                    setPadding(dp(3), 0, dp(3), 0)
                }, FrameLayout.LayoutParams(wrap(), dp(16), Gravity.TOP or Gravity.END))
            }

            val labelView = TextView(this).apply {
                text = tab.label
                gravity = Gravity.CENTER
                textSize = 10f
                typeface = if (active) Typeface.DEFAULT_BOLD else Typeface.DEFAULT
                setTextColor(if (active) gold else Color.argb(180, 255, 255, 255))
            }

            item.addView(iconWrap, LinearLayout.LayoutParams(dp(28), dp(24)))
            item.addView(labelView, LinearLayout.LayoutParams(wrap(), wrap()).apply {
                topMargin = dp(2)
                gravity = Gravity.CENTER_HORIZONTAL
            })

            bottomTabs.addView(item, LinearLayout.LayoutParams(0, match(), 1f))
        }
    }

    // ---- Cart ----

    private fun addToCart(product: Product) {
        Cart.add(product.slug, product.name, product.price, heroImage = product.heroImage)
        NotificationsStore.pushEvent(this, "Added to cart", product.name)
        Toast.makeText(this, "${product.name} added to cart", Toast.LENGTH_SHORT).show()
        bumpCartTab()
    }

    private fun changeQty(slug: String, delta: Int) {
        Cart.changeQty(slug, delta)
        render(Tab.Cart)
    }

    private fun cartCount(): Int = Cart.count()

    private fun bumpCartTab() {
        renderTabs()
        val cartIndex = Tab.values().filter { it != Tab.Shop }.indexOf(Tab.Cart)
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
                compareAt = item.optDouble("compareAt", 0.0).let { if (it.isNaN()) 0.0 else it },
                rating = item.optDouble("rating", 0.0),
                reviewCount = item.optInt("reviewCount", 0),
                stockLabel = item.optString("stockLabel"),
                accent = item.optString("accent"),
                heroImage = item.optString("heroImage"),
                features = parseStrings(item.optJSONArray("features") ?: JSONArray()),
                vendorSlug = item.optString("vendorSlug"),
                vendorName = item.optString("vendorName"),
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
                activeProducts = item.optInt("activeProducts", 0),
                coverImage = item.optString("coverImage"),
                logoMark = item.optString("logoMark"),
                accent = item.optString("accent")
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
        overridePendingTransition(R.anim.slide_up_in, R.anim.fade_out)
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (android.os.Build.VERSION.SDK_INT < 33) return
        if (androidx.core.content.ContextCompat.checkSelfPermission(
                this,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        ) return
        androidx.core.app.ActivityCompat.requestPermissions(
            this,
            arrayOf(android.Manifest.permission.POST_NOTIFICATIONS),
            9101
        )
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
            putExtra("vendorSlug", product.vendorSlug)
            putExtra("vendorName", vendorName(product.vendorSlug).orEmpty())
            putExtra("features", ArrayList(product.features))
        })
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
    }

    /** Account button: jump to the dashboard if signed in, otherwise sign in. */
    private fun openAccount() {
        val target = if (Net.isLoggedIn()) DashboardActivity::class.java else SignInActivity::class.java
        startActivity(Intent(this, target))
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
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
        Browse("Browse", R.drawable.ic_menu),
        Request("Request", R.drawable.ic_box),
        Stores("Stores", R.drawable.ic_store),
        Account("Account", R.drawable.ic_person),
        Cart("Cart", R.drawable.ic_cart),
        /** Internal shop surface opened via search / category, not a dock tab */
        Shop("Shop", R.drawable.ic_shop)
    }

    private data class Product(
        val slug: String,
        val name: String,
        val category: String,
        val badge: String,
        val description: String,
        val price: Double,
        val compareAt: Double = 0.0,
        val rating: Double = 0.0,
        val reviewCount: Int = 0,
        val stockLabel: String,
        val accent: String,
        val heroImage: String,
        val features: List<String>,
        val vendorSlug: String,
        val vendorName: String = "",
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
        val activeProducts: Int,
        val coverImage: String = "",
        val logoMark: String = "",
        val accent: String = ""
    )

    private companion object {
        // Stable key for tagging async image targets.
        const val R_TAG_KEY = 0x7f5a0001
    }
}
