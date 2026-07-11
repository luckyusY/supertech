package africa.supertech.marketplace

import android.annotation.SuppressLint
import android.content.res.ColorStateList
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.text.InputType
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import org.json.JSONArray
import org.json.JSONObject

/**
 * Shared design system + layout scaffolding for the native screens. Keeps the
 * sign-in, sign-up and dashboard activities concise and visually consistent,
 * and puts the AI Support floating button on every screen.
 */
abstract class BaseActivity : AppCompatActivity() {

    // Website-aligned design tokens (see docs/ANDROID_UI_DESIGN_PLAN.md)
    protected val ink = Color.rgb(49, 49, 51)
    protected val muted = Color.rgb(117, 117, 122)
    protected val line = Color.rgb(220, 221, 225)
    protected val page = Color.rgb(241, 241, 242)
    protected val brand = Color.rgb(232, 119, 10)       // --accent #E8770A
    protected val brandDark = Color.rgb(208, 106, 8)
    protected val softGreen = Color.rgb(255, 244, 229)  // accent-soft
    protected val danger = Color.rgb(240, 68, 56)
    protected val amber = Color.rgb(245, 166, 42)       // --gold #F5A62A
    protected val gold = Color.rgb(245, 166, 42)
    protected val backgroundStrong = Color.rgb(10, 15, 26)
    protected val blueStart = Color.rgb(11, 61, 145)
    protected val blueMid = Color.rgb(21, 101, 192)

    private val imageExecutor = java.util.concurrent.Executors.newFixedThreadPool(2)

    override fun onResume() {
        super.onResume()
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
    }

    override fun onDestroy() {
        imageExecutor.shutdownNow()
        super.onDestroy()
    }

    /** Loads a remote image into an ImageView, normalising relative URLs. */
    protected fun loadImage(target: android.widget.ImageView, rawUrl: String?) {
        val url = normalizeImage(rawUrl) ?: return
        val tagKey = 0x7f5a0002
        target.setTag(tagKey, url)
        imageExecutor.execute {
            try {
                val connection = java.net.URL(url).openConnection() as java.net.HttpURLConnection
                connection.connectTimeout = 12000
                connection.readTimeout = 12000
                connection.instanceFollowRedirects = true
                val bitmap = connection.inputStream.use { android.graphics.BitmapFactory.decodeStream(it) }
                connection.disconnect()
                if (bitmap != null) runOnUiThread {
                    if (target.getTag(tagKey) == url) {
                        target.setImageBitmap(bitmap)
                        target.scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
                        target.clearColorFilter()
                        target.setBackgroundColor(Color.TRANSPARENT)
                        target.setPadding(0, 0, 0, 0)
                        target.alpha = 0f
                        target.animate().alpha(1f).setDuration(240).start()
                    }
                }
            } catch (_: Exception) {
            }
        }
    }

    protected fun normalizeImage(raw: String?): String? {
        val value = raw?.trim().orEmpty()
        if (value.isBlank()) return null
        return when {
            value.startsWith("http", ignoreCase = true) -> value
            value.startsWith("//") -> "https:$value"
            value.startsWith("/") -> "${Net.BASE}$value"
            else -> "${Net.BASE}/$value"
        }
    }

    // ---- Scaffold ----

    /** Builds the standard screen (top bar + scrollable content + AI fab) and
     *  returns the content column to add views to. */
    protected fun scaffold(title: String, withBack: Boolean = true, withFab: Boolean = true): LinearLayout {
        window.statusBarColor = backgroundStrong
        window.navigationBarColor = Color.WHITE

        val rootFrame = FrameLayout(this).apply { setBackgroundColor(page) }
        val column = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(page)
        }
        column.addView(topBar(title, withBack), LinearLayout.LayoutParams(mp(), dp(56)))

        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(18), dp(18), dp(32))
        }
        val scroll = ScrollView(this).apply {
            isFillViewport = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(content)
        }
        column.addView(scroll, LinearLayout.LayoutParams(mp(), 0, 1f))
        rootFrame.addView(column, FrameLayout.LayoutParams(mp(), mp()))

        if (withFab) {
            val lp = FrameLayout.LayoutParams(wc(), wc(), Gravity.BOTTOM or Gravity.END)
            lp.setMargins(0, 0, dp(18), dp(24))
            rootFrame.addView(aiFab(), lp)
        }

        setContentView(rootFrame)
        return content
    }

    protected fun topBar(title: String, withBack: Boolean): View {
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(backgroundStrong)
            setPadding(dp(8), 0, dp(14), 0)
        }
        if (withBack) {
            bar.addView(android.widget.ImageView(this).apply {
                setImageResource(R.drawable.ic_chevron)
                setColorFilter(Color.WHITE)
                rotation = 180f
                setPadding(dp(10), dp(10), dp(10), dp(10))
                contentDescription = "Back"
                setOnClickListener { onBackPressedDispatcher.onBackPressed() }
            }, LinearLayout.LayoutParams(dp(40), dp(46)))
        } else {
            bar.addView(View(this), LinearLayout.LayoutParams(dp(8), dp(1)))
        }
        bar.addView(android.widget.ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher)
            scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(9).toFloat())
            clipToOutline = true
        }, LinearLayout.LayoutParams(dp(34), dp(34)).apply { rightMargin = dp(10) })
        bar.addView(TextView(this).apply {
            text = title
            textSize = 19f
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            maxLines = 1
        }, LinearLayout.LayoutParams(0, wc(), 1f))
        return bar
    }

    protected fun aiFab(): View {
        val fab = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = gradient(brand, brandDark, dp(28).toFloat())
            elevation = dp(12).toFloat()
            setPadding(dp(16), dp(13), dp(20), dp(13))
            setOnClickListener { startActivity(Intent(this@BaseActivity, AiSupportActivity::class.java)) }
        }
        fab.addView(icon(R.drawable.ic_sparkle, Color.WHITE, 20))
        fab.addView(text("AI Support", 14f, Color.WHITE, Typeface.BOLD).apply { setPadding(dp(8), 0, 0, 0) })
        fab.pressable()
        return fab
    }

    // ---- Icons ----

    /** Tinted vector icon. */
    protected fun icon(resId: Int, tint: Int, sizeDp: Int = 22): android.widget.ImageView {
        return android.widget.ImageView(this).apply {
            setImageResource(resId)
            setColorFilter(tint)
            layoutParams = LinearLayout.LayoutParams(dp(sizeDp), dp(sizeDp))
        }
    }

    /** Circular colored bubble holding an icon — the leading visual for rows/cards. */
    protected fun iconBubble(resId: Int, tint: Int, fill: Int, sizeDp: Int = 40): View {
        return FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, fill, dp(sizeDp / 2).toFloat())
            layoutParams = LinearLayout.LayoutParams(dp(sizeDp), dp(sizeDp))
            val inner = android.widget.ImageView(context).apply {
                setImageResource(resId)
                setColorFilter(tint)
            }
            val pad = dp((sizeDp - 22).coerceAtLeast(8) / 2)
            inner.setPadding(pad, pad, pad, pad)
            addView(inner, FrameLayout.LayoutParams(dp(sizeDp), dp(sizeDp)))
        }
    }

    /** Brand logo mark: bolt on a brand gradient tile. */
    protected fun logoMark(sizeDp: Int = 40): View {
        return FrameLayout(this).apply {
            background = rounded(line, Color.WHITE, dp(12).toFloat())
            elevation = dp(2).toFloat()
            layoutParams = LinearLayout.LayoutParams(dp(sizeDp), dp(sizeDp))
            val inner = android.widget.ImageView(context).apply {
                setImageResource(R.mipmap.ic_launcher)
                scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
            }
            addView(inner, FrameLayout.LayoutParams(dp(sizeDp), dp(sizeDp)))
        }
    }

    // ---- Building blocks ----

    protected fun text(value: String, size: Float, color: Int, style: Int = Typeface.NORMAL): TextView {
        return TextView(this).apply {
            text = value
            textSize = size
            setTextColor(color)
            typeface = Typeface.create(Typeface.DEFAULT, style)
            setLineSpacing(0f, 1.1f)
        }
    }

    protected fun card(): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
        }
    }

    protected fun inputField(hintText: String, type: Int): EditText {
        return EditText(this).apply {
            hint = hintText
            textSize = 15f
            setTextColor(ink)
            setHintTextColor(muted)
            setSingleLine(true)
            inputType = type
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = rounded(line, page, dp(12).toFloat())
            setOnFocusChangeListener { v, hasFocus ->
                v.background = rounded(if (hasFocus) brand else line, page, dp(12).toFloat())
            }
        }
    }

    protected fun categoryPicker(selected: String? = null): Spinner {
        val spinner = Spinner(this).apply {
            background = rounded(line, page, dp(12).toFloat())
            setPadding(dp(10), dp(8), dp(10), dp(8))
        }
        setCategoryOptions(spinner, defaultCategories(), selected)
        java.util.concurrent.Executors.newSingleThreadExecutor().execute {
            val result = Net.get("/api/mobile/marketplace")
            if (!result.ok) return@execute
            val live = try {
                parseCategories(result.json().optJSONArray("categories") ?: JSONArray())
            } catch (_: Exception) {
                emptyList()
            }
            if (live.isNotEmpty()) {
                runOnUiThread { setCategoryOptions(spinner, live, selected) }
            }
        }
        return spinner
    }

    protected fun selectedCategory(spinner: Spinner): String {
        return spinner.selectedItem?.toString()?.trim().orEmpty()
    }

    private fun setCategoryOptions(spinner: Spinner, categories: List<String>, selected: String?) {
        val values = categories
            .filter { it.isNotBlank() && it != "All" }
            .distinct()
        spinner.adapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_dropdown_item,
            values
        )
        val index = values.indexOfFirst { it.equals(selected.orEmpty(), ignoreCase = true) }
        if (index >= 0) spinner.setSelection(index)
    }

    private fun parseCategories(array: JSONArray): List<String> {
        return (0 until array.length()).mapNotNull { index ->
            array.optString(index).takeIf { it.isNotBlank() }
        }
    }

    private fun defaultCategories() = listOf(
        "Home Control",
        "Mobile Essentials",
        "Creator Gear",
        "Gaming",
        "Audio",
        "Wearables",
        "Beauty & Personal Care",
        "Health & Wellness",
        "Cars for Sale",
        "Cars for Rent",
        "Apartments for Sale",
        "Apartments for Rent",
        "Land for Sale",
        "Commercial Spaces"
    )

    protected fun fieldLabel(label: String): TextView {
        return text(label, 13f, muted, Typeface.BOLD).apply { setPadding(dp(2), dp(10), 0, dp(6)) }
    }

    protected fun primaryButton(label: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            textSize = 15f
            isAllCaps = false
            setTextColor(ColorStateList.valueOf(Color.WHITE))
            backgroundTintList = null
            background = rounded(Color.TRANSPARENT, brand, dp(14).toFloat())
            elevation = dp(2).toFloat()
            stateListAnimator = null
            pressable()
            setOnClickListener { onClick() }
        }
    }

    protected fun secondaryButton(label: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            textSize = 15f
            isAllCaps = false
            setTextColor(ColorStateList.valueOf(brand))
            backgroundTintList = null
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            stateListAnimator = null
            pressable()
            setOnClickListener { onClick() }
        }
    }

    protected fun textButton(label: String, onClick: () -> Unit): TextView {
        return text(label, 14f, brand, Typeface.BOLD).apply {
            gravity = Gravity.CENTER
            setPadding(dp(8), dp(12), dp(8), dp(12))
            pressable()
            setOnClickListener { onClick() }
        }
    }

    protected fun chip(label: String, fill: Int, textColor: Int): TextView {
        return text(label, 12f, textColor, Typeface.BOLD).apply {
            background = rounded(Color.TRANSPARENT, fill, dp(12).toFloat())
            setPadding(dp(10), dp(5), dp(10), dp(5))
        }
    }

    protected fun statCard(label: String, value: String): View {
        val box = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(15), dp(15), dp(15), dp(15))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
        }
        box.addView(View(this).apply {
            background = rounded(Color.TRANSPARENT, brand, dp(2).toFloat())
        }, LinearLayout.LayoutParams(dp(28), dp(4)).apply { bottomMargin = dp(10) })
        box.addView(text(value, 20f, ink, Typeface.BOLD).apply { maxLines = 2 })
        box.addView(text(label, 12f, muted, Typeface.BOLD).apply { setPadding(0, dp(3), 0, 0) })
        return box
    }

    // ---- Layout helpers ----

    protected fun LinearLayout.block(view: View, bottom: Int = 12) {
        val lp = LinearLayout.LayoutParams(mp(), wc())
        lp.bottomMargin = dp(bottom)
        addView(view, lp)
    }

    protected fun sectionTitle(title: String): View {
        return text(title, 18f, ink, Typeface.BOLD).apply { setPadding(dp(2), dp(14), 0, dp(8)) }
    }

    protected fun toast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    protected fun animateIn(view: View, position: Int = 0) {
        view.alpha = 0f
        view.translationY = dp(14).toFloat()
        view.animate()
            .alpha(1f)
            .translationY(0f)
            .setStartDelay((position.coerceAtMost(8) * 45).toLong())
            .setDuration(240)
            .setInterpolator(DecelerateInterpolator())
            .start()
    }

    @SuppressLint("ClickableViewAccessibility")
    protected fun View.pressable(): View {
        setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN ->
                    v.animate().scaleX(0.96f).scaleY(0.96f).setDuration(90).start()
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL ->
                    v.animate().scaleX(1f).scaleY(1f).setDuration(140)
                        .setInterpolator(OvershootInterpolator()).start()
            }
            false
        }
        return this
    }

    protected fun rounded(stroke: Int, fill: Int, radius: Float): GradientDrawable {
        return GradientDrawable().apply {
            setColor(fill)
            cornerRadius = radius
            if (stroke != Color.TRANSPARENT) setStroke(dp(1), stroke)
        }
    }

    protected fun gradient(start: Int, end: Int, radius: Float): GradientDrawable {
        return GradientDrawable(GradientDrawable.Orientation.TL_BR, intArrayOf(start, end)).apply {
            cornerRadius = radius
        }
    }

    protected fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
    protected fun mp() = LinearLayout.LayoutParams.MATCH_PARENT
    protected fun wc() = LinearLayout.LayoutParams.WRAP_CONTENT

    protected object Types {
        const val EMAIL = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
        const val PASSWORD = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD
        const val TEXT = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_WORDS
        const val PHONE = InputType.TYPE_CLASS_PHONE
    }
}
