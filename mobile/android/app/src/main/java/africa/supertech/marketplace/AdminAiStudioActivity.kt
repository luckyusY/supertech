package africa.supertech.marketplace

import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import org.json.JSONObject
import java.util.concurrent.Executors

class AdminAiStudioActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var output: TextView
    private lateinit var generate: Button
    private var productSlug: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Net.session()?.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        productSlug = intent.getStringExtra("productSlug").orEmpty()
        val content = scaffold("AI Studio", withBack = true)
        val hero = gradientHeroCard("AI Content Studio", "Generate articles, product copy, social posts and more", "Powered by AI")
        content.block(hero, 0)
        content.block(text("Create articles, product copy, captions, emails, or SEO product blogs inside the app.", 14f, muted), 12)

        val form = card()
        form.block(fieldLabel("Mode"), 0)
        val mode = Spinner(this).apply {
            adapter = ArrayAdapter(
                this@AdminAiStudioActivity,
                android.R.layout.simple_spinner_dropdown_item,
                listOf("Article", "Product copy", "Social captions", "Email", "Product SEO blog")
            )
            if (productSlug.isNotBlank()) setSelection(4)
        }
        form.block(mode, 8)
        form.block(fieldLabel("Topic or product slug"), 0)
        val topic = inputField("Example: ${productSlug.ifBlank { "smart devices in Rwanda" }}", Types.TEXT)
        if (productSlug.isNotBlank()) topic.setText(productSlug)
        form.block(topic, 8)
        form.block(fieldLabel("Audience"), 0)
        val audience = inputField("online shoppers across Africa", Types.TEXT)
        audience.setText("online shoppers across Africa")
        form.block(audience, 8)
        form.block(fieldLabel("Tone"), 0)
        val tone = inputField("clear, trustworthy, and conversion-focused", Types.TEXT)
        tone.setText("clear, trustworthy, and conversion-focused")
        form.block(tone, 8)
        form.block(fieldLabel("Extra details"), 0)
        val details = multiLineInputField("Optional details", lines = 3)
        form.block(details, 0)
        content.block(form, 12)

        generate = primaryButton("Generate draft") {
            submit(mode.selectedItem.toString(), topic.text.toString(), audience.text.toString(), tone.text.toString(), details.text.toString())
        }
        generate.minimumHeight = dp(50)
        content.block(generate, 12)

        output = text("Generated content will appear here.", 14f, muted)
        val outCard = card()
        outCard.addView(output)
        content.block(outCard, 0)

        val copyBtn = secondaryButton("📋  Copy to clipboard") {
            val txt = output.text.toString()
            if (txt.isBlank() || txt == "Generated content will appear here.") {
                toast("Generate content first")
            } else {
                val cm = getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                cm.setPrimaryClip(android.content.ClipData.newPlainText("ai-content", txt))
                toast("Copied to clipboard")
            }
        }
        content.block(copyBtn, 6)
    }

    private fun submit(mode: String, topic: String, audience: String, tone: String, details: String) {
        if (topic.trim().length < 3) {
            output.setTextColor(danger)
            output.text = "Add a topic or product slug."
            return
        }
        generate.isEnabled = false
        generate.alpha = 0.6f
        output.setTextColor(muted)
        output.text = "Generating..."
        executor.execute {
            val result = if (mode == "Product SEO blog") {
                Net.post(
                    "/api/ai/product-blog",
                    JSONObject()
                        .put("productSlug", topic.trim())
                        .put("angle", details.ifBlank { "why this product is useful" })
                        .put("tone", tone.trim())
                        .put("audience", audience.trim())
                        .put("count", 1)
                )
            } else {
                val type = when (mode) {
                    "Product copy" -> "product"
                    "Social captions" -> "social"
                    "Email" -> "email"
                    else -> "article"
                }
                Net.post(
                    "/api/ai/content",
                    JSONObject()
                        .put("topic", topic.trim())
                        .put("audience", audience.trim())
                        .put("tone", tone.trim())
                        .put("contentType", type)
                )
            }
            runOnUiThread {
                generate.isEnabled = true
                generate.alpha = 1f
                if (result.ok) {
                    output.setTextColor(ink)
                    output.text = if (mode == "Product SEO blog") {
                        val blog = result.json()
                        listOf(
                            blog.optString("title"),
                            blog.optString("excerpt"),
                            blog.optString("body")
                        ).filter { it.isNotBlank() }.joinToString("\n\n")
                    } else {
                        result.json().optString("result").ifBlank { result.body }
                    }
                } else {
                    output.setTextColor(danger)
                    output.text = result.errorMessage("Unable to generate content.")
                }
            }
        }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
