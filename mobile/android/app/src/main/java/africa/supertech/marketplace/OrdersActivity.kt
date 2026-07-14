package africa.supertech.marketplace

import android.app.AlertDialog
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import org.json.JSONArray
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

/** Native order requests list (admin sees all, vendor sees their own). Search + status filters. */
class OrdersActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var listHost: LinearLayout
    private lateinit var filterHost: LinearLayout
    private var isAdmin = false

    private var allOrders = listOf<JSONObject>()
    private var query = ""
    private var filter = "All"

    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val session = Net.session()
        if (session == null) {
            startActivity(android.content.Intent(this, SignInActivity::class.java))
            finish()
            return
        }
        isAdmin = session.role == "admin"

        val content = scaffold("Orders", withBack = true, onRefresh = { load() })
        content.block(
            text(
                if (isAdmin) "Search and filter all marketplace order requests."
                else "Your customer order requests.",
                13f,
                muted
            ),
            10
        )
        content.block(
            listSearchField("Search order id, customer, product…") { q ->
                query = q
                applyFilters()
            },
            10
        )
        filterHost = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(filterHost, 10)
        rebuildFilterChips()
        listHost = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(listHost, 0)
        load()
    }

    private fun rebuildFilterChips() {
        filterHost.removeAllViews()
        filterHost.addView(
            filterChips(
                listOf("All", "Actionable", "Pending", "In progress", "Done", "Cancelled"),
                filter
            ) { f ->
                filter = f
                rebuildFilterChips()
                applyFilters()
            }
        )
    }

    private fun load() {
        listHost.removeAllViews()
        listHost.addView(skeletonList(5))
        animateContentIn(listHost)
        executor.execute {
            val result = Net.get("/api/order-requests?limit=50")
            runOnUiThread {
                stopRefreshing()
                if (!result.ok) {
                    listHost.removeAllViews()
                    listHost.addView(
                        errorState(
                            if (result.code == 0) "No connection. Check internet and try again."
                            else result.errorMessage("Could not load orders."),
                            onRetry = { load() }
                        )
                    )
                    return@runOnUiThread
                }
                val orders = result.json().optJSONArray("orders")
                allOrders = jsonArrayList(orders)
                applyFilters()
            }
        }
    }

    private fun jsonArrayList(arr: JSONArray?): List<JSONObject> {
        if (arr == null) return emptyList()
        return (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
    }

    private fun applyFilters() {
        val q = query.trim().lowercase(Locale.US)
        val filtered = allOrders.filter { o ->
            val st = o.optString("status")
            val statusOk = when (filter) {
                "All" -> true
                "Actionable" -> st !in listOf("completed", "cancelled")
                "Pending" -> st == "pending_confirmation"
                "In progress" -> st in listOf(
                    "confirmed", "preparing", "ready_for_delivery", "out_for_delivery"
                )
                "Done" -> st == "completed"
                "Cancelled" -> st == "cancelled"
                else -> true
            }
            if (!statusOk) return@filter false
            if (q.isBlank()) return@filter true
            val hay = listOf(
                o.optString("requestId"),
                o.optString("customerName"),
                o.optString("productName"),
                o.optString("city"),
                o.optString("status"),
                o.optString("id")
            ).joinToString(" ").lowercase(Locale.US)
            hay.contains(q)
        }.sortedBy { o ->
            when (o.optString("status")) {
                "pending_confirmation" -> 0
                "confirmed" -> 1
                "preparing" -> 2
                "ready_for_delivery" -> 3
                "out_for_delivery" -> 4
                "completed" -> 8
                "cancelled" -> 9
                else -> 5
            }
        }

        listHost.removeAllViews()
        if (filtered.isEmpty()) {
            listHost.addView(
                emptyState(
                    "No orders match",
                    if (allOrders.isEmpty()) {
                        if (isAdmin) "Customer order requests will appear here."
                        else "When shoppers order your products, they show up here."
                    } else "Try another search or filter."
                )
            )
            return
        }
        listHost.addView(text("Showing ${filtered.size} of ${allOrders.size}", 12f, muted).apply {
            setPadding(0, 0, 0, dp(8))
        })
        filtered.forEachIndexed { i, o ->
            listHost.addView(orderCard(o, index = i + 1).also { animateIn(it, i) })
        }
        animateContentIn(listHost)
    }

    private fun orderCard(o: JSONObject, index: Int = 1): View {
        val id = o.optString("id").ifBlank { o.optString("_id") }
        val status = o.optString("status")
        val itemCount = o.optInt("itemCount", o.optInt("quantity", 1))
        val productName = o.optString("productName").ifBlank { "$itemCount item(s)" }
        val total = o.optDouble("estimatedTotal", 0.0)
        val imageUrl = o.optString("productImage").ifBlank { o.optString("heroImage") }
        val statusLabel = status.replace("_", " ").replaceFirstChar { it.uppercase() }
        val (fill, fg) = when (status) {
            "completed" -> softGreen to brand
            "cancelled" -> android.graphics.Color.rgb(253, 232, 232) to danger
            "pending_confirmation" -> android.graphics.Color.rgb(252, 246, 230) to amber
            else -> softGreen to brand
        }
        val meta = buildString {
            append(o.optString("customerName", "Customer"))
            val city = o.optString("city")
            if (city.isNotBlank()) append(" · $city")
            append(" · ${paymentLabel(o.optString("paymentPreference"))}")
        }
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        val row = numberedThumbRow(
            index = index,
            imageUrl = imageUrl.takeIf { it.isNotBlank() },
            title = o.optString("requestId", "Order"),
            meta = "$productName · $meta",
            statusLabel = statusLabel,
            statusFill = fill,
            statusFg = fg,
            money = if (total > 0) "RWF ${money.format(total)}" else null
        )
        row.pressable()
        row.setOnClickListener { showOrderDetailsDialog(o) }
        col.addView(row)

        val cardView = card()
        cardView.setPadding(dp(12), dp(8), dp(12), dp(12))

        if (isAdmin && status != "completed" && status != "cancelled") {
            val actionsLayout = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(0, dp(4), 0, 0)
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
                val btnNext = successButton(actionLabel) {
                    updateStatus(id, nextStatus)
                }
                val lp = LinearLayout.LayoutParams(0, dp(52), 1f).apply { rightMargin = dp(6) }
                actionsLayout.addView(btnNext, lp)
            }

            val btnCancel = dangerButton("Cancel") {
                confirmCancel(id)
            }
            val lpCancel = LinearLayout.LayoutParams(0, dp(52), 1f).apply { leftMargin = dp(6) }
            actionsLayout.addView(btnCancel, lpCancel)

            cardView.addView(actionsLayout)
            col.addView(cardView, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(8) })
        }

        return col
    }

    private fun showOrderDetailsDialog(o: JSONObject) {
        val dialog = com.google.android.material.bottomsheet.BottomSheetDialog(this)
        val scroll = android.widget.ScrollView(this).apply {
            overScrollMode = View.OVER_SCROLL_NEVER
        }
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(18), dp(18), dp(18))
        }

        layout.addView(text("Order details", 20f, ink, Typeface.BOLD))
        layout.addView(text("Request ID: ${o.optString("requestId", "—")}", 13f, muted).apply {
            setPadding(0, dp(2), 0, dp(14))
        })

        val status = o.optString("status")
        val statusLabel = status.replace("_", " ").replaceFirstChar { it.uppercase() }
        val (fill, fg) = when (status) {
            "completed" -> softGreen to brand
            "cancelled" -> android.graphics.Color.rgb(253, 232, 232) to danger
            "pending_confirmation" -> android.graphics.Color.rgb(252, 246, 230) to amber
            else -> softGreen to brand
        }
        val statusChip = chip(statusLabel, fill, fg).apply {
            setPadding(dp(10), dp(4), dp(10), dp(4))
        }
        val chipContainer = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            addView(statusChip)
        }
        layout.addView(chipContainer)
        layout.addView(View(this), LinearLayout.LayoutParams(mp(), dp(14)))

        val info = card()
        info.addView(text("Customer information", 14f, ink, Typeface.BOLD).apply {
            setPadding(0, 0, 0, dp(8))
        })
        info.addView(text("Name: ${o.optString("customerName", "—")}", 13f, ink))
        info.addView(text("Email: ${o.optString("customerEmail", "—")}", 13f, ink).apply { setPadding(0, dp(3), 0, 0) })
        info.addView(text("Phone: ${o.optString("customerPhone", "—")}", 13f, ink).apply { setPadding(0, dp(3), 0, 0) })
        info.addView(text("Location: ${o.optString("city", "—")} · ${o.optString("deliveryAddress", "—")}", 13f, ink).apply { setPadding(0, dp(3), 0, 0) })
        layout.addView(info)
        layout.addView(View(this), LinearLayout.LayoutParams(mp(), dp(14)))

        val pref = card()
        pref.addView(text("Fulfillment preferences", 14f, ink, Typeface.BOLD).apply {
            setPadding(0, 0, 0, dp(8))
        })
        pref.addView(text("Contact: ${o.optString("contactPreference", "—").uppercase(Locale.US)}", 13f, ink))
        pref.addView(text("Payment: ${paymentLabel(o.optString("paymentPreference"))}", 13f, ink).apply { setPadding(0, dp(3), 0, 0) })
        val notes = o.optString("notes")
        if (notes.isNotBlank()) {
            pref.addView(text("Notes: $notes", 13f, muted).apply { setPadding(0, dp(6), 0, 0) })
        }
        layout.addView(pref)
        layout.addView(View(this), LinearLayout.LayoutParams(mp(), dp(14)))

        val itemsCard = card()
        itemsCard.addView(text("Items", 14f, ink, Typeface.BOLD).apply {
            setPadding(0, 0, 0, dp(8))
        })
        val total = o.optDouble("estimatedTotal", 0.0)
        itemsCard.addView(text("${o.optString("productName", "Product")} · Qty ${o.optInt("quantity", 1)}", 13f, ink))
        itemsCard.addView(View(this).apply { setBackgroundColor(line) }, LinearLayout.LayoutParams(mp(), dp(1)).apply { topMargin = dp(8); bottomMargin = dp(8) })
        itemsCard.addView(text("Total: RWF ${money.format(total)}", 15f, brand, Typeface.BOLD))
        layout.addView(itemsCard)
        layout.addView(View(this), LinearLayout.LayoutParams(mp(), dp(18)))

        val btnClose = primaryButton("Close") { dialog.dismiss() }.apply {
            minimumHeight = dp(48)
        }
        layout.addView(btnClose)

        scroll.addView(layout)
        dialog.setContentView(scroll)
        dialog.show()
    }

    private fun updateStatus(id: String, nextStatus: String) {
        toast("Updating…")
        executor.execute {
            val payload = JSONObject().put("status", nextStatus)
            val result = Net.patch("/api/order-requests/$id", payload)
            runOnUiThread {
                if (result.ok) {
                    toast("Order updated")
                    load()
                } else {
                    toast(result.errorMessage("Failed to update order"))
                }
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

    private fun paymentLabel(pref: String): String = when (pref) {
        "mobile_money" -> "MoMo"
        "cash_on_delivery" -> "COD"
        "bank_transfer" -> "Bank"
        else -> pref.ifBlank { "Pay later" }.replace('_', ' ')
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
