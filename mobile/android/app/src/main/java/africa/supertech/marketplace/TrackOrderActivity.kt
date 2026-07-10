package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import org.json.JSONObject
import java.util.concurrent.Executors

/** Native order tracking — public, no sign-in required. */
class TrackOrderActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var button: Button
    private lateinit var result: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = scaffold("Track order", withBack = true)

        content.block(text("Track your order", 24f, ink, Typeface.BOLD), 4)
        content.block(text("Enter your request ID and the email you used to order.", 14f, muted), 16)

        val form = card()
        form.block(fieldLabel("Request ID"), 0)
        val requestId = inputField("e.g. ST-2048", Types.TEXT); form.block(requestId, 10)
        form.block(fieldLabel("Email"), 0)
        val email = inputField("you@example.com", Types.EMAIL); form.block(email, 0)
        content.block(form, 12)

        button = primaryButton("Check status") {
            track(requestId.text.toString().trim(), email.text.toString().trim())
        }
        button.minimumHeight = dp(50)
        content.block(button, 12)

        result = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(result, 0)
    }

    private fun track(requestId: String, email: String) {
        result.removeAllViews()
        if (requestId.isBlank() || email.isBlank()) {
            result.addView(infoCard("Enter both your request ID and email."))
            return
        }
        setLoading(true)
        val q = "requestId=${android.net.Uri.encode(requestId)}&email=${android.net.Uri.encode(email)}"
        executor.execute {
            val r = Net.get("/api/order-tracking?$q")
            runOnUiThread {
                setLoading(false)
                result.removeAllViews()
                when {
                    r.ok -> showOrder(r.json())
                    r.code == 0 -> result.addView(infoCard("No connection. Try again."))
                    else -> result.addView(infoCard(r.errorMessage("We could not find that order.")))
                }
            }
        }
    }

    private fun showOrder(o: JSONObject) {
        val cardView = card()
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(text(o.optString("requestId", "Order"), 18f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        val status = o.optString("status")
        top.addView(chip(status.replace("_", " ").replaceFirstChar { it.uppercase() }, softGreen, brand))
        cardView.addView(top)

        val message = o.optString("statusMessage")
        if (message.isNotBlank()) cardView.addView(text(message, 14f, ink).apply { setPadding(0, dp(8), 0, 0) })

        val product = o.optString("productName")
        if (product.isNotBlank()) cardView.addView(text("Product: $product", 13f, muted).apply { setPadding(0, dp(6), 0, 0) })
        val created = o.optString("createdAt")
        if (created.length >= 10) cardView.addView(text("Ordered ${created.substring(0, 10)}", 12f, muted))
        result.addView(cardView)
    }

    private fun infoCard(message: String): View {
        val c = card()
        c.addView(text(message, 14f, muted))
        return c
    }

    private fun setLoading(loading: Boolean) {
        button.isEnabled = !loading
        button.text = if (loading) "Checking…" else "Check status"
        button.alpha = if (loading) 0.6f else 1f
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
