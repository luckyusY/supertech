package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

/** Native payouts — vendors see their payout history, admins see summaries. */
class PayoutsActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD

    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val session = Net.session()
        if (session == null) { startActivity(android.content.Intent(this, SignInActivity::class.java)); finish(); return }

        val content = scaffold("Payouts", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load(session)
    }

    private fun load(session: Net.Session) {
        body.removeAllViews()
        body.addView(text("Loading payouts…", 14f, muted))
        executor.execute {
            val result = Net.get("/api/payouts")
            runOnUiThread {
                body.removeAllViews()
                if (!result.ok) {
                    body.addView(infoCard(if (result.code == 0) "No connection." else result.errorMessage("Could not load payouts.")))
                    return@runOnUiThread
                }
                if (session.role == "admin") renderSummaries(result.json())
                else renderVendorPayouts(result.json())
            }
        }
    }

    private fun renderVendorPayouts(json: JSONObject) {
        val payouts = json.optJSONArray("payouts")
        if (payouts == null || payouts.length() == 0) {
            body.addView(infoCard("No payouts yet."))
            return
        }
        var paid = 0.0
        var pending = 0.0
        for (i in 0 until payouts.length()) {
            val p = payouts.optJSONObject(i) ?: continue
            val net = p.optDouble("netPayout", 0.0)
            if (p.optString("status") == "paid") paid += net else pending += net
        }
        
        val total = paid + pending
        val ratio = if (total > 0) (paid / total * 100).toInt() else 100

        val hero = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(18), dp(18), dp(18))
            background = gradient(backgroundStrong, brandDark, dp(16).toFloat())
            elevation = dp(4).toFloat()
        }
        hero.addView(text("Payout summary", 13f, Color.argb(190, 255, 255, 255), Typeface.BOLD))
        hero.addView(text("RWF ${money.format(paid)}", 26f, Color.WHITE, Typeface.BOLD).apply {
            setPadding(0, dp(4), 0, dp(2))
        })
        hero.addView(text("Total earned · RWF ${money.format(pending)} pending", 12f, Color.argb(190, 255, 255, 255)))

        val barContainer = FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, Color.argb(40, 255, 255, 255), dp(4).toFloat())
        }
        val barFill = View(this).apply {
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(4).toFloat())
        }
        val widthPixels = resources.displayMetrics.widthPixels
        val fillWidth = (widthPixels * 0.7 * (ratio / 100f)).toInt().coerceAtLeast(dp(8))
        barContainer.addView(barFill, FrameLayout.LayoutParams(fillWidth, dp(8)))
        hero.addView(barContainer, LinearLayout.LayoutParams(mp(), dp(8)).apply { topMargin = dp(14) })
        hero.addView(text("$ratio% processed", 11f, Color.WHITE).apply {
            setPadding(0, dp(6), 0, 0)
        })

        body.block(hero, 16)

        body.addView(sectionTitle("Payout history"))
        for (i in 0 until payouts.length()) {
            val p = payouts.optJSONObject(i) ?: continue
            body.addView(payoutCard(p).also { animateIn(it, i) })
        }
    }

    private fun renderSummaries(json: JSONObject) {
        val summaries = json.optJSONArray("summaries")
        if (summaries == null || summaries.length() == 0) {
            body.addView(infoCard("No payout summaries yet."))
            return
        }
        body.addView(sectionTitle("Vendor payouts"))
        for (i in 0 until summaries.length()) {
            val s = summaries.optJSONObject(i) ?: continue
            val cardView = card()
            cardView.addView(text(s.optString("vendorName", "Vendor"), 16f, ink, Typeface.BOLD))
            cardView.addView(text("Paid RWF ${money.format(s.optDouble("totalPaid", 0.0))} · Pending RWF ${money.format(s.optDouble("totalPending", 0.0))}", 13f, muted))
            val next = s.optString("nextPayout")
            if (next.length >= 10) cardView.addView(text("Next payout ${next.substring(0, 10)}", 12f, amber, Typeface.BOLD))
            body.addView(margin(cardView).also { animateIn(it, i) })
        }
    }

    private fun payoutCard(p: JSONObject): View {
        val cardView = card()
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(text("RWF ${money.format(p.optDouble("netPayout", 0.0))}", 17f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        top.addView(statusChip(p.optString("status")))
        cardView.addView(top)
        cardView.addView(text("Period ${p.optString("period", "—")} · ${p.optInt("orderCount")} orders", 13f, muted))
        cardView.addView(text("Gross RWF ${money.format(p.optDouble("grossSales", 0.0))} · ${(p.optDouble("commissionRate", 0.08) * 100).toInt()}% commission", 12f, muted))
        return margin(cardView)
    }

    private fun statusChip(status: String): View {
        val label = status.replace("_", " ").replaceFirstChar { it.uppercase() }
        val (fill, fg) = when (status) {
            "paid" -> softGreen to brand
            "on_hold" -> Color.rgb(253, 232, 232) to danger
            else -> Color.rgb(252, 246, 230) to amber
        }
        return chip(label, fill, fg)
    }

    private fun statRow(l1: String, v1: String, l2: String, v2: String): View {
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        row.addView(statCard(l1, v1), LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(5) })
        row.addView(statCard(l2, v2), LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
        return row
    }

    private fun infoCard(message: String): View {
        val c = card()
        c.addView(text(message, 14f, muted))
        return margin(c)
    }

    private fun margin(view: View, bottom: Int = 12): View {
        view.layoutParams = LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(bottom) }
        return view
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
