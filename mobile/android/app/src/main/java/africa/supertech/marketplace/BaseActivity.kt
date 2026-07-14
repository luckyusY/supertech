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
import android.widget.HorizontalScrollView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.ArrayAdapter
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import org.json.JSONArray
import org.json.JSONObject
import android.animation.ValueAnimator
import android.util.LruCache
import android.view.HapticFeedbackConstants
import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Shader
import android.graphics.Outline
import android.view.ViewOutlineProvider

/**
 * Shared design system + layout scaffolding for the native screens. Keeps the
 * sign-in, sign-up and dashboard activities concise and visually consistent,
 * and puts the AI Support floating button on every screen.
 */
abstract class BaseActivity : AppCompatActivity() {

    // Website-aligned design tokens (see docs/ANDROID_UI_DESIGN_PLAN.md)
    protected val ink = Color.rgb(49, 49, 51)
    protected val muted = Color.rgb(117, 117, 122)
    protected val line = Color.rgb(228, 229, 233)
    protected val page = Color.rgb(245, 244, 240)       // canvas base (warm paper)
    protected val brand = Color.rgb(232, 119, 10)       // --accent #E8770A
    protected val brandDark = Color.rgb(208, 106, 8)
    protected val softGreen = Color.rgb(255, 244, 229)  // accent-soft
    protected val danger = Color.rgb(224, 36, 36)
    protected val amber = Color.rgb(245, 166, 42)       // --gold #F5A62A
    protected val gold = Color.rgb(245, 166, 42)
    protected val likeRose = Color.rgb(225, 29, 72)
    protected val backgroundStrong = Color.rgb(10, 15, 26)
    protected val blueStart = Color.rgb(11, 61, 145)
    protected val blueMid = Color.rgb(21, 101, 192)

    /** Override for ambient AppCanvas zone (website SiteCanvas parity). */
    protected open fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.APP

    /** Which bottom-dock tab is active on this screen (null = none highlighted). */
    protected open fun dockHighlight(): DockTab? = null

    /** Show global bottom navigation (shopper chrome on every page). */
    protected open fun showGlobalDock(): Boolean = true

    enum class DockTab { HOME, BROWSE, REQUEST, STORES, ACCOUNT, CART }

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
        val cached = imageCache.get(url)
        if (cached != null) {
            target.setImageBitmap(cached)
            target.scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
            target.clearColorFilter()
            target.setBackgroundColor(Color.TRANSPARENT)
            target.setPadding(0, 0, 0, 0)
            target.alpha = 1f
            return
        }
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
                if (bitmap != null) {
                    imageCache.put(url, bitmap)
                    runOnUiThread {
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

    protected var swipeRefreshLayout: androidx.swiperefreshlayout.widget.SwipeRefreshLayout? = null

    protected fun stopRefreshing() {
        runOnUiThread {
            swipeRefreshLayout?.isRefreshing = false
        }
    }

    /** Builds the standard screen (top bar + scrollable content + global dock + AI fab)
     *  and returns the content column to add views to. */
    protected fun scaffold(
        title: String,
        withBack: Boolean = true,
        withFab: Boolean = true,
        onRefresh: (() -> Unit)? = null
    ): LinearLayout {
        window.statusBarColor = backgroundStrong
        window.navigationBarColor = backgroundStrong

        val rootFrame = FrameLayout(this)
        rootFrame.addView(
            AppCanvasView(this).apply { zone = canvasZone() },
            FrameLayout.LayoutParams(mp(), mp())
        )

        val shell = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.TRANSPARENT)
        }
        shell.addView(topBar(title, withBack), LinearLayout.LayoutParams(mp(), dp(56)))

        val bottomPad = if (showGlobalDock()) 28 else 32
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(18), dp(18), dp(bottomPad))
            setBackgroundColor(Color.TRANSPARENT)
        }
        val scroll = ScrollView(this).apply {
            isFillViewport = false
            overScrollMode = View.OVER_SCROLL_NEVER
            setBackgroundColor(Color.TRANSPARENT)
            addView(content)
        }

        if (onRefresh != null) {
            val refresh = androidx.swiperefreshlayout.widget.SwipeRefreshLayout(this).apply {
                addView(scroll)
                setOnRefreshListener { onRefresh() }
            }
            swipeRefreshLayout = refresh
            shell.addView(refresh, LinearLayout.LayoutParams(mp(), 0, 1f))
        } else {
            shell.addView(scroll, LinearLayout.LayoutParams(mp(), 0, 1f))
        }

        if (showGlobalDock()) {
            val dock = globalBottomDock()
            shell.addView(dock, LinearLayout.LayoutParams(mp(), dp(64)))
            ViewCompat.setOnApplyWindowInsetsListener(dock) { v, insets ->
                val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
                v.setPadding(dp(2), dp(6), dp(2), dp(8) + bars.bottom)
                v.layoutParams = (v.layoutParams as LinearLayout.LayoutParams).apply {
                    height = dp(56) + bars.bottom + dp(8)
                }
                insets
            }
        }

        rootFrame.addView(shell, FrameLayout.LayoutParams(mp(), mp()))

        if (withFab) {
            val lp = FrameLayout.LayoutParams(wc(), wc(), Gravity.BOTTOM or Gravity.END)
            lp.setMargins(0, 0, dp(16), if (showGlobalDock()) dp(88) else dp(24))
            rootFrame.addView(aiFab(), lp)
        }

        setContentView(rootFrame)
        return content
    }

    /** Global shopper dock — same destinations as MainActivity on every page. */
    protected fun globalBottomDock(): View {
        val active = dockHighlight()
        val dock = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(2), dp(6), dp(2), dp(8))
            setBackgroundColor(backgroundStrong)
            elevation = dp(20).toFloat()
        }
        fun addTab(
            label: String,
            iconRes: Int,
            dockTab: DockTab,
            customIcon: View? = null,
            onClick: () -> Unit
        ) {
            val on = active == dockTab
            val cell = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                setPadding(dp(2), dp(4), dp(2), dp(2))
                pressable()
                setOnClickListener { onClick() }
            }
            if (customIcon != null) {
                cell.addView(customIcon, LinearLayout.LayoutParams(dp(26), dp(24)))
            } else {
                cell.addView(ImageView(this).apply {
                    setImageResource(iconRes)
                    setColorFilter(if (on) gold else Color.argb(180, 255, 255, 255))
                }, LinearLayout.LayoutParams(dp(22), dp(22)))
            }
            cell.addView(TextView(this).apply {
                text = label
                textSize = 10f
                gravity = Gravity.CENTER
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(if (on) gold else Color.argb(180, 255, 255, 255))
                setPadding(0, dp(2), 0, 0)
            })
            if (on) {
                cell.addView(View(this).apply {
                    background = rounded(Color.TRANSPARENT, gold, dp(2).toFloat())
                }, LinearLayout.LayoutParams(dp(18), dp(3)).apply { topMargin = dp(3) })
            }
            dock.addView(cell, LinearLayout.LayoutParams(0, mp(), 1f))
        }
        addTab("Home", R.drawable.ic_home, DockTab.HOME) { openMainTab("Home") }
        addTab("Browse", R.drawable.ic_menu, DockTab.BROWSE) { openMainTab("Home", openBrowse = true) }
        addTab("Request", R.drawable.ic_box, DockTab.REQUEST) {
            if (this !is RequestProductActivity) {
                navigateForward(Intent(this, RequestProductActivity::class.java))
            }
        }
        addTab("Stores", R.drawable.ic_store, DockTab.STORES) { openMainTab("Stores") }
        addTab(
            label = if (Net.isLoggedIn()) "Account" else "Sign in",
            iconRes = R.drawable.ic_person,
            dockTab = DockTab.ACCOUNT,
            customIcon = accountDockGlyph(active == DockTab.ACCOUNT)
        ) { openAccountScreen() }
        addTab("Cart", R.drawable.ic_cart, DockTab.CART) { openMainTab("Cart") }
        return dock
    }

    /**
     * Account dock glyph:
     * - Signed in: avatar initial in brand circle + green online dot
     * - Signed out: person icon + small orange “sign in” pulse dot
     */
    protected fun accountDockGlyph(active: Boolean): View {
        val wrap = FrameLayout(this)
        val session = Net.session()
        if (Net.isLoggedIn() && session != null) {
            val letter = session.name.trim().firstOrNull()?.uppercaseChar()?.toString()
                ?: session.email.trim().firstOrNull()?.uppercaseChar()?.toString()
                ?: "U"
            val avatar = TextView(this).apply {
                text = letter
                textSize = 11f
                typeface = Typeface.DEFAULT_BOLD
                gravity = Gravity.CENTER
                setTextColor(if (active) brandDark else Color.WHITE)
                background = rounded(
                    if (active) gold else Color.argb(60, 255, 255, 255),
                    if (active) gold else brand,
                    dp(12).toFloat()
                )
            }
            wrap.addView(avatar, FrameLayout.LayoutParams(dp(22), dp(22), Gravity.CENTER))
            // Online / signed-in indicator
            wrap.addView(View(this).apply {
                background = rounded(Color.WHITE, Color.rgb(34, 197, 94), dp(5).toFloat())
            }, FrameLayout.LayoutParams(dp(9), dp(9), Gravity.BOTTOM or Gravity.END).apply {
                bottomMargin = dp(0)
                rightMargin = dp(0)
            })
        } else {
            wrap.addView(ImageView(this).apply {
                setImageResource(R.drawable.ic_person)
                setColorFilter(if (active) gold else Color.argb(180, 255, 255, 255))
            }, FrameLayout.LayoutParams(dp(22), dp(22), Gravity.CENTER))
            // Soft “tap to sign in” cue
            wrap.addView(View(this).apply {
                background = rounded(Color.WHITE, brand, dp(5).toFloat())
            }, FrameLayout.LayoutParams(dp(8), dp(8), Gravity.TOP or Gravity.END))
        }
        return wrap
    }

    /** Dashboard when signed in; full Google + email hub when signed out. */
    protected fun openAccountScreen(reason: String? = null) {
        if (Net.isLoggedIn()) {
            if (this !is DashboardActivity) {
                navigateForward(Intent(this, DashboardActivity::class.java))
            }
        } else {
            if (this !is SignInActivity) {
                navigateForward(
                    SignInActivity.intent(
                        this,
                        reason = reason ?: "Sign in to open your SuperTech account.",
                        promptGoogle = false
                    )
                )
            }
        }
    }

    /**
     * Soft auth gate — dialog with Continue with Google / Email when an action needs a session.
     */
    protected fun requireLogin(
        reason: String = "Sign in to continue",
        next: String? = null,
        onAlreadyLoggedIn: () -> Unit = {}
    ) {
        if (Net.isLoggedIn()) {
            onAlreadyLoggedIn()
            return
        }
        android.app.AlertDialog.Builder(this)
            .setTitle("Sign in required")
            .setMessage(reason)
            .setPositiveButton("Continue with Google") { _, _ ->
                startActivity(
                    SignInActivity.intent(
                        this,
                        reason = reason,
                        promptGoogle = true,
                        next = next
                    )
                )
            }
            .setNeutralButton("Email") { _, _ ->
                startActivity(
                    SignInActivity.intent(
                        this,
                        reason = reason,
                        promptGoogle = false,
                        next = next
                    )
                )
            }
            .setNegativeButton("Not now", null)
            .show()
    }

    protected fun openMainTab(tab: String, openBrowse: Boolean = false) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("openTab", tab)
            putExtra("openBrowse", openBrowse)
        }
        startActivity(intent)
        overridePendingTransition(R.anim.fade_in, R.anim.fade_out)
    }

    /** Search field + horizontal filter chips for ops lists. */
    protected fun listSearchField(hint: String, onChange: (String) -> Unit): EditText {
        return EditText(this).apply {
            this.hint = hint
            textSize = 15f
            setTextColor(ink)
            setHintTextColor(muted)
            setSingleLine(true)
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = rounded(line, Color.WHITE, dp(12).toFloat())
            minimumHeight = dp(48)
            addTextChangedListener(object : android.text.TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    onChange(s?.toString().orEmpty())
                }
                override fun afterTextChanged(s: android.text.Editable?) {}
            })
        }
    }

    protected fun filterChips(
        options: List<String>,
        selected: String,
        onSelect: (String) -> Unit
    ): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp(2), dp(4), dp(2), dp(4))
        }
        options.forEach { opt ->
            val on = opt.equals(selected, true)
            val chipView = text(opt, 13f, if (on) Color.WHITE else brand, Typeface.BOLD).apply {
                background = rounded(
                    if (on) brand else line,
                    if (on) brand else Color.WHITE,
                    dp(18).toFloat()
                )
                setPadding(dp(14), dp(10), dp(14), dp(10))
                minimumHeight = dp(40)
                pressable()
                setOnClickListener { onSelect(opt) }
            }
            row.addView(chipView, LinearLayout.LayoutParams(wc(), wc()).apply { rightMargin = dp(8) })
        }
        return HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(row)
        }
    }

    /** Heart save control — returns ImageView inside a 36dp hit target. */
    protected fun likeButton(slug: String, onImage: Boolean = false, sizeDp: Int = 36): View {
        val likeColor = likeRose
        val idleColor = if (onImage) Color.WHITE else muted
        val wrap = FrameLayout(this).apply {
            background = if (onImage) {
                rounded(Color.TRANSPARENT, Color.argb(140, 0, 0, 0), dp(sizeDp / 2).toFloat())
            } else {
                rounded(line, Color.WHITE, dp(sizeDp / 2).toFloat())
            }
            contentDescription = if (Wishlist.isSaved(slug)) "Remove from saved" else "Save product"
            isClickable = true
            pressable()
        }
        val icon = android.widget.ImageView(this).apply {
            val saved = Wishlist.isSaved(slug)
            setImageResource(if (saved) R.drawable.ic_heart_fill else R.drawable.ic_heart)
            setColorFilter(if (saved) likeColor else idleColor)
            alpha = if (!saved && onImage) 0.95f else 1f
        }
        val pad = dp(8)
        icon.setPadding(pad, pad, pad, pad)
        wrap.addView(icon, FrameLayout.LayoutParams(dp(sizeDp), dp(sizeDp)))
        wrap.setOnClickListener {
            val saved = Wishlist.toggle(slug)
            icon.setImageResource(if (saved) R.drawable.ic_heart_fill else R.drawable.ic_heart)
            icon.setColorFilter(if (saved) likeColor else idleColor)
            wrap.contentDescription = if (saved) "Remove from saved" else "Save product"
            icon.animate().scaleX(0.8f).scaleY(0.8f).setDuration(80).withEndAction {
                icon.animate().scaleX(1.1f).scaleY(1.1f).setDuration(100).withEndAction {
                    icon.animate().scaleX(1f).scaleY(1f).setDuration(80).start()
                }.start()
            }.start()
            toast(if (saved) "Saved" else "Removed from saved")
        }
        return wrap
    }

    protected fun topBar(title: String, withBack: Boolean): View {
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(backgroundStrong)
            setPadding(dp(8), 0, dp(14), 0)
        }
        if (withBack) {
            val backFrame = FrameLayout(this).apply {
                pressable()
                setOnClickListener { onBackPressedDispatcher.onBackPressed() }
            }
            backFrame.addView(android.widget.ImageView(this).apply {
                setImageResource(R.drawable.ic_chevron)
                setColorFilter(Color.WHITE)
                rotation = 180f
                setPadding(dp(10), dp(10), dp(10), dp(10))
                contentDescription = "Back"
            }, FrameLayout.LayoutParams(dp(40), dp(46), Gravity.CENTER))
            bar.addView(backFrame, LinearLayout.LayoutParams(dp(40), dp(46)))
        } else {
            bar.addView(View(this), LinearLayout.LayoutParams(dp(8), dp(1)))
        }
        // Clean logo (no in-app notification badge on logo while app is open)
        bar.addView(FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(10).toFloat())
            elevation = dp(2).toFloat()
            addView(ImageView(this@BaseActivity).apply {
                setImageResource(R.mipmap.ic_launcher)
                scaleType = ImageView.ScaleType.CENTER_CROP
                contentDescription = "SuperTech"
            }, FrameLayout.LayoutParams(dp(38), dp(38)))
        }, LinearLayout.LayoutParams(dp(38), dp(38)).apply { rightMargin = dp(10) })
        val titleCol = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        if (title.isNotBlank()) {
            titleCol.addView(TextView(this).apply {
                text = title
                textSize = 17f
                setTextColor(Color.WHITE)
                typeface = Typeface.DEFAULT_BOLD
                maxLines = 1
            })
            titleCol.addView(TextView(this).apply {
                text = "SuperTech"
                textSize = 11f
                setTextColor(Color.argb(200, 255, 255, 255))
                typeface = Typeface.DEFAULT_BOLD
            })
        } else {
            titleCol.addView(TextView(this).apply {
                text = "SuperTech"
                textSize = 18f
                setTextColor(Color.WHITE)
                typeface = Typeface.DEFAULT_BOLD
            })
        }
        bar.addView(titleCol, LinearLayout.LayoutParams(0, wc(), 1f))
        // Notification control (trailing — same slot as call/WA on home)
        bar.addView(notificationBellButton(), LinearLayout.LayoutParams(dp(44), dp(44)).apply {
            leftMargin = dp(4)
        })
        return bar
    }

    /**
     * Header notification control — sits in the trailing slot (where call/WhatsApp
     * icons used to live). Circular hit target, badge on bell only (never on logo).
     * Badge refreshes live via [NotificationsStore] listeners.
     */
    protected fun notificationBellButton(): View {
        NotificationsStore.init(this)
        val wrap = FrameLayout(this).apply {
            contentDescription = "Notifications"
            pressable()
            setOnClickListener {
                startActivity(Intent(this@BaseActivity, NotificationsActivity::class.java))
                overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
            }
        }
        val iconPad = FrameLayout(this).apply {
            background = rounded(
                Color.argb(40, 255, 255, 255),
                Color.argb(28, 255, 255, 255),
                dp(22).toFloat()
            )
        }
        iconPad.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_bell)
            setColorFilter(Color.WHITE)
            scaleType = ImageView.ScaleType.CENTER_INSIDE
            setPadding(dp(9), dp(9), dp(9), dp(9))
        }, FrameLayout.LayoutParams(dp(40), dp(40), Gravity.CENTER))
        wrap.addView(iconPad, FrameLayout.LayoutParams(dp(40), dp(40), Gravity.CENTER))
        val badge = TextView(this).apply {
            textSize = 10f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.WHITE)
            gravity = Gravity.CENTER
            background = rounded(Color.TRANSPARENT, danger, dp(10).toFloat())
            minWidth = dp(18)
            setPadding(dp(5), dp(1), dp(5), dp(1))
            visibility = View.GONE
            tag = "notif_badge"
        }
        wrap.addView(badge, FrameLayout.LayoutParams(wc(), wc(), Gravity.TOP or Gravity.END))
        fun paintBadge() {
            val unread = NotificationsStore.unreadCount()
            if (unread > 0) {
                badge.visibility = View.VISIBLE
                badge.text = if (unread > 9) "9+" else unread.toString()
            } else {
                badge.visibility = View.GONE
            }
        }
        paintBadge()
        val listener = { paintBadge() }
        wrap.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
            override fun onViewAttachedToWindow(v: View) {
                NotificationsStore.addListener(listener)
                paintBadge()
            }
            override fun onViewDetachedFromWindow(v: View) {
                NotificationsStore.removeListener(listener)
            }
        })
        return wrap
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

    protected fun card(elevationDp: Int = 2, accentBorder: Boolean = false): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            if (accentBorder) {
                background = object : android.graphics.drawable.Drawable() {
                    val paintFill = Paint().apply { color = Color.WHITE; style = Paint.Style.FILL; isAntiAlias = true }
                    val paintStroke = Paint().apply { color = line; style = Paint.Style.STROKE; strokeWidth = dp(1).toFloat(); isAntiAlias = true }
                    val paintStripe = Paint().apply { color = brand; style = Paint.Style.FILL; isAntiAlias = true }
                    val path = android.graphics.Path()
                    val rect = android.graphics.RectF()

                    override fun draw(canvas: Canvas) {
                        rect.set(bounds)
                        val r = dp(16).toFloat()
                        canvas.drawRoundRect(rect, r, r, paintFill)
                        canvas.drawRoundRect(rect, r, r, paintStroke)
                        canvas.save()
                        path.reset()
                        path.addRoundRect(rect, r, r, android.graphics.Path.Direction.CW)
                        canvas.clipPath(path)
                        canvas.drawRect(rect.left, rect.top, rect.left + dp(4), rect.bottom, paintStripe)
                        canvas.restore()
                    }
                    override fun setAlpha(alpha: Int) {}
                    override fun setColorFilter(colorFilter: android.graphics.ColorFilter?) {}
                    override fun getOpacity(): Int = android.graphics.PixelFormat.TRANSLUCENT
                }
            } else {
                background = rounded(line, Color.WHITE, dp(16).toFloat())
            }
            elevation = dp(elevationDp).toFloat()
        }
    }

    protected fun inputField(hintText: String, type: Int): EditText {
        return EditText(this).apply {
            hint = hintText
            textSize = 15f
            setTextColor(ink)
            setHintTextColor(muted)
            setSingleLine(true)
            // Single-line: start of line, vertically centered in the control
            gravity = Gravity.CENTER_VERTICAL or Gravity.START
            inputType = type
            setPadding(dp(14), dp(12), dp(14), dp(12))
            minimumHeight = dp(48)
            background = rounded(line, page, dp(12).toFloat())
            setOnFocusChangeListener { v, hasFocus ->
                v.background = rounded(if (hasFocus) brand else line, page, dp(12).toFloat())
            }
        }
    }

    /**
     * Multi-line fields (description, notes, features). Text and cursor start at the
     * top-left — without TOP gravity Android often centers text in the tall box.
     */
    protected fun multiLineInputField(hintText: String, lines: Int = 4): EditText {
        return EditText(this).apply {
            hint = hintText
            textSize = 15f
            setTextColor(ink)
            setHintTextColor(muted)
            setSingleLine(false)
            maxLines = (lines * 3).coerceAtLeast(8)
            minLines = lines
            gravity = Gravity.TOP or Gravity.START
            inputType = InputType.TYPE_CLASS_TEXT or
                InputType.TYPE_TEXT_FLAG_MULTI_LINE or
                InputType.TYPE_TEXT_FLAG_CAP_SENTENCES or
                InputType.TYPE_TEXT_FLAG_IME_MULTI_LINE
            setPadding(dp(14), dp(12), dp(14), dp(12))
            // Reserve vertical space so the field doesn't look empty / centered
            minimumHeight = dp(20 + lines * 22)
            isVerticalScrollBarEnabled = true
            overScrollMode = View.OVER_SCROLL_IF_CONTENT_SCROLLS
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
        return primaryButton(label, null, onClick)
    }

    protected fun primaryButton(label: String, iconRes: Int? = null, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            textSize = 15f
            isAllCaps = false
            typeface = Typeface.DEFAULT_BOLD
            letterSpacing = 0.02f
            setTextColor(ColorStateList.valueOf(Color.WHITE))
            backgroundTintList = null
            background = gradient(brand, brandDark, dp(14).toFloat())
            elevation = dp(5).toFloat()
            stateListAnimator = null
            minimumHeight = dp(54)
            setPadding(dp(18), dp(15), dp(18), dp(15))
            pressable()
            setOnClickListener { onClick() }
            if (iconRes != null) {
                setCompoundDrawablesWithIntrinsicBounds(iconRes, 0, 0, 0)
                compoundDrawablePadding = dp(8)
                gravity = Gravity.CENTER
            }
        }
    }

    /** Green solid — Approve / Enable / Complete (ops). */
    protected fun successButton(label: String, onClick: () -> Unit): Button {
        val success = Color.rgb(14, 159, 110)
        val successDark = Color.rgb(10, 130, 90)
        return Button(this).apply {
            text = label
            textSize = 15f
            isAllCaps = false
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(ColorStateList.valueOf(Color.WHITE))
            backgroundTintList = null
            background = gradient(success, successDark, dp(14).toFloat())
            elevation = dp(4).toFloat()
            stateListAnimator = null
            minimumHeight = dp(54)
            setPadding(dp(16), dp(14), dp(16), dp(14))
            pressable()
            setOnClickListener { onClick() }
        }
    }

    /** Danger outline — Reject / Delete / Cancel. */
    protected fun dangerButton(label: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            textSize = 15f
            isAllCaps = false
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(ColorStateList.valueOf(danger))
            backgroundTintList = null
            background = rounded(danger, Color.rgb(255, 241, 242), dp(14).toFloat())
            elevation = dp(1).toFloat()
            stateListAnimator = null
            minimumHeight = dp(54)
            setPadding(dp(16), dp(14), dp(16), dp(14))
            pressable()
            setOnClickListener { onClick() }
        }
    }

    protected fun secondaryButton(label: String, onClick: () -> Unit): Button {
        return Button(this).apply {
            text = label
            textSize = 15f
            isAllCaps = false
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(ColorStateList.valueOf(brandDark))
            backgroundTintList = null
            background = rounded(Color.argb(90, 232, 119, 10), Color.WHITE, dp(14).toFloat())
            elevation = dp(2).toFloat()
            stateListAnimator = null
            minimumHeight = dp(52)
            setPadding(dp(16), dp(13), dp(16), dp(13))
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
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(2), dp(14), dp(2), dp(8))
            addView(text(title, 18f, ink, Typeface.BOLD))
            addView(View(this@BaseActivity).apply {
                background = rounded(Color.TRANSPARENT, brand, dp(2).toFloat())
            }, LinearLayout.LayoutParams(dp(28), dp(4)).apply { topMargin = dp(4) })
        }
    }

    protected fun marginBottom(view: View, bottom: Int = 12): View {
        view.layoutParams = LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(bottom) }
        return view
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
            .setStartDelay((position.coerceAtMost(6) * 40).toLong())
            .setDuration(220)
            .setInterpolator(DecelerateInterpolator())
            .start()
    }

    /** Content enter: fade + slight rise (shell tabs / body replace). */
    protected fun animateContentIn(view: View) {
        view.alpha = 0f
        view.translationY = dp(8).toFloat()
        view.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(200)
            .setInterpolator(DecelerateInterpolator())
            .start()
    }

    // ---- Shared retail product card (website parity) ----

    private val moneyFmt by lazy { java.text.NumberFormat.getNumberInstance(java.util.Locale.US) }

    /** Two-column product grid using [retailProductCard]. */
    protected fun retailProductGrid(
        items: List<CatalogProduct>,
        fixedCardWidthDp: Int = 0
    ): View {
        val grid = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        items.chunked(2).forEachIndexed { rowIndex, pair ->
            val rowView = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEachIndexed { col, product ->
                val card = retailProductCard(product)
                val lp = if (fixedCardWidthDp > 0) {
                    LinearLayout.LayoutParams(dp(fixedCardWidthDp), wc()).apply {
                        rightMargin = dp(10)
                        bottomMargin = dp(10)
                    }
                } else {
                    LinearLayout.LayoutParams(0, wc(), 1f).apply {
                        leftMargin = if (col == 0) 0 else dp(5)
                        rightMargin = if (col == 0) dp(5) else 0
                        bottomMargin = dp(10)
                    }
                }
                animateIn(card, rowIndex)
                rowView.addView(card, lp)
            }
            if (fixedCardWidthDp == 0 && pair.size == 1) {
                rowView.addView(View(this), LinearLayout.LayoutParams(0, wc(), 1f).apply { leftMargin = dp(5) })
            }
            grid.addView(rowView, LinearLayout.LayoutParams(mp(), wc()))
        }
        return grid
    }

    /** Website-style product card: image, ♥, ★, Add + WhatsApp. */
    protected fun retailProductCard(product: CatalogProduct): View {
        val mode = product.mode()
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            elevation = dp(4).toFloat()
            clipToOutline = true
            outlineProvider = object : android.view.ViewOutlineProvider() {
                override fun getOutline(view: View, outline: android.graphics.Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, dp(14).toFloat())
                }
            }
        }

        val imageH = dp(148)
        val imageWrap = FrameLayout(this).apply {
            pressable()
            setOnClickListener { openCatalogProduct(product) }
        }
        val image = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(product.color)
            setPadding(dp(24), dp(24), dp(24), dp(24))
        }
        loadImage(image, product.heroImage)
        imageWrap.addView(image, FrameLayout.LayoutParams(mp(), imageH))

        val badgeCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(8), dp(8), dp(8), 0)
        }
        when (mode) {
            "motors", "property" -> badgeCol.addView(TextView(this).apply {
                text = if (mode == "motors") "Motors" else "Property"
                textSize = 9f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(Color.WHITE)
                background = rounded(Color.TRANSPARENT, blueMid, dp(6).toFloat())
                setPadding(dp(7), dp(3), dp(7), dp(3))
            })
            else -> {
                val tag = product.badge.ifBlank { product.stockLabel }
                if (tag.isNotBlank()) {
                    badgeCol.addView(TextView(this).apply {
                        text = tag
                        textSize = 9f
                        typeface = Typeface.DEFAULT_BOLD
                        setTextColor(ink)
                        background = rounded(Color.TRANSPARENT, Color.argb(242, 255, 255, 255), dp(6).toFloat())
                        setPadding(dp(7), dp(3), dp(7), dp(3))
                        maxLines = 1
                    })
                }
            }
        }
        imageWrap.addView(badgeCol, FrameLayout.LayoutParams(wc(), wc(), Gravity.TOP or Gravity.START))
        imageWrap.addView(
            likeButton(product.slug, onImage = true, sizeDp = 34),
            FrameLayout.LayoutParams(dp(34), dp(34), Gravity.TOP or Gravity.END).apply {
                topMargin = dp(8); rightMargin = dp(8)
            }
        )
        card.addView(imageWrap, LinearLayout.LayoutParams(mp(), imageH))

        val body = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(10), dp(10), dp(10), dp(8))
            pressable()
            setOnClickListener { openCatalogProduct(product) }
        }
        val seller = product.vendorName.ifBlank { product.category }
        val ratingLabel = if (product.reviewCount > 0 && product.rating > 0) {
            String.format(java.util.Locale.US, "%.1f", product.rating)
        } else "New"
        val metaRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        metaRow.addView(text(seller, 11f, muted, Typeface.NORMAL).apply {
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
        }, LinearLayout.LayoutParams(0, wc(), 1f))
        metaRow.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_star)
            setColorFilter(gold)
        }, LinearLayout.LayoutParams(dp(12), dp(12)).apply { leftMargin = dp(4); rightMargin = dp(3) })
        metaRow.addView(text(ratingLabel, 11f, ink, Typeface.BOLD))
        body.addView(metaRow)
        body.addView(text(product.name, 13f, ink, Typeface.BOLD).apply {
            maxLines = 2
            minLines = 2
            ellipsize = android.text.TextUtils.TruncateAt.END
            setPadding(0, dp(6), 0, dp(4))
        })
        body.addView(text("RWF ${moneyFmt.format(product.price)}", 15f, brand, Typeface.BOLD).apply { maxLines = 1 })
        card.addView(body)

        val footer = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(8), dp(8), dp(8), dp(8))
            background = GradientDrawable().apply {
                setColor(Color.WHITE)
                setStroke(dp(1), line)
            }
        }
        val primaryLabel = when (mode) {
            "motors", "property" -> "Enquire"
            else -> if (product.outOfStock()) "Request" else "Add"
        }
        val primary = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            background = gradient(brand, brandDark, dp(10).toFloat())
            elevation = dp(2).toFloat()
            minimumHeight = dp(42)
            pressable()
            setOnClickListener { onRetailCardPrimary(product) }
        }
        if (mode == "shop" && !product.outOfStock()) {
            primary.addView(ImageView(this).apply {
                setImageResource(R.drawable.ic_cart)
                setColorFilter(Color.WHITE)
            }, LinearLayout.LayoutParams(dp(16), dp(16)).apply { rightMargin = dp(6) })
        }
        primary.addView(text(primaryLabel, 12f, Color.WHITE, Typeface.BOLD))
        footer.addView(primary, LinearLayout.LayoutParams(0, dp(42), 1f).apply { rightMargin = dp(6) })

        val wa = FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, Color.rgb(31, 174, 91), dp(10).toFloat())
            elevation = dp(2).toFloat()
            contentDescription = "WhatsApp"
            pressable()
            setOnClickListener {
                val msg = android.net.Uri.encode("Hello, I'm interested in ${product.name} on SuperTech.")
                startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse("https://wa.me/250783998231?text=$msg")))
            }
        }
        wa.addView(ImageView(this).apply {
            setImageResource(R.drawable.ic_whatsapp)
            setColorFilter(Color.WHITE)
            setPadding(dp(10), dp(10), dp(10), dp(10))
        }, FrameLayout.LayoutParams(dp(42), dp(42)))
        footer.addView(wa, LinearLayout.LayoutParams(dp(42), dp(42)))
        card.addView(footer)
        return card
    }

    protected open fun openCatalogProduct(product: CatalogProduct) {
        startActivity(Intent(this, ProductDetailActivity::class.java).apply {
            putExtra("slug", product.slug)
            putExtra("name", product.name)
            putExtra("category", product.category)
            putExtra("description", product.description)
            putExtra("price", product.price)
            putExtra("stockLabel", product.stockLabel)
            putExtra("badge", product.badge)
            putExtra("accent", product.accent)
            putExtra("heroImage", product.heroImage)
            putExtra("vendorSlug", product.vendorSlug)
            putExtra("vendorName", product.vendorName)
            putStringArrayListExtra("features", ArrayList(product.features))
        })
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
    }

    protected open fun onRetailCardPrimary(product: CatalogProduct) {
        when (product.mode()) {
            "motors", "property" -> openCatalogProduct(product)
            else -> if (product.outOfStock()) {
                startActivity(
                    Intent(this, RequestProductActivity::class.java)
                        .putExtra("productName", product.name)
                        .putExtra("category", product.category)
                )
            } else {
                Cart.add(product.slug, product.name, product.price, heroImage = product.heroImage)
                NotificationsStore.pushEvent(
                    this,
                    "Added to cart",
                    product.name,
                    kind = "cart",
                    imageUrl = product.heroImage
                )
                toast("${product.name} added to cart")
            }
        }
    }

    // ---- Navigation / motion ----

    enum class TransitionStyle { PUSH, FADE, MODAL_UP }

    protected fun navigateForward(intent: Intent, style: TransitionStyle = TransitionStyle.PUSH) {
        startActivity(intent)
        when (style) {
            TransitionStyle.PUSH ->
                overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left)
            TransitionStyle.FADE ->
                overridePendingTransition(R.anim.fade_in, R.anim.fade_out)
            TransitionStyle.MODAL_UP ->
                overridePendingTransition(R.anim.slide_up_in, R.anim.fade_out)
        }
    }

    protected fun finishSmart() {
        finish()
        overridePendingTransition(R.anim.slide_in_left, R.anim.slide_out_right)
    }

    protected fun navigateToMain(clearTop: Boolean = true) {
        val intent = Intent(this, MainActivity::class.java)
        if (clearTop) intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        startActivity(intent)
        overridePendingTransition(R.anim.fade_in, R.anim.fade_out)
        if (clearTop) finish()
    }

    // ---- Loading / empty / error states ----

    inner class ShimmerView(context: Context) : View(context) {
        private val paint = Paint().apply { isAntiAlias = true }
        private val shaderMatrix = Matrix()
        private var shimmerTranslate = 0f
        private var animator: ValueAnimator? = null

        private val baseColor = Color.rgb(229, 229, 231)
        private val highlightColor = Color.rgb(240, 240, 242)

        init {
            val gradient = LinearGradient(
                0f, 0f, 150f, 0f,
                intArrayOf(baseColor, highlightColor, baseColor),
                floatArrayOf(0f, 0.5f, 1f),
                Shader.TileMode.CLAMP
            )
            paint.shader = gradient
        }

        override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
            super.onSizeChanged(w, h, oldw, oldh)
            animator?.cancel()
            animator = ValueAnimator.ofFloat(-w.toFloat(), w.toFloat() * 1.5f).apply {
                duration = 1200
                repeatCount = ValueAnimator.INFINITE
                addUpdateListener { anim ->
                    shimmerTranslate = anim.animatedValue as Float
                    invalidate()
                }
                start()
            }
        }

        override fun onDraw(canvas: Canvas) {
            shaderMatrix.setTranslate(shimmerTranslate, 0f)
            paint.shader?.setLocalMatrix(shaderMatrix)
            canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)
        }

        override fun onDetachedFromWindow() {
            animator?.cancel()
            super.onDetachedFromWindow()
        }
    }

    private val skeleton = Color.rgb(229, 229, 231)
    private val skeletonSoft = Color.rgb(238, 238, 240)

    protected fun skeletonBlock(heightDp: Int, radiusDp: Int = 12): View {
        return ShimmerView(this).apply {
            background = rounded(Color.TRANSPARENT, Color.TRANSPARENT, dp(radiusDp).toFloat())
            clipToOutline = true
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, dp(radiusDp).toFloat())
                }
            }
            layoutParams = LinearLayout.LayoutParams(mp(), dp(heightDp)).apply {
                bottomMargin = dp(10)
            }
        }
    }

    protected fun skeletonCardRow(): View {
        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            elevation = dp(1).toFloat()
        }
        card.addView(skeletonBlock(16, 8))
        card.addView(skeletonBlock(12, 6).apply {
            layoutParams = LinearLayout.LayoutParams((resources.displayMetrics.widthPixels * 0.45f).toInt(), dp(12))
        })
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(card, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })
        }
    }

    protected fun skeletonKpiGrid(count: Int = 4): View {
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        val items = (0 until count).map { " " to " " }
        items.chunked(2).forEach { pair ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEachIndexed { i, _ ->
                val box = LinearLayout(this).apply {
                    orientation = LinearLayout.VERTICAL
                    setPadding(dp(14), dp(14), dp(14), dp(14))
                    background = rounded(line, Color.WHITE, dp(14).toFloat())
                }
                box.addView(skeletonBlock(20, 6).apply {
                    layoutParams = LinearLayout.LayoutParams(dp(48), dp(20)).apply { bottomMargin = dp(8) }
                })
                box.addView(skeletonBlock(12, 4).apply {
                    layoutParams = LinearLayout.LayoutParams(dp(72), dp(12))
                })
                val lp = LinearLayout.LayoutParams(0, wc(), 1f).apply {
                    leftMargin = if (i == 0) 0 else dp(5)
                    rightMargin = if (i == 0) dp(5) else 0
                    bottomMargin = dp(10)
                }
                row.addView(box, lp)
            }
            if (pair.size == 1) row.addView(View(this), LinearLayout.LayoutParams(0, wc(), 1f))
            col.addView(row, LinearLayout.LayoutParams(mp(), wc()))
        }
        return col
    }

    protected fun skeletonList(count: Int = 4): View {
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        repeat(count) { col.addView(skeletonCardRow()) }
        return col
    }

    enum class ChipStyle { APPROVED, PENDING, REJECTED, PAID, IN_PROGRESS, CANCELLED, INFO }

    protected fun statusChip(label: String, style: ChipStyle): TextView {
        val (fill, textCol) = when (style) {
            ChipStyle.APPROVED -> Color.rgb(209, 250, 229) to Color.rgb(6, 95, 70)
            ChipStyle.PENDING -> Color.rgb(254, 243, 199) to Color.rgb(146, 64, 14)
            ChipStyle.REJECTED -> Color.rgb(254, 226, 226) to Color.rgb(153, 27, 27)
            ChipStyle.PAID -> Color.rgb(209, 250, 229) to Color.rgb(6, 95, 70)
            ChipStyle.IN_PROGRESS -> Color.rgb(219, 234, 254) to Color.rgb(30, 64, 175)
            ChipStyle.CANCELLED -> Color.rgb(243, 244, 246) to Color.rgb(107, 114, 128)
            ChipStyle.INFO -> softGreen to brand
        }
        return text(label, 12f, textCol, Typeface.BOLD).apply {
            background = rounded(Color.TRANSPARENT, fill, dp(12).toFloat())
            setPadding(dp(10), dp(5), dp(10), dp(5))
        }
    }

    protected fun gradientHeroCard(title: String, subtitle: String, chipLabel: String? = null): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(20))
            background = gradient(backgroundStrong, brandDark, dp(20).toFloat())
            elevation = dp(6).toFloat()
            if (chipLabel != null) {
                addView(TextView(this@BaseActivity).apply {
                    text = chipLabel
                    textSize = 10f
                    typeface = Typeface.DEFAULT_BOLD
                    setTextColor(Color.WHITE)
                    background = rounded(Color.WHITE, Color.TRANSPARENT, dp(8).toFloat())
                    setPadding(dp(8), dp(3), dp(8), dp(3))
                }, LinearLayout.LayoutParams(wc(), wc()).apply { bottomMargin = dp(10) })
            }
            addView(text(title, 22f, Color.WHITE, Typeface.BOLD))
            addView(text(subtitle, 13f, Color.argb(200, 255, 255, 255)).apply {
                setPadding(0, dp(6), 0, 0)
            })
        }
    }

    protected fun infoCard(iconRes: Int, title: String, body: String, tint: Int = brand): View {
        val cardView = card(accentBorder = true)
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(iconBubble(iconRes, tint, softGreen, 40))
        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
        }
        copy.addView(text(title, 16f, ink, Typeface.BOLD))
        copy.addView(text(body, 13f, muted).apply { setPadding(0, dp(2), 0, 0) })
        top.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))
        cardView.addView(top)
        return marginBottom(cardView)
    }

    protected fun emptyState(
        title: String,
        detail: String,
        ctaLabel: String? = null,
        onCta: (() -> Unit)? = null
    ): View {
        return emptyState(title, detail, R.drawable.ic_box, ctaLabel, onCta)
    }

    protected fun emptyState(
        title: String,
        detail: String,
        iconRes: Int,
        ctaLabel: String? = null,
        onCta: (() -> Unit)? = null
    ): View {
        val cardView = card()
        cardView.gravity = Gravity.CENTER_HORIZONTAL
        cardView.addView(iconBubble(iconRes, brand, softGreen, 56).apply {
            (layoutParams as? LinearLayout.LayoutParams)?.gravity = Gravity.CENTER_HORIZONTAL
        })
        cardView.addView(text(title, 17f, ink, Typeface.BOLD).apply {
            gravity = Gravity.CENTER
            setPadding(0, dp(10), 0, 0)
        })
        cardView.addView(text(detail, 14f, muted).apply {
            gravity = Gravity.CENTER
            setPadding(0, dp(6), 0, 0)
            setLineSpacing(0f, 1.2f)
        })
        if (ctaLabel != null && onCta != null) {
            cardView.addView(
                primaryButton(ctaLabel, onCta).apply { minimumHeight = dp(48) },
                LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(14) }
            )
        }
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(cardView, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(12) })
            animateContentIn(this)
        }
    }

    protected fun errorState(
        message: String,
        onRetry: (() -> Unit)? = null,
        altLabel: String? = null,
        onAlt: (() -> Unit)? = null
    ): View {
        val cardView = card().apply {
            background = rounded(Color.rgb(248, 180, 180), Color.rgb(253, 242, 242), dp(16).toFloat())
        }
        cardView.gravity = Gravity.CENTER_HORIZONTAL
        cardView.addView(iconBubble(R.drawable.ic_shield, danger, Color.rgb(253, 242, 242), 56).apply {
            (layoutParams as? LinearLayout.LayoutParams)?.gravity = Gravity.CENTER_HORIZONTAL
        })
        cardView.addView(text("Something went wrong", 17f, Color.rgb(153, 27, 27), Typeface.BOLD).apply {
            gravity = Gravity.CENTER
            setPadding(0, dp(10), 0, 0)
        })
        cardView.addView(text(message, 14f, Color.rgb(185, 28, 28)).apply {
            gravity = Gravity.CENTER
            setPadding(0, dp(6), 0, 0)
            setLineSpacing(0f, 1.2f)
        })
        val actions = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, dp(12), 0, 0)
        }
        if (onRetry != null) {
            actions.addView(
                primaryButton("Try again", onRetry).apply { minimumHeight = dp(48) },
                LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(8) }
            )
        }
        if (altLabel != null && onAlt != null) {
            actions.addView(secondaryButton(altLabel, onAlt).apply { minimumHeight = dp(48) })
        }
        cardView.addView(actions)
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(cardView, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(12) })
            animateContentIn(this)
        }
    }

    /**
     * Ops / admin list row: # · thumb · title/meta · status · optional money.
     * Matches “every list looks good” contract.
     */
    protected fun numberedThumbRow(
        index: Int,
        imageUrl: String?,
        title: String,
        meta: String,
        statusLabel: String? = null,
        statusFill: Int = softGreen,
        statusFg: Int = brand,
        money: String? = null,
        fallbackColor: Int = softGreen,
        onClick: (() -> Unit)? = null
    ): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(12), dp(12), dp(12), dp(12))
            background = rounded(line, Color.WHITE, dp(14).toFloat())
            elevation = dp(2).toFloat()
            if (onClick != null) {
                pressable()
                setOnClickListener { onClick() }
            }
        }

        row.addView(TextView(this).apply {
            text = "#$index"
            textSize = 12f
            setTextColor(muted)
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            minWidth = dp(36)
        }, LinearLayout.LayoutParams(dp(36), wc()))

        val thumb = android.widget.ImageView(this).apply {
            scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(fallbackColor)
            setPadding(dp(10), dp(10), dp(10), dp(10))
        }
        val thumbLp = LinearLayout.LayoutParams(dp(56), dp(56)).apply {
            leftMargin = dp(4)
            rightMargin = dp(10)
        }
        row.addView(thumb, thumbLp)
        if (!imageUrl.isNullOrBlank()) loadImage(thumb, imageUrl)

        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, 0, dp(6), 0)
        }
        val titleRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        titleRow.addView(
            text(title, 15f, ink, Typeface.BOLD).apply {
                maxLines = 2
                ellipsize = android.text.TextUtils.TruncateAt.END
            },
            LinearLayout.LayoutParams(0, wc(), 1f)
        )
        if (!statusLabel.isNullOrBlank()) {
            titleRow.addView(chip(statusLabel, statusFill, statusFg))
        }
        copy.addView(titleRow)
        if (meta.isNotBlank()) {
            copy.addView(text(meta, 12f, muted).apply {
                maxLines = 1
                ellipsize = android.text.TextUtils.TruncateAt.END
                setPadding(0, dp(3), 0, 0)
            })
        }
        if (!money.isNullOrBlank()) {
            copy.addView(text(money, 14f, brand, Typeface.BOLD).apply {
                setPadding(0, dp(4), 0, 0)
            })
        }
        row.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))

        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(row, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })
        }
    }

    /** Horizontal micro-shake for form validation errors. */
    protected fun shake(view: View) {
        view.animate().translationX(dp(8).toFloat()).setDuration(50).withEndAction {
            view.animate().translationX((-dp(8)).toFloat()).setDuration(50).withEndAction {
                view.animate().translationX(dp(5).toFloat()).setDuration(50).withEndAction {
                    view.animate().translationX(0f).setDuration(50).start()
                }.start()
            }.start()
        }.start()
    }

    @SuppressLint("ClickableViewAccessibility")
    protected fun View.pressable(): View {
        setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    v.animate().scaleX(0.96f).scaleY(0.96f).setDuration(90).start()
                    v.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL ->
                    v.animate().scaleX(1f).scaleY(1f).setDuration(140)
                        .setInterpolator(OvershootInterpolator()).start()
            }
            false
        }
        return this
    }

    protected fun EditText.setErrorState(hasError: Boolean) {
        background = if (hasError) {
            rounded(danger, page, dp(12).toFloat())
        } else {
            rounded(line, page, dp(12).toFloat())
        }
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

    companion object {
        private val imageCache = LruCache<String, android.graphics.Bitmap>(32)
    }
}
