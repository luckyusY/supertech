package africa.supertech.marketplace

import android.app.AlertDialog
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.Executors

/** Admin manage vendors — search, filters, enable/disable, view storefront. */
class AdminVendorsActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var listHost: LinearLayout
    private lateinit var filterHost: LinearLayout
    private lateinit var statsHost: LinearLayout

    private var allVendors = listOf<JSONObject>()
    private var query = ""
    private var filter = "All"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Net.session()?.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        val content = scaffold("Manage vendors", withBack = true)
        content.block(text("Search sellers, filter active/disabled, enable or hide stores.", 13f, muted), 10)
        content.block(
            listSearchField("Search vendor name, location, slug…") { q ->
                query = q
                applyFilters()
            },
            10
        )
        filterHost = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(filterHost, 10)
        rebuildFilterChips()
        statsHost = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(statsHost, 10)
        listHost = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(listHost, 0)
        load()
    }

    private fun rebuildFilterChips() {
        filterHost.removeAllViews()
        filterHost.addView(
            filterChips(listOf("All", "Active", "Disabled", "Built-in"), filter) { f ->
                filter = f
                rebuildFilterChips()
                applyFilters()
            }
        )
    }

    private fun load() {
        listHost.removeAllViews()
        listHost.addView(skeletonList(4))
        executor.execute {
            val result = Net.get("/api/admin/vendors")
            runOnUiThread {
                if (!result.ok) {
                    listHost.removeAllViews()
                    listHost.addView(errorCard(result.errorMessage("Could not load vendors.")))
                    return@runOnUiThread
                }
                allVendors = jsonArrayList(result.json().optJSONArray("vendors"))
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
        val filtered = allVendors.filter { v ->
            val disabled = v.optBoolean("disabled")
            val isSeed = v.optBoolean("isSeed")
            val statusOk = when (filter) {
                "All" -> true
                "Active" -> !disabled
                "Disabled" -> disabled
                "Built-in" -> isSeed
                else -> true
            }
            if (!statusOk) return@filter false
            if (q.isBlank()) return@filter true
            val hay = listOf(
                v.optString("name"),
                v.optString("slug"),
                v.optString("headline"),
                v.optString("location")
            ).joinToString(" ").lowercase(Locale.US)
            hay.contains(q)
        }

        statsHost.removeAllViews()
        val active = allVendors.count { !it.optBoolean("disabled") }
        val disabled = allVendors.size - active
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        row.addView(statCard("Active", active.toString()), LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(5) })
        row.addView(statCard("Disabled", disabled.toString()), LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
        statsHost.addView(row)
        statsHost.addView(text("Showing ${filtered.size} of ${allVendors.size}", 12f, muted).apply {
            setPadding(0, dp(8), 0, 0)
        })

        listHost.removeAllViews()
        if (filtered.isEmpty()) {
            listHost.addView(emptyCard("No vendors match your search or filter."))
            return
        }
        filtered.forEachIndexed { i, vendor ->
            listHost.addView(vendorCard(vendor, i + 1).also { animateIn(it, i) })
        }
        listHost.addView(
            secondaryButton("Review applications") {
                navigateForward(Intent(this, AdminModerationActivity::class.java))
            }.apply { minimumHeight = dp(48) },
            LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(8) }
        )
        animateContentIn(listHost)
    }

    private fun vendorCard(vendor: JSONObject, index: Int): View {
        val slug = vendor.optString("slug")
        val disabled = vendor.optBoolean("disabled")
        val isSeed = vendor.optBoolean("isSeed")
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        col.addView(
            numberedThumbRow(
                index = index,
                imageUrl = vendor.optString("coverImage").ifBlank { vendor.optString("logo") },
                title = vendor.optString("name", slug),
                meta = "${vendor.optString("location", "Rwanda")} · ${vendor.optInt("activeProducts")} products · ★ ${String.format(Locale.US, "%.1f", vendor.optDouble("rating", 0.0))}",
                statusLabel = when {
                    disabled -> "Disabled"
                    isSeed -> "Built-in"
                    else -> "Active"
                },
                statusFill = if (disabled) android.graphics.Color.rgb(252, 246, 230) else softGreen,
                statusFg = if (disabled) amber else brand,
                onClick = {
                    navigateForward(Intent(this, VendorProfileActivity::class.java).putExtra("slug", slug))
                }
            )
        )
        if (vendor.optString("headline").isNotBlank()) {
            col.addView(text(vendor.optString("headline"), 13f, muted).apply {
                setPadding(dp(12), 0, dp(12), dp(6))
            })
        }
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp(4), 0, dp(4), dp(4))
        }
        row.addView(
            secondaryButton("View store") {
                navigateForward(Intent(this, VendorProfileActivity::class.java).putExtra("slug", slug))
            },
            LinearLayout.LayoutParams(0, dp(48), 1f).apply { rightMargin = dp(6) }
        )
        row.addView(
            if (disabled) successButton("Enable") { update(slug, "enable", isSeed) }
            else secondaryButton("Disable") { update(slug, "disable", isSeed) },
            LinearLayout.LayoutParams(0, dp(48), 1f).apply { rightMargin = dp(6); leftMargin = dp(6) }
        )
        row.addView(
            dangerButton(if (isSeed) "Hide" else "Delete") { confirmDelete(slug, isSeed) },
            LinearLayout.LayoutParams(0, dp(48), 1f).apply { leftMargin = dp(6) }
        )
        col.addView(row, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(12) })
        return col
    }

    private fun confirmDelete(slug: String, isSeed: Boolean) {
        AlertDialog.Builder(this)
            .setTitle(if (isSeed) "Hide vendor?" else "Delete vendor?")
            .setMessage(if (isSeed) "This built-in vendor will be hidden from the marketplace." else "This vendor account will be removed.")
            .setNegativeButton("Cancel", null)
            .setPositiveButton(if (isSeed) "Hide" else "Delete") { _, _ -> update(slug, "delete", isSeed) }
            .show()
    }

    private fun update(slug: String, action: String, isSeed: Boolean) {
        toast("Updating…")
        executor.execute {
            val result = Net.patch(
                "/api/admin/vendors",
                JSONObject().put("slug", slug).put("action", action).put("isSeed", isSeed)
            )
            runOnUiThread {
                if (result.ok) {
                    toast("Vendor updated")
                    load()
                } else {
                    toast(result.errorMessage("Update failed"))
                }
            }
        }
    }

    private fun errorCard(message: String): View {
        val c = card()
        c.addView(text("Could not load vendors", 16f, ink, Typeface.BOLD))
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
