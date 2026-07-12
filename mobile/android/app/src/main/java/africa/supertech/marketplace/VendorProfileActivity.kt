package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Official store page — cover header + 2-col retail product cards (same as Home/Shop).
 */
class VendorProfileActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout
    private var slug: String = ""
    override fun dockHighlight(): DockTab = DockTab.STORES

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        slug = intent.getStringExtra("slug").orEmpty()
        if (slug.isBlank()) {
            toast("Missing vendor")
            finish()
            return
        }
        val content = scaffold("Official store", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(skeletonList(3))
        executor.execute {
            val result = Net.get("/api/mobile/marketplace")
            runOnUiThread { render(result) }
        }
    }

    private fun render(result: Net.Result) {
        body.removeAllViews()
        if (!result.ok) {
            body.addView(errorState(result.errorMessage("Could not load store."), onRetry = { load() }))
            return
        }
        val json = result.json()
        val vendors = json.optJSONArray("vendors")
        val vendor = (0 until (vendors?.length() ?: 0))
            .mapNotNull { vendors?.optJSONObject(it) }
            .firstOrNull { it.optString("slug") == slug }
        if (vendor == null) {
            body.addView(errorState("Store is not available right now.", onRetry = { load() }))
            return
        }
        body.block(vendorHeader(vendor), 14)
        body.addView(sectionTitle("Products from this store"))

        val catalog = ArrayList<CatalogProduct>()
        val products = json.optJSONArray("products")
        for (i in 0 until (products?.length() ?: 0)) {
            val p = products?.optJSONObject(i) ?: continue
            if (p.optString("vendorSlug") != slug) continue
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
        if (catalog.isEmpty()) {
            body.addView(
                emptyState(
                    "No active products yet",
                    "This store has no live listings right now.",
                    "Browse marketplace"
                ) { openMainTab("Home") }
            )
        } else {
            body.addView(text("${catalog.size} products", 12f, muted).apply { setPadding(0, 0, 0, dp(8)) })
            body.addView(retailProductGrid(catalog))
        }
        animateContentIn(body)
    }

    private fun vendorHeader(vendor: JSONObject): View {
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        val cover = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setBackgroundColor(try {
                Color.parseColor(vendor.optString("accent", "#0A0F1A"))
            } catch (_: Exception) {
                backgroundStrong
            })
            minimumHeight = dp(120)
        }
        val coverUrl = vendor.optString("coverImage")
        if (coverUrl.isNotBlank()) loadImage(cover, coverUrl)
        col.addView(cover, LinearLayout.LayoutParams(mp(), dp(120)))

        val c = card()
        c.addView(text(vendor.optString("name", "Vendor"), 22f, ink, Typeface.BOLD))
        c.addView(text(vendor.optString("headline", "Trusted SuperTech vendor"), 14f, muted).apply {
            setPadding(0, dp(4), 0, 0)
        })
        val rating = vendor.optDouble("rating", 0.0)
        c.addView(
            text(
                buildString {
                    append(vendor.optString("location", "Rwanda"))
                    if (rating > 0) append(" · ★ ${String.format(Locale.US, "%.1f", rating)}")
                    append(" · ${vendor.optInt("activeProducts")} products")
                },
                13f,
                brand,
                Typeface.BOLD
            ).apply { setPadding(0, dp(8), 0, 0) }
        )
        c.addView(
            text("Verified SuperTech seller · ${vendor.optString("responseTime", "Fast response")}", 12f, muted).apply {
                setPadding(0, dp(6), 0, 0)
            }
        )
        col.addView(c, LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(-20) })
        return col
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
