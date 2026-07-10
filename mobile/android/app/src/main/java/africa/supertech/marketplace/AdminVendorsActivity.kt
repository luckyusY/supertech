package africa.supertech.marketplace

import android.app.AlertDialog
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.Executors

class AdminVendorsActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Net.session()?.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        val content = scaffold("Manage Vendors", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading vendors...", 14f, muted))
        executor.execute {
            val result = Net.get("/api/admin/vendors")
            runOnUiThread { render(result) }
        }
    }

    private fun render(result: Net.Result) {
        body.removeAllViews()
        if (!result.ok) {
            body.addView(errorCard(result.errorMessage("Could not load vendors.")))
            return
        }
        val vendors = result.json().optJSONArray("vendors")
        val active = (0 until (vendors?.length() ?: 0)).count {
            vendors?.optJSONObject(it)?.optBoolean("disabled") == false
        }
        body.block(statGrid(active.toString(), "${(vendors?.length() ?: 0) - active}"), 12)
        if (vendors == null || vendors.length() == 0) {
            body.addView(emptyCard("No vendors found."))
            return
        }
        for (i in 0 until vendors.length()) {
            val vendor = vendors.optJSONObject(i) ?: continue
            body.addView(vendorCard(vendor).also { animateIn(it, i) })
        }
    }

    private fun statGrid(active: String, disabled: String): View {
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        row.addView(statCard("Active", active), LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(5) })
        row.addView(statCard("Disabled", disabled), LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
        return row
    }

    private fun vendorCard(vendor: JSONObject): View {
        val slug = vendor.optString("slug")
        val disabled = vendor.optBoolean("disabled")
        val isSeed = vendor.optBoolean("isSeed")
        val cardView = card()
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(text(vendor.optString("name", slug), 16f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        top.addView(chip(if (disabled) "Disabled" else "Active", if (disabled) android.graphics.Color.rgb(252, 246, 230) else softGreen, if (disabled) amber else brand))
        cardView.addView(top)
        if (isSeed) cardView.addView(text("Built-in vendor", 12f, brand, Typeface.BOLD))
        cardView.addView(text(vendor.optString("headline", "No headline"), 13f, muted))
        cardView.addView(text("${vendor.optString("location", "Rwanda")} · ${vendor.optInt("activeProducts")} products · ${String.format(Locale.US, "%.1f", vendor.optDouble("rating", 0.0))} rating", 12f, muted))
        cardView.addView(text(vendor.optJSONArray("categories")?.join(", ")?.replace("\"", "") ?: "No categories", 12f, muted))

        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, dp(10), 0, 0) }
        row.addView(secondaryButton(if (disabled) "Enable" else "Disable") {
            update(slug, if (disabled) "enable" else "disable", isSeed)
        }, LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(5) })
        row.addView(secondaryButton(if (isSeed) "Hide" else "Delete") {
            confirmDelete(slug, isSeed)
        }.apply { setTextColor(danger) }, LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
        cardView.addView(row)
        return margin(cardView)
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
        body.removeAllViews()
        body.addView(text("Updating vendor...", 14f, muted))
        executor.execute {
            val result = Net.patch(
                "/api/admin/vendors",
                JSONObject().put("slug", slug).put("action", action).put("isSeed", isSeed)
            )
            runOnUiThread {
                if (result.ok) {
                    toast("Vendor updated")
                    render(result)
                } else {
                    render(result)
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
