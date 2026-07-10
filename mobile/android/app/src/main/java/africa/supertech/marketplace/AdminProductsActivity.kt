package africa.supertech.marketplace

import android.app.AlertDialog
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

class AdminProductsActivity : BaseActivity() {
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
        val content = scaffold("Products", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading products...", 14f, muted))
        executor.execute {
            val result = Net.get("/api/admin/products")
            runOnUiThread { render(result) }
        }
    }

    private fun render(result: Net.Result) {
        body.removeAllViews()
        if (!result.ok) {
            body.addView(errorCard(result.errorMessage("Could not load products.")))
            return
        }
        val json = result.json()
        val submissions = json.optJSONArray("submissions")
        val seeds = json.optJSONArray("seedProducts")

        body.addView(sectionTitle("Vendor submissions"))
        if (submissions == null || submissions.length() == 0) {
            body.addView(emptyCard("No vendor product submissions yet."))
        } else {
            for (i in 0 until submissions.length()) {
                val item = submissions.optJSONObject(i) ?: continue
                body.addView(submissionCard(item).also { animateIn(it, i) })
            }
        }

        body.addView(sectionTitle("Built-in products"))
        if (seeds == null || seeds.length() == 0) {
            body.addView(emptyCard("No built-in products found."))
        } else {
            for (i in 0 until seeds.length()) {
                val item = seeds.optJSONObject(i) ?: continue
                body.addView(seedCard(item).also { animateIn(it, i) })
            }
        }
    }

    private fun submissionCard(item: JSONObject): View {
        val id = item.optString("id").ifBlank { item.optString("_id") }
        val slug = item.optString("slug")
        val c = card()
        c.addView(titleRow(item.optString("name", "Product"), item.optString("status", "pending_review")))
        c.addView(text("${item.optString("vendorName", item.optString("vendorSlug"))} · ${item.optString("category")}", 13f, muted))
        c.addView(text("RWF ${money.format(item.optDouble("price", 0.0).toLong())}", 15f, brand, Typeface.BOLD))
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, dp(10), 0, 0) }
        row.addView(secondaryButton("Write blog") { openBlogStudio(slug) }, LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(5) })
        row.addView(secondaryButton("Delete") { confirmProductDelete(id, false, slug) }.apply { setTextColor(danger) }, LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
        c.addView(row)
        return margin(c)
    }

    private fun seedCard(item: JSONObject): View {
        val slug = item.optString("slug")
        val disabled = item.optBoolean("disabled")
        val c = card()
        c.alpha = if (disabled) 0.62f else 1f
        c.addView(titleRow(item.optString("name", "Product"), if (disabled) "disabled" else "built-in"))
        c.addView(text("${item.optString("vendorSlug")} · ${item.optString("category")}", 13f, muted))
        c.addView(text("RWF ${money.format(item.optDouble("price", 0.0).toLong())}", 15f, brand, Typeface.BOLD))
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, dp(10), 0, 0) }
        row.addView(secondaryButton(if (disabled) "Enable" else "Disable") {
            update(JSONObject().put("slug", slug).put("action", if (disabled) "enable" else "disable").put("isSeed", true))
        }, LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(5) })
        row.addView(secondaryButton("Write blog") { openBlogStudio(slug) }, LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
        c.addView(row)
        return margin(c)
    }

    private fun titleRow(title: String, status: String): View {
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        row.addView(text(title, 16f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        val (fill, fg) = when (status) {
            "approved", "built-in" -> softGreen to brand
            "rejected", "disabled" -> android.graphics.Color.rgb(253, 232, 232) to danger
            else -> android.graphics.Color.rgb(252, 246, 230) to amber
        }
        row.addView(chip(status.replace("_", " "), fill, fg))
        return row
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
        startActivity(Intent(this, AdminAiStudioActivity::class.java).putExtra("productSlug", slug))
    }

    private fun update(payload: JSONObject) {
        body.removeAllViews()
        body.addView(text("Updating product...", 14f, muted))
        executor.execute {
            val result = Net.patch("/api/admin/products", payload)
            runOnUiThread {
                if (result.ok) toast("Product updated")
                render(result)
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
        return margin(c)
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
