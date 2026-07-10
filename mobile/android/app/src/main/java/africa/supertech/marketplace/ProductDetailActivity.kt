package africa.supertech.marketplace

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import java.text.NumberFormat
import java.util.Locale

/** Native product detail — hero image, price, features, add-to-cart and buy. */
class ProductDetailActivity : BaseActivity() {

    private val money = NumberFormat.getNumberInstance(Locale.US)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val e = intent
        val slug = e.getStringExtra("slug").orEmpty()
        val name = e.getStringExtra("name") ?: "Product"
        val category = e.getStringExtra("category") ?: "Tech"
        val description = e.getStringExtra("description").orEmpty()
        val price = e.getDoubleExtra("price", 0.0)
        val stockLabel = e.getStringExtra("stockLabel").orEmpty()
        val badge = e.getStringExtra("badge").orEmpty()
        val accent = e.getStringExtra("accent").orEmpty()
        val heroImage = e.getStringExtra("heroImage").orEmpty()
        val features = e.getStringArrayListExtra("features") ?: arrayListOf()

        val content = scaffold(name, withBack = true)

        val hero = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_INSIDE
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(parseColor(accent))
            setPadding(dp(40), dp(40), dp(40), dp(40))
        }
        val heroLp = LinearLayout.LayoutParams(mp(), dp(220)).apply { bottomMargin = dp(16) }
        hero.layoutParams = heroLp
        roundView(hero, dp(18).toFloat())
        content.addView(hero)
        loadImage(hero, heroImage)

        content.block(text(name, 24f, ink, Typeface.BOLD), 4)
        content.block(text(category, 14f, muted), 8)

        val priceRow = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        priceRow.addView(text("RWF ${money.format(price)}", 22f, brand, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        val tag = stockLabel.ifBlank { badge }
        if (tag.isNotBlank()) priceRow.addView(chip(tag, softGreen, brand))
        content.block(priceRow, 14)

        if (description.isNotBlank()) {
            val card = card()
            card.addView(text("About this product", 15f, ink, Typeface.BOLD))
            card.addView(text(description, 14f, muted).apply { setPadding(0, dp(6), 0, 0) })
            content.block(card, 12)
        }

        if (features.isNotEmpty()) {
            val card = card()
            card.addView(text("Key features", 15f, ink, Typeface.BOLD))
            features.forEach { f ->
                card.addView(text("•  $f", 14f, ink).apply { setPadding(0, dp(6), 0, 0) })
            }
            content.block(card, 12)
        }

        content.block(primaryButton("Add to cart") {
            Cart.add(slug, name, price)
            toast("$name added to cart")
        }.apply { minimumHeight = dp(50) }, 10)

        content.block(secondaryButton("Buy now") {
            Cart.add(slug, name, price)
            startActivity(Intent(this, CheckoutActivity::class.java))
        }, 8)
    }

    private fun parseColor(accent: String): Int = try {
        if (accent.isBlank()) Color.rgb(44, 105, 204) else Color.parseColor(accent)
    } catch (_: Exception) {
        Color.rgb(44, 105, 204)
    }

    private fun roundView(view: View, radius: Float) {
        view.clipToOutline = true
        view.outlineProvider = object : android.view.ViewOutlineProvider() {
            override fun getOutline(v: View, outline: android.graphics.Outline) {
                outline.setRoundRect(0, 0, v.width, v.height, radius)
            }
        }
    }
}
