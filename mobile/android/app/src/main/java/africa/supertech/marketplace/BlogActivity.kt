package africa.supertech.marketplace

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

/** Native blog list (SEO content) → GET /api/blog. */
class BlogActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = scaffold("Blog", withBack = true)
        content.block(text("SuperTech stories", 24f, ink, Typeface.BOLD), 4)
        content.block(text("Guides, reviews and product news.", 14f, muted), 12)
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
                val blogs = result.json().optJSONArray("blogs")
                if (blogs == null || blogs.length() == 0) {
                    val c = card(); c.addView(text("No articles yet.", 14f, muted)); body.addView(c)
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
        cardView.addView(hero, LinearLayout.LayoutParams(mp(), dp(150)))
        loadImage(hero, b.optString("heroImage"))

        val pad = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(12), dp(14), dp(14))
        }
        pad.addView(text(b.optString("title", "Article"), 17f, ink, Typeface.BOLD).apply { maxLines = 2 })
        val excerpt = b.optString("excerpt").ifBlank { b.optString("metaDescription") }
        if (excerpt.isNotBlank()) pad.addView(text(excerpt, 13f, muted).apply { maxLines = 3; setPadding(0, dp(6), 0, 0) })
        pad.addView(text("By ${b.optString("vendorName", "SuperTech")} · ${b.optString("category", "")}".trim(' ', '·'), 12f, brand, Typeface.BOLD).apply { setPadding(0, dp(8), 0, 0) })
        cardView.addView(pad)

        val lp = LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(14) }
        cardView.layoutParams = lp
        return cardView
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
