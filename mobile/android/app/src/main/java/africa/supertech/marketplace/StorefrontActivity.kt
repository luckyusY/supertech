package africa.supertech.marketplace

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.Button
import android.widget.TextView
import org.json.JSONObject
import java.util.concurrent.Executors

/** Native vendor storefront + payment settings → PUT /api/vendor-profile. */
class StorefrontActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submit: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val session = Net.session()
        if (session == null || session.role != "vendor" && session.role != "admin") {
            startActivity(Intent(this, SignInActivity::class.java)); finish(); return
        }

        val content = scaffold("Storefront & payments", withBack = true)
        content.block(text("Your storefront", 24f, ink, Typeface.BOLD), 4)
        content.block(text("Update how your shop looks and where payouts are collected.", 14f, muted), 16)

        val store = card()
        store.addView(text("Branding", 15f, ink, Typeface.BOLD))
        store.block(fieldLabel("Headline"), 0)
        val headline = inputField("e.g. Trusted laptops in Kigali", Types.TEXT); store.block(headline, 10)
        store.block(fieldLabel("Cover image URL"), 0)
        val cover = inputField("https://…/cover.jpg", InputType.TYPE_TEXT_VARIATION_URI or InputType.TYPE_CLASS_TEXT); store.block(cover, 10)
        store.block(fieldLabel("Logo image URL"), 0)
        val logo = inputField("https://…/logo.png", InputType.TYPE_TEXT_VARIATION_URI or InputType.TYPE_CLASS_TEXT); store.block(logo, 0)
        content.block(store, 14)

        val pay = card()
        pay.addView(text("MoMo payments", 15f, ink, Typeface.BOLD))
        pay.addView(text("Used to collect payments from customers.", 13f, muted).apply { setPadding(0, dp(4), 0, dp(8)) })
        pay.block(fieldLabel("MoMo merchant code"), 0)
        val momoCode = inputField("e.g. 123456", InputType.TYPE_CLASS_NUMBER); pay.block(momoCode, 10)
        pay.block(fieldLabel("MoMo business name"), 0)
        val momoName = inputField("Registered business name", Types.TEXT); pay.block(momoName, 0)
        content.block(pay, 14)

        val message = text("", 13f, danger).apply { visibility = View.GONE }
        content.block(message, 6)

        submit = primaryButton("Save storefront") {
            save(
                headline.text.toString().trim(), cover.text.toString().trim(), logo.text.toString().trim(),
                momoCode.text.toString().trim(), momoName.text.toString().trim(), message
            )
        }
        submit.minimumHeight = dp(52)
        content.block(submit, 10)
    }

    private fun save(headline: String, cover: String, logo: String, momoCode: String, momoName: String, message: TextView) {
        val body = JSONObject()
        if (headline.isNotBlank()) body.put("headline", headline)
        if (cover.isNotBlank()) body.put("coverImage", cover)
        if (logo.isNotBlank()) body.put("logoMark", logo)
        if (momoCode.isNotBlank()) body.put("momoMerchantCode", momoCode)
        if (momoName.isNotBlank()) body.put("momoBusinessName", momoName)
        if (body.length() == 0) {
            show(message, danger, "Fill in at least one field to save.")
            return
        }
        setLoading(true)
        executor.execute {
            val result = Net.put("/api/vendor-profile", body)
            runOnUiThread {
                setLoading(false)
                when {
                    result.ok -> {
                        show(message, brand, "Storefront updated.")
                        submit.text = "Saved"
                    }
                    result.code == 0 -> show(message, danger, "No connection. Try again.")
                    else -> show(message, danger, result.errorMessage("Could not update storefront."))
                }
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        submit.isEnabled = !loading
        submit.text = if (loading) "Saving…" else "Save storefront"
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
