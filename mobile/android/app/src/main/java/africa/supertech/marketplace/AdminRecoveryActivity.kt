package africa.supertech.marketplace

import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import org.json.JSONObject
import java.util.concurrent.Executors

class AdminRecoveryActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Net.session()?.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        val content = scaffold("Account Recovery", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading recovery requests...", 14f, muted))
        executor.execute {
            val result = Net.get("/api/admin/recovery?limit=50")
            runOnUiThread { render(result) }
        }
    }

    private fun render(result: Net.Result) {
        body.removeAllViews()
        if (!result.ok) {
            body.addView(errorCard(result.errorMessage("Could not load recovery requests.")))
            return
        }
        val requests = result.json().optJSONArray("requests")
        body.block(text("${requests?.length() ?: 0} recent requests", 14f, muted, Typeface.BOLD), 8)
        if (requests == null || requests.length() == 0) {
            body.addView(emptyCard("No password recovery requests yet."))
            return
        }
        for (i in 0 until requests.length()) {
            val item = requests.optJSONObject(i) ?: continue
            body.addView(requestCard(item).also { animateIn(it, i) })
        }
    }

    private fun requestCard(item: JSONObject): View {
        val c = card()
        c.addView(text(item.optString("requestId", "Recovery request"), 16f, ink, Typeface.BOLD))
        c.addView(text(item.optString("email", "No email"), 14f, ink))
        val name = item.optString("name")
        if (name.isNotBlank()) c.addView(text(name, 13f, muted))
        c.addView(text("Phone: ${item.optString("phone").ifBlank { "Not provided" }}", 13f, muted))
        c.addView(text("Notes: ${item.optString("notes").ifBlank { "No notes" }}", 13f, muted))
        c.addView(text(item.optString("status", "open").uppercase(), 12f, brand, Typeface.BOLD))
        return margin(c)
    }

    private fun errorCard(message: String): View {
        val c = card()
        c.addView(text("Could not load recovery", 16f, ink, Typeface.BOLD))
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
