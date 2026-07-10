package africa.supertech.marketplace

import android.app.AlertDialog
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

/** Native order requests list (admin sees all, vendor sees their own). Admins can update status. */
class OrdersActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var body: LinearLayout
    private var isAdmin = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val session = Net.session()
        if (session == null) { startActivity(android.content.Intent(this, SignInActivity::class.java)); finish(); return }
        isAdmin = session.role == "admin"

        val content = scaffold("Orders", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading orders…", 14f, muted))
        executor.execute {
            val result = Net.get("/api/order-requests?limit=50")
            runOnUiThread {
                body.removeAllViews()
                if (!result.ok) {
                    body.addView(errorCard(if (result.code == 0) "No connection." else result.errorMessage("Could not load orders.")))
                    return@runOnUiThread
                }
                val orders = result.json().optJSONArray("orders")
                if (orders == null || orders.length() == 0) {
                    body.addView(errorCard("No orders yet."))
                    return@runOnUiThread
                }
                for (i in 0 until orders.length()) {
                    val o = orders.optJSONObject(i) ?: continue
                    body.addView(orderCard(o).also { animateIn(it, i) })
                }
            }
        }
    }

    private fun orderCard(o: JSONObject): View {
        val id = o.optString("id").ifBlank { o.optString("_id") }
        val status = o.optString("status")
        val cardView = card()
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(text(o.optString("requestId", "Order"), 16f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        top.addView(statusChip(status))
        cardView.addView(top)

        val itemCount = o.optInt("itemCount", o.optInt("quantity", 1))
        val productName = o.optString("productName").ifBlank { "$itemCount item(s)" }
        cardView.addView(text(productName, 14f, ink).apply { setPadding(0, dp(6), 0, 0) })
        cardView.addView(text("${o.optString("customerName", "Customer")} · ${o.optString("city", "")}".trim(' ', '·'), 13f, muted))

        val total = o.optDouble("estimatedTotal", 0.0)
        val meta = buildString {
            if (total > 0) append("RWF ${money.format(total)} · ")
            append(paymentLabel(o.optString("paymentPreference")))
            val created = o.optString("createdAt")
            if (created.length >= 10) append(" · ${created.substring(0, 10)}")
        }
        cardView.addView(text(meta, 12f, muted).apply { setPadding(0, dp(4), 0, 8) })

        if (isAdmin && status != "completed" && status != "cancelled") {
            val actionsLayout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(0, dp(8), 0, 0)
            }

            val (nextStatus, actionLabel) = when (status) {
                "pending_confirmation" -> "confirmed" to "Confirm"
                "confirmed" -> "preparing" to "Prepare"
                "preparing" -> "ready_for_delivery" to "Ready"
                "ready_for_delivery" -> "out_for_delivery" to "Deliver"
                "out_for_delivery" -> "completed" to "Complete"
                else -> "" to ""
            }

            if (nextStatus.isNotBlank()) {
                val btnNext = secondaryButton(actionLabel) {
                    updateStatus(id, nextStatus)
                }
                val lp = LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(4) }
                actionsLayout.addView(btnNext, lp)
            }

            val btnCancel = secondaryButton("Cancel") {
                confirmCancel(id)
            }.apply {
                setTextColor(danger)
            }
            val lpCancel = LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(4) }
            actionsLayout.addView(btnCancel, lpCancel)

            cardView.addView(actionsLayout)
        }

        return margin(cardView)
    }

    private fun updateStatus(id: String, nextStatus: String) {
        body.removeAllViews()
        body.addView(text("Updating order status...", 14f, muted))
        executor.execute {
            val payload = JSONObject().put("status", nextStatus)
            val result = Net.patch("/api/order-requests/$id", payload)
            runOnUiThread {
                if (result.ok) {
                    toast("Order updated")
                } else {
                    toast(result.errorMessage("Failed to update order"))
                }
                load()
            }
        }
    }

    private fun confirmCancel(id: String) {
        AlertDialog.Builder(this)
            .setTitle("Cancel Order?")
            .setMessage("Are you sure you want to cancel this order request?")
            .setNegativeButton("No", null)
            .setPositiveButton("Yes, Cancel") { _, _ ->
                updateStatus(id, "cancelled")
            }
            .show()
    }

    private fun statusChip(status: String): View {
        val label = status.replace("_", " ").replaceFirstChar { it.uppercase() }
        val (fill, fg) = when (status) {
            "completed" -> softGreen to brand
            "cancelled" -> Color.rgb(253, 232, 232) to danger
            "out_for_delivery", "ready_for_delivery" -> Color.rgb(230, 240, 252) to Color.rgb(44, 105, 204)
            else -> Color.rgb(252, 246, 230) to amber
        }
        return chip(label, fill, fg)
    }

    private fun paymentLabel(pref: String): String = when (pref) {
        "mobile_money" -> "Mobile money"
        "cash_on_delivery" -> "Cash on delivery"
        "bank_transfer" -> "Bank transfer"
        "manual_arrangement" -> "Arrange later"
        else -> pref.replace("_", " ").ifBlank { "—" }
    }

    private fun errorCard(message: String): View {
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
