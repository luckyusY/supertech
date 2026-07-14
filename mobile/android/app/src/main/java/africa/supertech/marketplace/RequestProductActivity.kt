package africa.supertech.marketplace

import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.concurrent.Executors

/** Native "request a product" — public → POST /api/product-requests. */
class RequestProductActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submit: Button
    override fun dockHighlight(): DockTab = DockTab.REQUEST

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = scaffold("Request a product", withBack = true)

        val hero = gradientHeroCard("Can't find it?", "Tell us what you need — vendors will source it", "Get a quote fast")
        content.block(hero, 0)
        content.block(text("Tell us what you need and our vendors will source it and send you a quote.", 14f, muted), 12)

        val form = card()
        form.block(fieldLabel("What product do you need?"), 0)
        val product = inputField("e.g. MacBook Air M2", Types.TEXT); form.block(product, 10)
        // Prefill from PDP / deep links
        intent.getStringExtra("productName")?.takeIf { it.isNotBlank() }?.let { product.setText(it) }
        form.block(fieldLabel("Category"), 0)
        val category = categoryPicker(intent.getStringExtra("category")); form.block(category, 10)
        form.block(fieldLabel("Your name"), 0)
        val name = inputField("Full name", Types.TEXT); form.block(name, 10)
        form.block(fieldLabel("Email"), 0)
        val email = inputField("you@example.com", Types.EMAIL); form.block(email, 10)
        form.block(fieldLabel("Phone / WhatsApp"), 0)
        val phone = inputField("+250…", Types.PHONE); form.block(phone, 10)
        form.block(fieldLabel("City"), 0)
        val city = inputField("Kigali", Types.TEXT); form.block(city, 10)
        form.block(fieldLabel("Budget (optional)"), 0)
        val budget = inputField("e.g. 600000", InputType.TYPE_CLASS_NUMBER); form.block(budget, 10)
        form.block(fieldLabel("Reference link (optional)"), 0)
        val link = inputField("https://…", InputType.TYPE_TEXT_VARIATION_URI or InputType.TYPE_CLASS_TEXT); form.block(link, 10)
        form.block(fieldLabel("Notes (optional)"), 0)
        val notes = multiLineInputField("Colour, specs, anything else", lines = 3)
        form.block(notes, 0)
        content.block(form, 14)

        val message = text("", 13f, danger).apply { visibility = View.GONE }
        content.block(message, 6)

        submit = primaryButton("Send request") {
            send(
                product.text.toString().trim(), selectedCategory(category),
                name.text.toString().trim(), email.text.toString().trim(), phone.text.toString().trim(),
                city.text.toString().trim(), budget.text.toString().trim(),
                link.text.toString().trim(), notes.text.toString().trim(), message
            )
        }
        submit.minimumHeight = dp(52)
        content.block(submit, 10)
    }

    private fun send(
        product: String, category: String, name: String, email: String, phone: String,
        city: String, budget: String, link: String, notes: String, message: TextView
    ) {
        if (product.isBlank() || email.isBlank()) {
            show(message, danger, "Product name and email are required.")
            return
        }
        val body = JSONObject()
            .put("productName", product)
            .put("customerEmail", email)
            .put("customerName", name)
            .put("category", category.ifBlank { "Other" })
            .put("city", city)
        if (phone.isNotBlank()) body.put("customerPhone", phone)
        if (link.isNotBlank()) body.put("productUrl", link)
        if (notes.isNotBlank()) body.put("notes", notes)
        budget.replace(",", "").toIntOrNull()?.let { body.put("targetBudget", it) }

        setLoading(true)
        executor.execute {
            val result = Net.post("/api/product-requests", body)
            runOnUiThread {
                setLoading(false)
                when {
                    result.ok -> {
                        show(message, brand, "Request sent. A vendor will reach out with a quote.")
                        submit.text = "Done"
                        submit.setOnClickListener { finish() }
                    }
                    result.code == 0 -> show(message, danger, "No connection. Try again.")
                    else -> show(message, danger, result.errorMessage("Could not send your request."))
                }
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        submit.isEnabled = !loading
        submit.text = if (loading) "Sending…" else "Send request"
        submit.alpha = if (loading) 0.6f else 1f
    }

    private fun show(view: TextView, color: Int, msg: String) {
        view.text = msg; view.setTextColor(color); view.visibility = View.VISIBLE
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
