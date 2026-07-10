package africa.supertech.marketplace

import android.app.AlertDialog
import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import org.json.JSONObject
import java.util.concurrent.Executors

class AdminCategoriesActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Net.session()?.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        val content = scaffold("Categories", withBack = true)
        content.block(primaryButton("Add category") { categoryDialog(null) }, 12)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading categories...", 14f, muted))
        executor.execute {
            val result = Net.get("/api/admin/categories")
            runOnUiThread { render(result) }
        }
    }

    private fun render(result: Net.Result) {
        body.removeAllViews()
        if (!result.ok) {
            body.addView(errorCard(result.errorMessage("Could not load categories.")))
            return
        }
        val categories = result.json().optJSONArray("categories")
        if (categories == null || categories.length() == 0) {
            body.addView(emptyCard("No categories found."))
            return
        }
        for (i in 0 until categories.length()) {
            val category = categories.optJSONObject(i) ?: continue
            body.addView(categoryCard(category).also { animateIn(it, i) })
        }
    }

    private fun categoryCard(category: JSONObject): View {
        val name = category.optString("name")
        val hidden = category.optBoolean("hidden")
        val cardView = card()
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(text(name, 16f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        top.addView(chip(if (hidden) "Hidden" else "Visible", if (hidden) android.graphics.Color.rgb(252, 246, 230) else softGreen, if (hidden) amber else brand))
        cardView.addView(top)
        cardView.addView(text("${category.optInt("productCount")} products · ${category.optInt("vendorCount")} vendors", 13f, muted))

        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, dp(10), 0, 0) }
        row.addView(secondaryButton("Rename") { categoryDialog(name) }, LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(5) })
        row.addView(secondaryButton(if (hidden) "Show" else "Hide") {
            update(JSONObject().put("name", name).put("action", if (hidden) "show" else "hide"))
        }, LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
        cardView.addView(row)
        return margin(cardView)
    }

    private fun categoryDialog(oldName: String?) {
        val input = EditText(this).apply {
            setSingleLine(true)
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_WORDS
            setText(oldName.orEmpty())
            setSelection(text.length)
        }
        AlertDialog.Builder(this)
            .setTitle(if (oldName == null) "Add category" else "Rename category")
            .setView(input)
            .setNegativeButton("Cancel", null)
            .setPositiveButton(if (oldName == null) "Add" else "Rename") { _, _ ->
                val value = input.text.toString().trim()
                if (oldName == null) {
                    create(value)
                } else {
                    update(JSONObject().put("name", oldName).put("newName", value).put("action", "rename"))
                }
            }
            .show()
    }

    private fun create(name: String) {
        updateBody("Saving category...")
        executor.execute {
            val result = Net.post("/api/admin/categories", JSONObject().put("name", name))
            runOnUiThread { if (result.ok) toast("Category saved"); render(result) }
        }
    }

    private fun update(payload: JSONObject) {
        updateBody("Updating category...")
        executor.execute {
            val result = Net.patch("/api/admin/categories", payload)
            runOnUiThread { if (result.ok) toast("Category updated"); render(result) }
        }
    }

    private fun updateBody(message: String) {
        body.removeAllViews()
        body.addView(text(message, 14f, muted))
    }

    private fun errorCard(message: String): View {
        val c = card()
        c.addView(text("Could not load categories", 16f, ink, Typeface.BOLD))
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
