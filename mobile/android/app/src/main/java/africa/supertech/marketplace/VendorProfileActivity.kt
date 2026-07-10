package africa.supertech.marketplace

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

class VendorProfileActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var body: LinearLayout
    private var slug: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        slug = intent.getStringExtra("slug").orEmpty()
        if (slug.isBlank()) {
            toast("Missing vendor")
            finish()
            return
        }
        val content = scaffold("Vendor", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading vendor...", 14f, muted))
        executor.execute {
            val result = Net.get("/api/mobile/marketplace")
            runOnUiThread { render(result) }
        }
    }

    private fun render(result: Net.Result) {
        body.removeAllViews()
        if (!result.ok) {
            body.addView(errorCard(result.errorMessage("Could not load vendor.")))
            return
        }
        val json = result.json()
        val vendors = json.optJSONArray("vendors")
        val vendor = (0 until (vendors?.length() ?: 0))
            .mapNotNull { vendors?.optJSONObject(it) }
            .firstOrNull { it.optString("slug") == slug }
        if (vendor == null) {
            body.addView(errorCard("Vendor is not available right now."))
            return
        }
        body.block(vendorHeader(vendor), 14)
        body.addView(sectionTitle("Products"))
        val products = json.optJSONArray("products")
        var count = 0
        for (i in 0 until (products?.length() ?: 0)) {
            val product = products?.optJSONObject(i) ?: continue
            if (product.optString("vendorSlug") != slug) continue
            body.addView(productCard(product).also { animateIn(it, count) })
            count++
        }
        if (count == 0) body.addView(emptyCard("No active products from this vendor yet."))
    }

    private fun vendorHeader(vendor: JSONObject): View {
        val c = card()
        c.addView(text(vendor.optString("name", "Vendor"), 23f, ink, Typeface.BOLD))
        c.addView(text(vendor.optString("headline", "Trusted SuperTech vendor"), 14f, muted))
        c.addView(text("${vendor.optString("location", "Rwanda")} · ${vendor.optString("responseTime", "Within 24 hours")}", 13f, muted))
        c.addView(text("${vendor.optInt("activeProducts")} products · ${vendor.optString("fulfillmentRate", "—")} fulfillment", 13f, brand, Typeface.BOLD))
        val cats = vendor.optJSONArray("categories")?.join(", ")?.replace("\"", "") ?: ""
        if (cats.isNotBlank()) c.addView(text(cats, 12f, muted))
        return c
    }

    private fun productCard(product: JSONObject): View {
        val c = card()
        c.pressable()
        c.setOnClickListener {
            startActivity(Intent(this, ProductDetailActivity::class.java).apply {
                putExtra("slug", product.optString("slug"))
                putExtra("name", product.optString("name"))
                putExtra("category", product.optString("category"))
                putExtra("description", product.optString("description"))
                putExtra("price", product.optDouble("price", 0.0))
                putExtra("stockLabel", product.optString("stockLabel"))
                putExtra("shipWindow", product.optString("shipWindow"))
                putExtra("heroImage", product.optString("heroImage"))
                putExtra("vendorSlug", product.optString("vendorSlug"))
            })
        }
        c.addView(text(product.optString("name", "Product"), 16f, ink, Typeface.BOLD))
        c.addView(text(product.optString("category", "Tech"), 13f, muted))
        c.addView(text("RWF ${money.format(product.optDouble("price", 0.0).toLong())}", 15f, brand, Typeface.BOLD))
        return margin(c)
    }

    private fun errorCard(message: String): View {
        val c = card()
        c.addView(text(message, 14f, muted))
        c.addView(primaryButton("Try again") { load() }, LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(12) })
        return c
    }

    private fun emptyCard(message: String): View {
        val c = card()
        c.addView(text(message, 14f, muted))
        return c
    }

    private fun margin(view: View): View {
        view.layoutParams = LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(12) }
        return view
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
