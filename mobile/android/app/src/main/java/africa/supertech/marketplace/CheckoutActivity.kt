package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONArray
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

/** Native checkout — turns the cart into an order request via /api/order-requests. */
class CheckoutActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var submit: Button

    private var contactPref = "whatsapp"
    private var paymentPref = "mobile_money"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = scaffold("Checkout", withBack = true)

        if (Cart.isEmpty()) {
            content.block(text("Your cart is empty", 20f, ink, Typeface.BOLD), 6)
            content.block(text("Add products to your cart before checking out.", 14f, muted), 12)
            content.block(secondaryButton("Back to shop") { finish() }, 8)
            return
        }

        // Order summary
        val summary = card()
        summary.addView(text("Order summary", 15f, ink, Typeface.BOLD))
        Cart.lines.values.forEach { line ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, dp(6), 0, 0) }
            row.addView(text("${line.qty}× ${line.name}", 14f, ink), LinearLayout.LayoutParams(0, wc(), 1f))
            row.addView(text("RWF ${money.format(line.price * line.qty)}", 14f, muted))
            summary.addView(row)
        }
        val totalRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; setPadding(0, dp(10), 0, 0) }
        totalRow.addView(text("Total", 15f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        totalRow.addView(text("RWF ${money.format(Cart.total())}", 16f, brand, Typeface.BOLD))
        summary.addView(totalRow)
        content.block(summary, 14)

        // Contact details
        val form = card()
        form.block(fieldLabel("Full name"), 0)
        val name = inputField("Your name", Types.TEXT); form.block(name, 10)
        form.block(fieldLabel("Email"), 0)
        val email = inputField("you@example.com", Types.EMAIL); form.block(email, 10)
        form.block(fieldLabel("Phone / WhatsApp"), 0)
        val phone = inputField("+250…", Types.PHONE); form.block(phone, 10)
        form.block(fieldLabel("City"), 0)
        val city = inputField("Kigali", Types.TEXT); form.block(city, 10)
        form.block(fieldLabel("Delivery address"), 0)
        val address = inputField("Street, area, landmark", Types.TEXT); form.block(address, 10)
        form.block(fieldLabel("Notes (optional)"), 0)
        val notes = inputField("Anything we should know", Types.TEXT); form.block(notes, 0)
        content.block(form, 14)

        content.block(text("How should the vendor contact you?", 14f, ink, Typeface.BOLD), 8)
        content.block(choiceGroup(
            listOf("whatsapp" to "WhatsApp", "phone" to "Phone", "email" to "Email"),
            contactPref
        ) { contactPref = it }, 14)

        content.block(text("Payment preference", 14f, ink, Typeface.BOLD), 8)
        content.block(choiceGroup(
            listOf(
                "mobile_money" to "Mobile money",
                "cash_on_delivery" to "Cash on delivery",
                "bank_transfer" to "Bank transfer",
                "manual_arrangement" to "Arrange later"
            ),
            paymentPref
        ) { paymentPref = it }, 16)

        val error = text("", 13f, danger).apply { visibility = View.GONE }
        content.block(error, 6)

        submit = primaryButton("Place order request") {
            place(
                name.text.toString().trim(),
                email.text.toString().trim(),
                phone.text.toString().trim(),
                city.text.toString().trim(),
                address.text.toString().trim(),
                notes.text.toString().trim(),
                error
            )
        }
        submit.minimumHeight = dp(52)
        content.block(submit, 10)
    }

    private fun choiceGroup(options: List<Pair<String, String>>, selected: String, onSelect: (String) -> Unit): View {
        val wrap = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        var current = selected
        val chips = HashMap<String, TextView>()
        fun restyle() {
            chips.forEach { (key, view) ->
                val active = key == current
                view.setTextColor(if (active) Color.WHITE else brand)
                view.background = rounded(if (active) brand else line, if (active) brand else Color.WHITE, dp(12).toFloat())
            }
        }
        options.chunked(2).forEach { pair ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEachIndexed { i, opt ->
                val chipView = text(opt.second, 14f, brand, Typeface.BOLD).apply {
                    gravity = Gravity.CENTER
                    setPadding(dp(12), dp(12), dp(12), dp(12))
                    pressable()
                    setOnClickListener { current = opt.first; onSelect(opt.first); restyle() }
                }
                chips[opt.first] = chipView
                val lp = LinearLayout.LayoutParams(0, wc(), 1f).apply {
                    leftMargin = if (i == 0) 0 else dp(5); rightMargin = if (i == 0) dp(5) else 0; bottomMargin = dp(8)
                }
                row.addView(chipView, lp)
            }
            if (pair.size == 1) row.addView(View(this), LinearLayout.LayoutParams(0, wc(), 1f))
            wrap.addView(row, LinearLayout.LayoutParams(mp(), wc()))
        }
        restyle()
        return wrap
    }

    private fun place(
        name: String, email: String, phone: String, city: String,
        address: String, notes: String, error: View
    ) {
        (error as TextView)
        if (name.isBlank() || email.isBlank() || phone.isBlank() || city.isBlank() || address.isBlank()) {
            showError(error, "Please fill in name, email, phone, city and address.")
            return
        }
        setLoading(true)
        val items = JSONArray()
        Cart.lines.values.forEach { line ->
            items.put(JSONObject().put("productSlug", line.slug).put("quantity", line.qty))
        }
        val body = JSONObject()
            .put("items", items)
            .put("customerName", name)
            .put("customerEmail", email)
            .put("customerPhone", phone)
            .put("city", city)
            .put("deliveryAddress", address)
            .put("contactPreference", contactPref)
            .put("paymentPreference", paymentPref)
        if (notes.isNotBlank()) body.put("notes", notes)

        executor.execute {
            val result = Net.post("/api/order-requests", body)
            runOnUiThread {
                setLoading(false)
                when {
                    result.ok -> {
                        Cart.clear()
                        showSuccess()
                    }
                    result.code == 0 -> showError(error, "No connection. Check your internet and try again.")
                    else -> showError(error, result.errorMessage("Could not place your order request."))
                }
            }
        }
    }

    private fun showSuccess() {
        val content = scaffold("Order placed", withBack = false)
        val card = card()
        card.addView(text("✓ Request received", 20f, brand, Typeface.BOLD))
        card.addView(text("Your order request has been sent. The vendor will contact you to confirm and arrange delivery.", 14f, muted).apply { setPadding(0, dp(8), 0, 0) })
        content.block(card, 14)
        content.block(primaryButton("Back to marketplace") {
            startActivity(android.content.Intent(this, MainActivity::class.java).apply {
                flags = android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP
            })
            finish()
        }.apply { minimumHeight = dp(50) }, 8)
    }

    private fun setLoading(loading: Boolean) {
        submit.isEnabled = !loading
        submit.text = if (loading) "Placing request…" else "Place order request"
        submit.alpha = if (loading) 0.6f else 1f
    }

    private fun showError(view: TextView, message: String) {
        view.text = message
        view.visibility = View.VISIBLE
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
