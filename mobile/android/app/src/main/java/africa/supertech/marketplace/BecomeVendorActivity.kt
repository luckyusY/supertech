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

/** Native "become a vendor" application — public → POST /api/vendor-applications. */
class BecomeVendorActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.AUTH

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submit: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = scaffold("Become a vendor", withBack = true)
        val session = Net.session()

        val subtitle = if (session != null && Net.isLoggedIn()) {
            "Apply with the account you're signed in as (${session.email}). " +
                "After approval, the same login becomes your vendor dashboard — no need for a second password."
        } else {
            "Tell us about your business. Our team reviews applications and sets up approved vendors."
        }
        content.block(gradientHeroCard("Sell on SuperTech", subtitle, "VENDOR PROGRAM"), 14)

        if (session?.role == "vendor") {
            content.block(
                infoCard(
                    R.drawable.ic_store,
                    "Already a Vendor",
                    "You're already registered as a vendor. Open your dashboard to list products and track payouts."
                ),
                14
            )
            content.block(primaryButton("Open vendor dashboard") {
                startActivity(android.content.Intent(this, DashboardActivity::class.java))
                finish()
            }, 8)
            return
        }
        if (session?.role == "admin") {
            content.block(
                infoCard(
                    R.drawable.ic_shield,
                    "Admin Access",
                    "Admins already have full access. Use the admin dashboard to moderate sellers and products."
                ),
                14
            )
            content.block(primaryButton("Open admin dashboard") {
                startActivity(android.content.Intent(this, DashboardActivity::class.java))
                finish()
            }, 8)
            return
        }

        val form = card()
        form.block(fieldLabel("Your name"), 0)
        val name = inputField("Full name", Types.TEXT); form.block(name, 10)
        form.block(fieldLabel("Email"), 0)
        val email = inputField("you@example.com", Types.EMAIL); form.block(email, 10)
        // Prefill from the signed-in SuperTech session (Google or email)
        session?.let {
            if (it.name.isNotBlank()) name.setText(it.name)
            if (it.email.isNotBlank()) email.setText(it.email)
        }
        form.block(fieldLabel("WhatsApp number"), 0)
        val phone = inputField("+250…", Types.PHONE); form.block(phone, 10)
        form.block(fieldLabel("Business name"), 0)
        val business = inputField("Your shop or brand", Types.TEXT); form.block(business, 10)
        form.block(fieldLabel("Main category"), 0)
        val category = categoryPicker(); form.block(category, 10)
        form.block(fieldLabel("Location"), 0)
        val location = inputField("e.g. Kigali", Types.TEXT); form.block(location, 10)
        form.block(fieldLabel("Website (optional)"), 0)
        val website = inputField("https://…", InputType.TYPE_TEXT_VARIATION_URI or InputType.TYPE_CLASS_TEXT); form.block(website, 10)
        form.block(fieldLabel("About your business"), 0)
        val description = inputField("What you sell and why customers trust you", Types.TEXT).apply {
            // multi-line: top-aligned so typing starts at the top, not the middle
            gravity = android.view.Gravity.TOP or android.view.Gravity.START
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE or
                InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            setSingleLine(false)
            minLines = 3
            minimumHeight = dp(86)
        }
        form.block(description, 0)
        content.block(form, 14)

        val message = text("", 13f, danger).apply { visibility = View.GONE }
        content.block(message, 6)

        submit = primaryButton("Submit application") {
            apply(
                name.text.toString().trim(), email.text.toString().trim(), phone.text.toString().trim(),
                business.text.toString().trim(), selectedCategory(category), location.text.toString().trim(),
                website.text.toString().trim(), description.text.toString().trim(), message
            )
        }
        submit.minimumHeight = dp(52)
        content.block(submit, 10)
    }

    private fun apply(
        name: String, email: String, phone: String, business: String, category: String,
        location: String, website: String, description: String, message: TextView
    ) {
        if (phone.isBlank()) { show(message, danger, "WhatsApp number is required."); return }
        if (name.isBlank() || email.isBlank() || business.isBlank() || category.isBlank() || location.isBlank() || description.isBlank()) {
            show(message, danger, "Please fill in all required fields."); return
        }
        val body = JSONObject()
            .put("name", name).put("email", email).put("phone", phone)
            .put("businessName", business).put("category", category)
            .put("location", location).put("description", description)
        if (website.isNotBlank()) body.put("website", website)

        setLoading(true)
        executor.execute {
            val result = Net.post("/api/vendor-applications", body)
            runOnUiThread {
                setLoading(false)
                when {
                    result.ok -> {
                        show(message, brand, "Application submitted. Our team will reach out on WhatsApp.")
                        submit.text = "Done"
                        submit.setOnClickListener { finish() }
                    }
                    result.code == 0 -> show(message, danger, "No connection. Try again.")
                    else -> show(message, danger, result.errorMessage("Could not submit application."))
                }
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        submit.isEnabled = !loading
        submit.text = if (loading) "Submitting…" else "Submit application"
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
