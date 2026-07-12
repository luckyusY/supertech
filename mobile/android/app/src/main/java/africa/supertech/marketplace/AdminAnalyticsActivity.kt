package africa.supertech.marketplace

import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

class AdminAnalyticsActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD
    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Net.session()?.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        val content = scaffold("Analytics", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading analytics...", 14f, muted))
        executor.execute {
            val result = Net.get("/api/analytics")
            runOnUiThread { render(result) }
        }
    }

    private fun render(result: Net.Result) {
        body.removeAllViews()
        if (!result.ok) {
            body.addView(errorCard(result.errorMessage("Could not load analytics.")))
            return
        }
        val a = result.json()
        body.block(stats(a), 12)
        body.addView(sectionTitle("Vendor performance"))
        val rows = a.optJSONArray("vendorBreakdown")
        if (rows == null || rows.length() == 0) {
            body.addView(emptyCard("No vendor performance yet."))
        } else {
            for (i in 0 until rows.length()) {
                val row = rows.optJSONObject(i) ?: continue
                body.addView(vendorCard(row).also { animateIn(it, i) })
            }
        }
    }

    private fun stats(a: JSONObject): View {
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        val items = listOf(
            "Vendors" to a.optInt("totalVendors").toString(),
            "Products" to a.optInt("totalProducts").toString(),
            "Gross sales" to "RWF ${money.format(a.optLong("totalGrossSales"))}",
            "Commission" to "RWF ${money.format(a.optLong("totalCommission"))}",
            "Net payouts" to "RWF ${money.format(a.optLong("totalNetPayouts"))}",
            "Orders" to a.optInt("totalOrders").toString()
        )
        items.chunked(2).forEach { pair ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEachIndexed { index, item ->
                row.addView(statCard(item.first, item.second), LinearLayout.LayoutParams(0, wc(), 1f).apply {
                    leftMargin = if (index == 0) 0 else dp(5)
                    rightMargin = if (index == 0) dp(5) else 0
                    bottomMargin = dp(10)
                })
            }
            col.addView(row)
        }
        return col
    }

    private fun vendorCard(row: JSONObject): View {
        val c = card()
        c.addView(text(row.optString("vendorName", "Vendor"), 16f, ink, Typeface.BOLD))
        c.addView(text("Gross RWF ${money.format(row.optLong("grossSales"))} · Net RWF ${money.format(row.optLong("netPayout"))}", 13f, muted))
        c.addView(text("${row.optInt("activeProducts")} products · fulfillment ${row.optString("fulfillmentRate", "—")}", 13f, brand, Typeface.BOLD))
        return margin(c)
    }

    private fun errorCard(message: String): View {
        val c = card()
        c.addView(text("Could not load analytics", 16f, ink, Typeface.BOLD))
        c.addView(text(message, 13f, muted))
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
