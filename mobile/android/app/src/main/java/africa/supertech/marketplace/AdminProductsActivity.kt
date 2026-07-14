package africa.supertech.marketplace

import android.app.AlertDialog
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import org.json.JSONArray
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Admin products — search, status filters, edit submission, enable/disable seeds, delete.
 */
class AdminProductsActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var listHost: LinearLayout
    private lateinit var filterHost: LinearLayout

    private var allSubmissions = listOf<JSONObject>()
    private var allSeeds = listOf<JSONObject>()
    private var query = ""
    private var filter = "All"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Net.session()?.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        val content = scaffold("Manage products", withBack = true)
        content.block(
            text("Search, filter, edit vendor listings, enable or hide built-in products.", 13f, muted),
            10
        )
        content.block(
            listSearchField("Search name, vendor, category…") { q ->
                query = q
                applyFilters()
            },
            10
        )
        filterHost = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(filterHost, 12)
        rebuildFilterChips()

        listHost = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(listHost, 0)
        load()
    }

    private fun rebuildFilterChips() {
        filterHost.removeAllViews()
        filterHost.addView(
            filterChips(
                listOf("All", "In review", "Approved", "Rejected", "Built-in", "Disabled"),
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
        listHost.addView(skeletonList(4))
        animateContentIn(listHost)
        executor.execute {
            val result = Net.get("/api/admin/products")
            runOnUiThread {
                if (!result.ok) {
                    listHost.removeAllViews()
                    listHost.addView(errorCard(result.errorMessage("Could not load products.")))
                    return@runOnUiThread
                }
                val json = result.json()
                allSubmissions = jsonArrayList(json.optJSONArray("submissions"))
                allSeeds = jsonArrayList(json.optJSONArray("seedProducts"))
                applyFilters()
            }
        }
    }

    private fun jsonArrayList(arr: JSONArray?): List<JSONObject> {
        if (arr == null) return emptyList()
        return (0 until arr.length()).mapNotNull { arr.optJSONObject(it) }
    }

    private fun applyFilters() {
        listHost.removeAllViews()
        val q = query.trim().lowercase(Locale.US)

        fun matches(item: JSONObject): Boolean {
            if (q.isBlank()) return true
            val hay = listOf(
                item.optString("name"),
                item.optString("category"),
                item.optString("vendorSlug"),
                item.optString("vendorName"),
                item.optString("slug"),
                item.optString("status")
            ).joinToString(" ").lowercase(Locale.US)
            return hay.contains(q)
        }

        val subs = allSubmissions.filter { item ->
            if (!matches(item)) return@filter false
            val st = item.optString("status")
            when (filter) {
                "All" -> true
                "In review" -> st == "pending_review" || st.contains("pending")
                "Approved" -> st == "approved"
                "Rejected" -> st == "rejected"
                else -> false
            }
        }
        val seedFiltered = allSeeds.filter { item ->
            if (!matches(item)) return@filter false
            when (filter) {
                "All" -> true
                "Built-in" -> !item.optBoolean("disabled")
                "Disabled" -> item.optBoolean("disabled")
                else -> false
            }
        }

        var index = 1
        if (filter != "Built-in" && filter != "Disabled") {
            listHost.addView(sectionTitle("Vendor submissions (${subs.size})"))
            if (subs.isEmpty()) {
                listHost.addView(emptyCard("No submissions match."))
            } else {
                subs.forEach { item ->
                    listHost.addView(submissionCard(item, index++).also { animateIn(it, index) })
                }
            }
        }

        if (filter == "All" || filter == "Built-in" || filter == "Disabled") {
            listHost.addView(sectionTitle("Built-in products (${seedFiltered.size})"))
            if (seedFiltered.isEmpty()) {
                listHost.addView(emptyCard("No built-in products match."))
            } else {
                seedFiltered.forEach { item ->
                    listHost.addView(seedCard(item, index++).also { animateIn(it, index) })
                }
            }
        }

        listHost.addView(
            primaryButton("Open approvals") {
                navigateForward(Intent(this, AdminModerationActivity::class.java))
            }.apply { minimumHeight = dp(52) },
            LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(12); bottomMargin = dp(8) }
        )
        animateContentIn(listHost)
    }

    private fun submissionCard(item: JSONObject, index: Int): View {
        val id = item.optString("id").ifBlank { item.optString("_id") }
        val slug = item.optString("slug")
        val status = item.optString("status", "pending_review")
        val (fill, fg) = when (status) {
            "approved", "built-in" -> softGreen to brand
            "rejected", "disabled" -> android.graphics.Color.rgb(253, 232, 232) to danger
            else -> android.graphics.Color.rgb(252, 246, 230) to amber
        }
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        col.addView(
            numberedThumbRow(
                index = index,
                imageUrl = item.optString("heroImage"),
                title = item.optString("name", "Product"),
                meta = "${item.optString("vendorName", item.optString("vendorSlug"))} · ${item.optString("category")}",
                statusLabel = status.replace("_", " "),
                statusFill = fill,
                statusFg = fg,
                money = "RWF ${money.format(item.optDouble("price", 0.0).toLong())}",
                onClick = { openEdit(item) }
            )
        )
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp(4), 0, dp(4), dp(4))
        }
        if (status == "pending_review" || status == "pending") {
            val approveRow = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(dp(4), 0, dp(4), dp(4))
            }
            approveRow.addView(
                successButton("Approve") {
                    update(JSONObject().put("id", id).put("action", "approve"))
                },
                LinearLayout.LayoutParams(0, dp(48), 1f).apply { rightMargin = dp(6) }
            )
            approveRow.addView(
                dangerButton("Reject") {
                    update(JSONObject().put("id", id).put("action", "reject"))
                },
                LinearLayout.LayoutParams(0, dp(48), 1f).apply { leftMargin = dp(6) }
            )
            col.addView(approveRow, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(6) })
        }

        row.addView(
            primaryButton("Edit") { openEdit(item) },
            LinearLayout.LayoutParams(0, dp(48), 1f).apply { rightMargin = dp(6) }
        )
        if (status == "approved") {
            row.addView(
                secondaryButton("Blog") { openBlogStudio(slug) },
                LinearLayout.LayoutParams(0, dp(48), 1f).apply { rightMargin = dp(6); leftMargin = dp(6) }
            )
        }
        row.addView(
            dangerButton("Delete") { confirmProductDelete(id, false, slug) },
            LinearLayout.LayoutParams(0, dp(48), 1f).apply { leftMargin = dp(6) }
        )
        col.addView(row, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })
        return col
    }

    private fun seedCard(item: JSONObject, index: Int): View {
        val slug = item.optString("slug")
        val disabled = item.optBoolean("disabled")
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            alpha = if (disabled) 0.72f else 1f
        }
        col.addView(
            numberedThumbRow(
                index = index,
                imageUrl = item.optString("heroImage"),
                title = item.optString("name", "Product"),
                meta = "${item.optString("vendorSlug")} · ${item.optString("category")}",
                statusLabel = if (disabled) "disabled" else "built-in",
                statusFill = if (disabled) android.graphics.Color.rgb(253, 232, 232) else softGreen,
                statusFg = if (disabled) danger else brand,
                money = "RWF ${money.format(item.optDouble("price", 0.0).toLong())}"
            )
        )
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp(4), 0, dp(4), dp(4))
        }
        row.addView(
            if (disabled) successButton("Enable") {
                update(JSONObject().put("slug", slug).put("action", "enable").put("isSeed", true))
            } else secondaryButton("Disable") {
                update(JSONObject().put("slug", slug).put("action", "disable").put("isSeed", true))
            },
            LinearLayout.LayoutParams(0, dp(48), 1f).apply { rightMargin = dp(6) }
        )
        row.addView(
            secondaryButton("Blog") { openBlogStudio(slug) },
            LinearLayout.LayoutParams(0, dp(48), 1f).apply { leftMargin = dp(6) }
        )
        col.addView(row, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })
        return col
    }

    private fun openEdit(item: JSONObject) {
        val features = ArrayList<String>()
        item.optJSONArray("features")?.let { arr ->
            for (i in 0 until arr.length()) arr.optString(i).takeIf { it.isNotBlank() }?.let(features::add)
        }
        navigateForward(
            Intent(this, VendorProductActivity::class.java).apply {
                putExtra("editId", item.optString("id").ifBlank { item.optString("_id") })
                putExtra("name", item.optString("name"))
                putExtra("category", item.optString("category"))
                putExtra("price", item.optDouble("price", 0.0))
                putExtra("badge", item.optString("badge"))
                putExtra("stockLabel", item.optString("stockLabel"))
                putExtra("shipWindow", item.optString("shipWindow"))
                putExtra("description", item.optString("description"))
                putExtra("heroImage", item.optString("heroImage"))
                putExtra("features", features)
                putExtra("adminEdit", true)
            }
        )
    }

    private fun confirmProductDelete(id: String, isSeed: Boolean, slug: String) {
        AlertDialog.Builder(this)
            .setTitle("Delete product?")
            .setMessage("This removes the product from admin listings.")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Delete") { _, _ ->
                update(JSONObject().put("id", id).put("slug", slug).put("action", "delete").put("isSeed", isSeed))
            }
            .show()
    }

    private fun openBlogStudio(slug: String) {
        navigateForward(Intent(this, AdminAiStudioActivity::class.java).putExtra("productSlug", slug))
    }

    private fun update(payload: JSONObject) {
        toast("Updating…")
        executor.execute {
            val result = Net.patch("/api/admin/products", payload)
            runOnUiThread {
                if (result.ok) {
                    toast("Product updated")
                    load()
                } else {
                    toast(result.errorMessage("Update failed"))
                }
            }
        }
    }

    private fun errorCard(message: String): View {
        val c = card()
        c.addView(text("Could not load products", 16f, ink, Typeface.BOLD))
        c.addView(text(message, 13f, muted))
        c.addView(primaryButton("Try again") { load() }, LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(12) })
        return c
    }

    private fun emptyCard(message: String): View {
        val c = card()
        c.addView(text(message, 14f, muted))
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(c, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(12) })
        }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
