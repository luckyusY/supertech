package africa.supertech.marketplace

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.concurrent.Executors

/**
 * Primary sign-in hub when the user is logged out.
 * Google first (Credential Manager), then email — used from Account dock, gates, and post-logout.
 */
class SignInActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var googleButton: Button
    private lateinit var submitButton: Button
    private lateinit var errorText: TextView
    private lateinit var statusText: TextView
    private lateinit var setupHint: TextView
    private var googleHelper: GoogleSignInHelper? = null

    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.AUTH
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Net.isLoggedIn()) {
            goPostLogin()
            return
        }

        val switchAccount = intent.getBooleanExtra(EXTRA_SWITCH_ACCOUNT, false)
        val reason = intent.getStringExtra(EXTRA_REASON)
            ?.takeIf { it.isNotBlank() }
            ?: if (switchAccount) {
                "Choose a different Google or email account. Your previous SuperTech session on this phone was ended."
            } else {
                "Sign in to manage orders, products, payouts, and your account."
            }
        val signedOut = intent.getBooleanExtra(EXTRA_SIGNED_OUT, false) || switchAccount

        val content = scaffold(
            if (switchAccount) "Switch account" else "Account",
            withBack = true,
            withFab = false
        )

        // Hero card
        val hero = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
            clipToOutline = true
            outlineProvider = object : android.view.ViewOutlineProvider() {
                override fun getOutline(view: View, outline: android.graphics.Outline) {
                    outline.setRoundRect(0, 0, view.width, view.height, dp(16).toFloat())
                }
            }
        }
        val heroHeader = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = gradient(backgroundStrong, Color.rgb(20, 30, 50), 0f)
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }
        val lockIcon = if (switchAccount) R.drawable.ic_person else R.drawable.ic_lock
        heroHeader.addView(iconBubble(lockIcon, brand, Color.argb(40, 255, 255, 255), 40))
        val headerText = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
        }
        headerText.addView(text("SUPERTECH ACCOUNT", 11f, Color.argb(200, 255, 255, 255), Typeface.BOLD).apply {
            letterSpacing = 0.12f
        })
        headerText.addView(
            text(
                when {
                    switchAccount -> "Switch account"
                    signedOut -> "You're signed out"
                    else -> "Welcome back"
                },
                20f, Color.WHITE, Typeface.BOLD
            )
        )
        heroHeader.addView(headerText, LinearLayout.LayoutParams(0, wc(), 1f))
        hero.addView(heroHeader, LinearLayout.LayoutParams(mp(), wc()))

        val heroBody = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }
        heroBody.addView(
            text(reason, 14f, muted).apply {
                setLineSpacing(0f, 1.2f)
            }
        )
        if (switchAccount) {
            heroBody.addView(
                infoCard(R.drawable.ic_person, "Switch Account", "Tip: pick another Google account in the picker, or sign in with a different email.").apply {
                    (layoutParams as? LinearLayout.LayoutParams)?.topMargin = dp(10)
                }
            )
        }
        hero.addView(heroBody, LinearLayout.LayoutParams(mp(), wc()))
        content.block(hero, 16)

        // Benefits
        val benefits = card()
        benefits.addView(bulletRow("Track orders & requests in one place"))
        benefits.addView(bulletRow("Vendor dashboard, products & payouts"))
        benefits.addView(bulletRow("Saved preferences across devices"))
        content.block(benefits, 14)

        errorText = text("", 13f, danger).apply {
            visibility = View.GONE
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.2f)
        }
        content.block(errorText, 6)
        statusText = text("", 12f, muted).apply {
            visibility = View.GONE
            gravity = Gravity.CENTER
        }
        content.block(statusText, 6)
        setupHint = text("", 11f, muted).apply {
            visibility = View.GONE
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.25f)
            setOnClickListener {
                val helper = googleHelper
                    ?: GoogleSignInHelper(this@SignInActivity, { _, _ -> }, { _, _ -> }, {})
                val sha = helper.appSigningSha1()
                val clip = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
                clip.setPrimaryClip(ClipData.newPlainText("SuperTech SHA-1", sha))
                toast("SHA-1 copied")
            }
        }
        content.block(setupHint, 8)

        // Primary: Google
        googleButton = Button(this).apply {
            text = "Continue with Google"
            textSize = 15f
            isAllCaps = false
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(ColorStateList.valueOf(ink))
            backgroundTintList = null
            background = rounded(brand, Color.WHITE, dp(14).toFloat())
            elevation = dp(4).toFloat()
            stateListAnimator = null
            minimumHeight = dp(54)
            setPadding(dp(18), dp(15), dp(18), dp(15))
            pressable()
            setOnClickListener { startGoogle() }
            setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_google, 0, 0, 0)
            compoundDrawablePadding = dp(10)
            gravity = Gravity.CENTER
        }
        content.block(googleButton, 10)

        content.block(text("or use email", 12f, muted).apply {
            gravity = Gravity.CENTER
        }, 12)

        val form = card()
        val emailLabel = fieldLabel("Email address")
        form.block(emailLabel, 0)
        val email = inputField("you@example.com", Types.EMAIL)
        email.setOnFocusChangeListener { v, hasFocus ->
            v.background = rounded(if (hasFocus) brand else line, page, dp(12).toFloat())
            emailLabel.setTextColor(if (hasFocus) brand else muted)
        }
        form.block(email, 10)

        val passwordLabel = fieldLabel("Password")
        form.block(passwordLabel, 0)
        val password = inputField("Your password", Types.PASSWORD)
        password.setOnFocusChangeListener { v, hasFocus ->
            v.background = rounded(if (hasFocus) brand else line, page, dp(12).toFloat())
            passwordLabel.setTextColor(if (hasFocus) brand else muted)
        }
        form.block(password, 0)
        content.block(form, 12)

        submitButton = primaryButton("Sign in with email") {
            submitEmail(email.text.toString().trim(), password.text.toString())
        }
        submitButton.minimumHeight = dp(52)
        content.block(submitButton, 10)

        content.block(textButton("Forgot your password?") {
            startActivity(Intent(this, PasswordRecoveryActivity::class.java))
        }, 6)

        val signupRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
            pressable()
            setOnClickListener {
                startActivity(Intent(this@SignInActivity, SignUpActivity::class.java))
            }
        }
        signupRow.addView(iconBubble(R.drawable.ic_person, brand, softGreen, 36))
        val signupText = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
        }
        signupText.addView(text("New to SuperTech?", 15f, ink, Typeface.BOLD))
        signupText.addView(text("Create a new email account to get started", 12f, muted))
        signupRow.addView(signupText, LinearLayout.LayoutParams(0, wc(), 1f))
        signupRow.addView(icon(R.drawable.ic_chevron, muted, 20))
        content.block(signupRow, 12)

        content.block(textButton("Continue browsing as guest") {
            getSharedPreferences("supertech", MODE_PRIVATE)
                .edit().putBoolean("welcome_complete", true).apply()
            startActivity(Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            })
            finish()
        }, 10)

        // Prefill from intent
        intent.getStringExtra(EXTRA_EMAIL)?.takeIf { it.isNotBlank() }?.let { email.setText(it) }

        // Auto-prompt Google if requested (sign-out / switch account)
        if (intent.getBooleanExtra(EXTRA_PROMPT_GOOGLE, false) || switchAccount) {
            googleButton.postDelayed({ startGoogle() }, 350)
        }
    }

    private fun bulletRow(label: String): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(8), 0, dp(8))
        }
        val iconRes = when {
            label.contains("order", ignoreCase = true) -> R.drawable.ic_receipt
            label.contains("vendor", ignoreCase = true) -> R.drawable.ic_store
            else -> R.drawable.ic_person
        }
        row.addView(iconBubble(iconRes, brand, softGreen, 32))
        row.addView(
            text(label, 14f, ink).apply { setPadding(dp(12), 0, 0, 0) },
            LinearLayout.LayoutParams(0, wc(), 1f)
        )
        return row
    }

    private fun startGoogle() {
        hideError()
        val switch = intent.getBooleanExtra(EXTRA_SWITCH_ACCOUNT, false)
        googleHelper = GoogleSignInHelper(
            activity = this,
            onLoading = { loading, status -> setGoogleLoading(loading, status) },
            onError = { message, setup ->
                showError(message)
                if (!setup.isNullOrBlank()) {
                    setupHint.text = setup
                    setupHint.visibility = View.VISIBLE
                    setupHint.setTextColor(ink)
                }
            },
            onSuccess = { goPostLogin() },
            forceAccountPicker = switch
        )
        lifecycleScope.launch {
            googleHelper?.begin()
        }
    }

    private fun submitEmail(email: String, password: String) {
        hideError()
        if (email.isBlank() || password.isBlank()) {
            showError("Enter your email and password.")
            return
        }
        setEmailLoading(true)
        executor.execute {
            val result = Net.post(
                "/api/auth/sign-in",
                JSONObject().put("email", email).put("password", password)
            )
            val responseSession = if (result.ok) result.json().optJSONObject("session") else null
            val verifiedSession = if (result.ok && Net.hasSessionCookie()) {
                Net.get("/api/auth/session").json().optJSONObject("session")
            } else {
                null
            }
            runOnUiThread {
                setEmailLoading(false)
                when {
                    result.ok -> {
                        if (verifiedSession != null) {
                            Net.saveSession(verifiedSession)
                            getSharedPreferences("supertech", MODE_PRIVATE)
                                .edit().putBoolean("welcome_complete", true).apply()
                            goPostLogin()
                        } else if (responseSession != null && !Net.hasSessionCookie()) {
                            showError("Password is correct, but the session cookie was not saved. Reinstall the latest build and try again.")
                        } else {
                            showError("Signed in, but the app could not confirm the session. Try again.")
                        }
                    }
                    result.code == 0 -> showError("No connection. Check your internet and try again.")
                    else -> showError(result.errorMessage("Invalid email or password."))
                }
            }
        }
    }

    private fun goPostLogin() {
        toast("Signed in")
        val dest = intent.getStringExtra(EXTRA_NEXT)
        when (dest) {
            "main" -> startActivity(Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            })
            "checkout" -> startActivity(Intent(this, CheckoutActivity::class.java))
            else -> startActivity(Intent(this, DashboardActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
            })
        }
        finish()
    }

    private fun setGoogleLoading(loading: Boolean, status: String = "") {
        googleButton.isEnabled = !loading
        submitButton.isEnabled = !loading
        googleButton.alpha = if (loading) 0.65f else 1f
        googleButton.text = if (loading) "Connecting to Google…" else "Continue with Google"
        if (loading && status.isNotBlank()) {
            statusText.text = status
            statusText.visibility = View.VISIBLE
        } else if (!loading) {
            statusText.visibility = View.GONE
        }
    }

    private fun setEmailLoading(loading: Boolean) {
        submitButton.isEnabled = !loading
        googleButton.isEnabled = !loading
        submitButton.text = if (loading) "Signing in…" else "Sign in with email"
        submitButton.alpha = if (loading) 0.65f else 1f
    }

    private fun showError(message: String) {
        errorText.text = message
        if (errorText.visibility != View.VISIBLE) {
            errorText.visibility = View.VISIBLE
            errorText.translationY = -dp(40).toFloat()
            errorText.alpha = 0f
            errorText.animate()
                .translationY(0f)
                .alpha(1f)
                .setDuration(300)
                .setInterpolator(DecelerateInterpolator())
                .start()
        }
    }

    private fun hideError() {
        if (errorText.visibility == View.VISIBLE) {
            errorText.animate()
                .translationY(-dp(40).toFloat())
                .alpha(0f)
                .setDuration(250)
                .withEndAction { errorText.visibility = View.GONE }
                .start()
        }
        setupHint.visibility = View.GONE
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }

    companion object {
        const val EXTRA_REASON = "reason"
        const val EXTRA_SIGNED_OUT = "signed_out"
        const val EXTRA_PROMPT_GOOGLE = "prompt_google"
        const val EXTRA_SWITCH_ACCOUNT = "switch_account"
        const val EXTRA_EMAIL = "email"
        const val EXTRA_NEXT = "next"

        fun intent(
            from: android.content.Context,
            reason: String? = null,
            signedOut: Boolean = false,
            promptGoogle: Boolean = false,
            switchAccount: Boolean = false,
            next: String? = null
        ): Intent = Intent(from, SignInActivity::class.java).apply {
            reason?.let { putExtra(EXTRA_REASON, it) }
            putExtra(EXTRA_SIGNED_OUT, signedOut)
            putExtra(EXTRA_PROMPT_GOOGLE, promptGoogle)
            putExtra(EXTRA_SWITCH_ACCOUNT, switchAccount)
            next?.let { putExtra(EXTRA_NEXT, it) }
        }
    }
}
