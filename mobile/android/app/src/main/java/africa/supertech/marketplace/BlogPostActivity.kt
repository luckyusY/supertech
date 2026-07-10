package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.view.ViewOutlineProvider
import android.widget.ImageView
import android.widget.LinearLayout

/** Native blog reader. Content is passed in from the list. */
class BlogPostActivity : BaseActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val title = intent.getStringExtra("title") ?: "Article"
        val articleBody = intent.getStringExtra("body").orEmpty()
        val heroImage = intent.getStringExtra("heroImage").orEmpty()
        val vendorName = intent.getStringExtra("vendorName").orEmpty()
        val category = intent.getStringExtra("category").orEmpty()

        val content = scaffold(title, withBack = true)

        if (heroImage.isNotBlank()) {
            val hero = ImageView(this).apply {
                scaleType = ImageView.ScaleType.CENTER_CROP
                setBackgroundColor(Color.rgb(232, 237, 242))
                clipToOutline = true
                outlineProvider = object : ViewOutlineProvider() {
                    override fun getOutline(view: View, outline: android.graphics.Outline) {
                        outline.setRoundRect(0, 0, view.width, view.height, dp(16).toFloat())
                    }
                }
            }
            content.block(hero.apply {
                layoutParams = LinearLayout.LayoutParams(mp(), dp(200))
            }, 14)
            loadImage(hero, heroImage)
        }

        content.block(text(title, 24f, ink, Typeface.BOLD), 6)
        val meta = listOf(vendorName, category).filter { it.isNotBlank() }.joinToString(" · ")
        if (meta.isNotBlank()) content.block(text(meta, 13f, brand, Typeface.BOLD), 14)

        // Render the article body as readable paragraphs.
        articleBody.split("\n").map { it.trim() }.filter { it.isNotBlank() }.forEach { para ->
            val heading = para.startsWith("#")
            val clean = para.trimStart('#', ' ').replace("**", "")
            content.block(
                text(clean, if (heading) 18f else 15f, ink, if (heading) Typeface.BOLD else Typeface.NORMAL),
                if (heading) 6 else 12
            )
        }

        if (articleBody.isBlank()) {
            content.block(text("This article has no content yet.", 14f, muted), 8)
        }
    }
}
