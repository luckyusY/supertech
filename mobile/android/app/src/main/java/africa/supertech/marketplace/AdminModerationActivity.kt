package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.Executors

/** Native admin moderation — approve/reject vendor applications and products. */
class AdminModerationActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val session = Net.session()
        if (session == null || session.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        val content = scaffold("Approvals", withBack = true)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading pending items…", 14f, muted))
        executor.execute {
            val applications = Net.get("/api/vendor-applications?status=pending")
            val submissions = Net.get("/api/product-submissions?status=pending_review&limit=50")
            runOnUiThread { render(applications, submissions) }
        }
    }

    private fun render(applications: Net.Result, submissions: Net.Result) {
        body.removeAllViews()

        body.addView(sectionTitle("Vendor applications"))
        val apps = applications.json().optJSONArray("applications")
        if (apps == null || apps.length() == 0) {
            body.addView(emptyCard("No pending applications"))
        } else {
            for (i in 0 until apps.length()) {
                val a = apps.optJSONObject(i) ?: continue
                body.addView(applicationCard(a).also { animateIn(it, i) })
            }
        }

        body.addView(sectionTitle("Product submissions"))
        val subs = submissions.json().optJSONArray("submissions")
        if (subs == null || subs.length() == 0) {
            body.addView(emptyCard("No products awaiting review"))
        } else {
            for (i in 0 until subs.length()) {
                val p = subs.optJSONObject(i) ?: continue
                body.addView(submissionCard(p).also { animateIn(it, i) })
            }
        }
    }

    private fun applicationCard(a: JSONObject): View {
        val id = idOf(a)
        val cardView = card()
        cardView.addView(text(a.optString("businessName").ifBlank { a.optString("name", "Vendor") }, 16f, ink, Typeface.BOLD))
        cardView.addView(text("${a.optString("category", "—")} · ${a.optString("location", "Rwanda")}", 13f, muted))
        cardView.addView(text(a.optString("email"), 12f, muted))
        cardView.addView(actionRow(
            onApprove = { patchApplication(id, "approved", cardView) },
            onReject = { patchApplication(id, "rejected", cardView) }
        ))
        return margin(cardView)
    }

    private fun submissionCard(p: JSONObject): View {
        val id = idOf(p)
        val cardView = card()
        cardView.addView(text(p.optString("name", "Product"), 16f, ink, Typeface.BOLD))
        cardView.addView(text("${p.optString("category", "Tech")} · RWF ${p.optDouble("price", 0.0).toLong()}", 13f, muted))
        cardView.addView(text("Vendor: ${p.optString("vendorSlug", "—")}", 12f, muted))
        cardView.addView(actionRow(
            onApprove = { patchSubmission(id, "approved", cardView) },
            onReject = { patchSubmission(id, "rejected", cardView) }
        ))
        return margin(cardView)
    }

    private fun actionRow(onApprove: () -> Unit, onReject: () -> Unit): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(10), 0, 0)
        }
        val approve = primaryButton("Approve", onApprove)
        val reject = secondaryButton("Reject", onReject).apply { setTextColor(danger) }
        row.addView(approve, LinearLayout.LayoutParams(0, wc(), 1f).apply { rightMargin = dp(5) })
        row.addView(reject, LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
        return row
    }

    private fun patchApplication(id: String, status: String, cardView: View) {
        if (id.isBlank()) { toast("Missing application id"); return }
        fade(cardView)
        executor.execute {
            val result = Net.patch("/api/vendor-applications/$id", JSONObject().put("status", status))
            runOnUiThread {
                if (result.ok) {
                    val temp = result.json().optString("tempPassword")
                    toast(if (status == "approved") {
                        if (temp.isNotBlank()) "Approved · temp password: $temp" else "Vendor approved"
                    } else "Application rejected")
                    removeCard(cardView)
                } else {
                    cardView.alpha = 1f
                    toast(result.errorMessage("Action failed"))
                }
            }
        }
    }

    private fun patchSubmission(id: String, status: String, cardView: View) {
        if (id.isBlank()) { toast("Missing product id"); return }
        fade(cardView)
        executor.execute {
            val result = Net.patch("/api/product-submissions/$id", JSONObject().put("status", status))
            runOnUiThread {
                if (result.ok) {
                    toast(if (status == "approved") "Product approved" else "Product rejected")
                    removeCard(cardView)
                } else {
                    cardView.alpha = 1f
                    toast(result.errorMessage("Action failed"))
                }
            }
        }
    }

    private fun idOf(o: JSONObject): String =
        o.optString("id").ifBlank { o.optString("_id").ifBlank { o.optString("requestId") } }

    private fun fade(view: View) { view.alpha = 0.5f }

    private fun removeCard(view: View) {
        view.animate().alpha(0f).translationX(dp(40).toFloat()).setDuration(200).withEndAction {
            (view.parent as? LinearLayout)?.removeView(view)
        }.start()
    }

    private fun emptyCard(title: String): View {
        val c = card()
        c.addView(text(title, 14f, muted))
        return margin(c)
    }

    private fun margin(view: View, bottom: Int = 12): View {
        view.layoutParams = LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(bottom) }
        return view
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
