package africa.supertech.marketplace

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.concurrent.Executors

/** Native vendor storefront + payment settings → PUT /api/vendor-profile. */
class StorefrontActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD

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
        val brandingHeader = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, dp(12))
        }
        brandingHeader.addView(iconBubble(R.drawable.ic_edit, brand, softGreen, 36))
        brandingHeader.addView(text("Branding", 16f, ink, Typeface.BOLD).apply {
            setPadding(dp(10), 0, 0, 0)
        })
        store.addView(brandingHeader)

        store.block(fieldLabel("Headline"), 0)
        val headline = inputField("e.g. Trusted laptops in Kigali", Types.TEXT); store.block(headline, 10)
        store.block(fieldLabel("Cover image URL"), 0)
        val cover = inputField("https://…/cover.jpg", android.text.InputType.TYPE_TEXT_VARIATION_URI or android.text.InputType.TYPE_CLASS_TEXT); store.block(cover, 10)
        
        val coverPreview = ImageView(this).apply {
            visibility = View.GONE
            scaleType = ImageView.ScaleType.CENTER_CROP
        }
        store.addView(coverPreview, LinearLayout.LayoutParams(mp(), dp(120)).apply { topMargin = dp(4); bottomMargin = dp(12) })
        roundViewLocal(coverPreview, dp(12).toFloat())

        cover.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val url = cover.text.toString().trim()
                if (url.isNotBlank() && url.startsWith("http")) {
                    coverPreview.visibility = View.VISIBLE
                    loadImage(coverPreview, url)
                } else {
                    coverPreview.visibility = View.GONE
                }
            }
        }

        store.block(fieldLabel("Logo image URL"), 0)
        val logo = inputField("https://…/logo.png", android.text.InputType.TYPE_TEXT_VARIATION_URI or android.text.InputType.TYPE_CLASS_TEXT); store.block(logo, 10)

        val logoPreview = ImageView(this).apply {
            visibility = View.GONE
            scaleType = ImageView.ScaleType.CENTER_CROP
        }
        store.addView(logoPreview, LinearLayout.LayoutParams(dp(64), dp(64)).apply { topMargin = dp(4); bottomMargin = dp(12) })
        roundViewLocal(logoPreview, dp(32).toFloat())

        logo.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val url = logo.text.toString().trim()
                if (url.isNotBlank() && url.startsWith("http")) {
                    logoPreview.visibility = View.VISIBLE
                    loadImage(logoPreview, url)
                } else {
                    logoPreview.visibility = View.GONE
                }
            }
        }

        content.block(store, 14)

        val pay = card()
        val payHeader = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            setPadding(0, 0, 0, dp(8))
        }
        payHeader.addView(iconBubble(R.drawable.ic_wallet, brand, softGreen, 36))
        payHeader.addView(text("MoMo payments", 16f, ink, Typeface.BOLD).apply {
            setPadding(dp(10), 0, 0, 0)
        })
        pay.addView(payHeader)

        val mtnColor = android.graphics.Color.rgb(250, 204, 21) // MTN Yellow
        val mtnSoft = android.graphics.Color.rgb(254, 252, 232) // Soft MTN Yellow
        val mtnText = android.graphics.Color.rgb(161, 98, 7) // MTN Amber Ink
        val momoInfo = infoCard(R.drawable.ic_wallet, "MTN MoMo Integration", "Payments from customers will go directly to your merchant code or registered business MoMo account.", mtnText).apply {
            background = rounded(mtnColor, mtnSoft, dp(14).toFloat())
        }
        pay.block(momoInfo, 10)

        pay.block(fieldLabel("MoMo merchant code"), 0)
        val momoCode = inputField("e.g. 123456", android.text.InputType.TYPE_CLASS_NUMBER); pay.block(momoCode, 10)
        pay.block(fieldLabel("MoMo business name"), 0)
        val momoName = inputField("Registered business name", Types.TEXT); pay.block(momoName, 0)
        content.block(pay, 14)

        // Pre-fill fields from local marketplace cache if existing vendor
        val slugVal = session.vendorSlug.orEmpty()
        if (slugVal.isNotBlank()) {
            MarketplaceCache.init(this)
            MarketplaceCache.get()?.let { cached ->
                val vendors = cached.optJSONArray("vendors")
                val vendor = (0 until (vendors?.length() ?: 0))
                    .mapNotNull { vendors?.optJSONObject(it) }
                    .firstOrNull { it.optString("slug") == slugVal }
                vendor?.let {
                    headline.setText(it.optString("headline"))
                    cover.setText(it.optString("coverImage"))
                    logo.setText(it.optString("logoMark"))
                    momoCode.setText(it.optString("momoMerchantCode"))
                    momoName.setText(it.optString("momoBusinessName"))

                    // Trigger initial previews if data is already there
                    val coverUrl = it.optString("coverImage")
                    if (coverUrl.isNotBlank() && coverUrl.startsWith("http")) {
                        coverPreview.visibility = View.VISIBLE
                        loadImage(coverPreview, coverUrl)
                    }
                    val logoUrl = it.optString("logoMark")
                    if (logoUrl.isNotBlank() && logoUrl.startsWith("http")) {
                        logoPreview.visibility = View.VISIBLE
                        loadImage(logoPreview, logoUrl)
                    }
                }
            }
        }

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

    private fun roundViewLocal(view: View, radius: Float) {
        view.clipToOutline = true
        view.outlineProvider = object : android.view.ViewOutlineProvider() {
            override fun getOutline(v: View, outline: android.graphics.Outline) {
                outline.setRoundRect(0, 0, v.width, v.height, radius)
            }
        }
    }
}
