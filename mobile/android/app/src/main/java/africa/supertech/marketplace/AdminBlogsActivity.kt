package africa.supertech.marketplace

import android.app.AlertDialog
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.view.ViewOutlineProvider
import android.widget.ImageView
import android.widget.LinearLayout
import org.json.JSONObject
import java.util.concurrent.Executors

/** Native Admin blog management activity. Lists all blogs with delete support. */
class AdminBlogsActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Net.session()?.role != "admin") {
            toast("Admins only")
            finish()
            return
        }
        val content = scaffold("Manage Blogs", withBack = true)
        content.block(text("All Published Blogs", 24f, ink, Typeface.BOLD), 4)
        content.block(text("Review, read, or delete blogs across the marketplace.", 14f, muted), 12)
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        load()
    }

    private fun load() {
        body.removeAllViews()
        body.addView(text("Loading articles…", 14f, muted))
        executor.execute {
            val result = Net.get("/api/blog")
            runOnUiThread {
                body.removeAllViews()
                if (!result.ok) {
                    body.addView(errorCard(if (result.code == 0) "No connection." else result.errorMessage("Could not load blogs.")))
                    return@runOnUiThread
                }
                val blogs = result.json().optJSONArray("blogs")
                if (blogs == null || blogs.length() == 0) {
                    body.addView(errorCard("No articles yet."))
                    return@runOnUiThread
                }
                for (i in 0 until blogs.length()) {
                    val b = blogs.optJSONObject(i) ?: continue
                    body.addView(blogCard(b).also { animateIn(it, i) })
                }
            }
        }
    }

    private fun blogCard(b: JSONObject): View {
        val id = b.optString("id").ifBlank { b.optString("_id") }
        val cardView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
            pressable()
            setOnClickListener { openPost(b) }
        }

        val hero = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setBackgroundColor(Color.rgb(232, 237, 242))
            clipToOutline = true
            outlineProvider = topRoundedOutline(dp(16).toFloat())
        }
        cardView.addView(hero, LinearLayout.LayoutParams(mp(), dp(140)))
        loadImage(hero, b.optString("heroImage"))

        val pad = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(12), dp(14), dp(14))
        }
        pad.addView(text(b.optString("title", "Article"), 16f, ink, Typeface.BOLD).apply { maxLines = 2 })
        val excerpt = b.optString("excerpt").ifBlank { b.optString("metaDescription") }
        if (excerpt.isNotBlank()) pad.addView(text(excerpt, 13f, muted).apply { maxLines = 2; setPadding(0, dp(4), 0, 0) })
        pad.addView(text("By ${b.optString("vendorName", "SuperTech")} · ${b.optString("category", "")}".trim(' ', '·'), 12f, brand, Typeface.BOLD).apply { setPadding(0, dp(6), 0, 0) })

        val btnDelete = secondaryButton("Delete") {
            confirmDelete(id, b.optString("title"))
        }.apply {
            setTextColor(danger)
        }
        val btnLp = LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(10) }
        pad.addView(btnDelete, btnLp)

        cardView.addView(pad)

        val lp = LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(14) }
        cardView.layoutParams = lp
        return cardView
    }

    private fun confirmDelete(id: String, title: String) {
        AlertDialog.Builder(this)
            .setTitle("Delete Blog?")
            .setMessage("Are you sure you want to delete \"$title\"? This cannot be undone.")
            .setNegativeButton("Cancel", null)
            .setPositiveButton("Delete") { _, _ ->
                body.removeAllViews()
                body.addView(text("Deleting blog...", 14f, muted))
                executor.execute {
                    val result = Net.delete("/api/blog/$id")
                    runOnUiThread {
                        if (result.ok) {
                            toast("Blog deleted")
                        } else {
                            toast(result.errorMessage("Failed to delete blog"))
                        }
                        load()
                    }
                }
            }
            .show()
    }

    private fun openPost(b: JSONObject) {
        startActivity(Intent(this, BlogPostActivity::class.java).apply {
            putExtra("title", b.optString("title"))
            putExtra("body", b.optString("body"))
            putExtra("heroImage", b.optString("heroImage"))
            putExtra("vendorName", b.optString("vendorName"))
            putExtra("category", b.optString("category"))
            putExtra("productSlug", b.optString("productSlug"))
        })
    }

    private fun errorCard(message: String): View {
        val c = card()
        c.addView(text(message, 14f, muted))
        return c
    }

    private fun topRoundedOutline(radius: Float): ViewOutlineProvider = object : ViewOutlineProvider() {
        override fun getOutline(view: View, outline: android.graphics.Outline) {
            outline.setRoundRect(0, 0, view.width, view.height + radius.toInt(), radius)
        }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
