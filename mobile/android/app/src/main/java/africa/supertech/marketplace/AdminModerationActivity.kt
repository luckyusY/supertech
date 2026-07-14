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
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

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
        val hero = gradientHeroCard("Approval queue", "Review and approve pending vendor applications and product submissions", "Admin only")
        content.block(hero, 0)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(skeletonList(4))
        animateContentIn(body)
        executor.execute {
            val applications = Net.get("/api/vendor-applications?status=pending")
            val submissions = Net.get("/api/product-submissions?status=pending_review&limit=50")
            runOnUiThread { render(applications, submissions) }
        }
    }

    private fun render(applications: Net.Result, submissions: Net.Result) {
        body.removeAllViews()

        val apps = applications.json().optJSONArray("applications")
        val appsCount = apps?.length() ?: 0
        body.addView(sectionTitle("Vendor applications${if (appsCount > 0) " ($appsCount pending)" else ""}"))
        if (appsCount == 0) {
            body.addView(emptyCard("No pending applications"))
        } else {
            for (i in 0 until apps!!.length()) {
                val a = apps.optJSONObject(i) ?: continue
                body.addView(applicationCard(a).also { animateIn(it, i) })
            }
        }

        val subs = submissions.json().optJSONArray("submissions")
        val subsCount = subs?.length() ?: 0
        body.addView(sectionTitle("Product submissions${if (subsCount > 0) " ($subsCount pending)" else ""}"))
        if (subsCount == 0) {
            body.addView(emptyCard("No products awaiting review"))
        } else {
            for (i in 0 until subs!!.length()) {
                val p = subs.optJSONObject(i) ?: continue
                body.addView(submissionCard(p, i + 1).also { animateIn(it, i) })
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

    private fun submissionCard(p: JSONObject, index: Int = 1): View {
        val id = idOf(p)
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        col.addView(numberedThumbRow(
            index = index,
            imageUrl = p.optString("heroImage"),
            title = p.optString("name", "Product"),
            meta = "${p.optString("category", "Tech")} · Vendor: ${p.optString("vendorSlug", "—")}",
            statusLabel = "In review",
            statusFill = android.graphics.Color.rgb(252, 246, 230),
            statusFg = amber,
            money = "RWF ${p.optDouble("price", 0.0).toLong()}"
        ))
        val cardView = card()
        cardView.setPadding(dp(12), dp(8), dp(12), dp(12))
        cardView.addView(actionRow(
            onApprove = { patchSubmission(id, "approved", col) },
            onReject = { patchSubmission(id, "rejected", col) }
        ))
        col.addView(cardView, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })
        return col
    }

    private fun actionRow(onApprove: () -> Unit, onReject: () -> Unit): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, dp(10), 0, 0)
        }
        val approve = successButton("✓ Approve", onApprove)
        val reject = dangerButton("Reject", onReject)
        row.addView(approve, LinearLayout.LayoutParams(0, dp(52), 1f).apply { rightMargin = dp(8) })
        row.addView(reject, LinearLayout.LayoutParams(0, dp(52), 1f).apply { leftMargin = dp(8) })
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
