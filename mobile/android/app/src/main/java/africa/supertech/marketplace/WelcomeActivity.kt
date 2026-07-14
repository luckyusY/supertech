package africa.supertech.marketplace

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.animation.DecelerateInterpolator
import android.view.animation.OvershootInterpolator
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import androidx.lifecycle.lifecycleScope
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.json.JSONObject
import java.security.MessageDigest
import java.util.UUID
import java.util.concurrent.Executors

class WelcomeActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var googleButton: Button
    private lateinit var errorText: TextView
    private lateinit var statusText: TextView
    private lateinit var setupHint: TextView

    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.AUTH

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val preferences = getSharedPreferences("supertech", MODE_PRIVATE)
        val forceShow = intent.getBooleanExtra("force_show", false)
        if (!forceShow && (Net.isLoggedIn() || preferences.getBoolean("welcome_complete", false))) {
            openMarketplace()
            return
        }

        window.setBackgroundDrawable(gradient(backgroundStrong, brand, 0f))
        window.statusBarColor = backgroundStrong
        window.navigationBarColor = brand

        val content = scaffold("", withBack = false, withFab = false)
        content.gravity = Gravity.CENTER_HORIZONTAL
        content.setPadding(dp(20), dp(36), dp(20), dp(36))

        val mainCard = card(elevationDp = 12).apply {
            gravity = Gravity.CENTER_HORIZONTAL
        }

        val logoWrap = FrameLayout(this).apply {
            background = rounded(line, Color.WHITE, dp(24).toFloat())
            elevation = dp(6).toFloat()
            addView(ImageView(this@WelcomeActivity).apply {
                setImageResource(R.mipmap.ic_launcher)
                scaleType = ImageView.ScaleType.CENTER_CROP
                contentDescription = "SuperTech"
            }, FrameLayout.LayoutParams(dp(100), dp(100)))
        }
        mainCard.addView(logoWrap, LinearLayout.LayoutParams(dp(100), dp(100)).apply {
            gravity = Gravity.CENTER_HORIZONTAL
            bottomMargin = dp(16)
        })

        mainCard.addView(text("SuperTech", 14f, brand, Typeface.BOLD).apply {
            gravity = Gravity.CENTER
            letterSpacing = 0.12f
        }, LinearLayout.LayoutParams(wc(), wc()).apply { bottomMargin = dp(4) })

        mainCard.addView(text("Welcome to SuperTech", 24f, ink, Typeface.BOLD).apply {
            gravity = Gravity.CENTER
        }, LinearLayout.LayoutParams(wc(), wc()).apply { bottomMargin = dp(8) })

        mainCard.addView(text("Discover trusted products, request what you need, and manage every order from one app.", 14f, muted).apply {
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.15f)
        }, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(24) })

        val benefits = card(elevationDp = 0).apply {
            background = rounded(line, page, dp(16).toFloat())
            setPadding(dp(8), dp(8), dp(8), dp(8))
        }
        benefits.addView(benefit(R.drawable.ic_shield, "Trusted marketplace", "Products and sellers in one place"))
        benefits.addView(benefit(R.drawable.ic_sparkle, "AI assistance", "Get help finding the right product"))
        benefits.addView(benefit(R.drawable.ic_truck, "Track requests", "Follow orders and delivery progress"))
        mainCard.addView(benefits, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(24) })

        errorText = text("", 13f, danger).apply {
            visibility = View.GONE
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.2f)
        }
        mainCard.addView(errorText, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(6) })
        statusText = text("", 12f, muted).apply {
            visibility = View.GONE
            gravity = Gravity.CENTER
        }
        mainCard.addView(statusText, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(8) })

        setupHint = text("", 11f, muted).apply {
            visibility = View.GONE
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.25f)
            setOnClickListener {
                val sha = appSigningSha1()
                val clip = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
                clip.setPrimaryClip(ClipData.newPlainText("SuperTech SHA-1", sha))
                toast("SHA-1 copied")
            }
        }
        mainCard.addView(setupHint, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(8) })

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
            setOnClickListener { beginGoogleSignIn() }
            setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_google, 0, 0, 0)
            compoundDrawablePadding = dp(10)
            gravity = Gravity.CENTER
        }
        mainCard.addView(googleButton, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })

        val emailButton = primaryButton("Sign in with email") {
            startActivity(
                SignInActivity.intent(
                    this,
                    reason = "Sign in with your email to open SuperTech.",
                    next = "main"
                )
            )
            finish()
        }.apply { minimumHeight = dp(54) }
        mainCard.addView(emailButton, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(14) })

        content.addView(mainCard, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(20) })

        val guestButton = Button(this).apply {
            text = "Continue browsing as guest"
            textSize = 14f
            isAllCaps = false
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(ColorStateList.valueOf(Color.WHITE))
            backgroundTintList = null
            background = rounded(Color.WHITE, Color.TRANSPARENT, dp(14).toFloat())
            elevation = 0f
            stateListAnimator = null
            minimumHeight = dp(48)
            pressable()
            setOnClickListener {
                preferences.edit().putBoolean("welcome_complete", true).apply()
                openMarketplace()
            }
        }
        content.addView(guestButton, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(24) })

        val privacyText = text("By continuing, you agree to use SuperTech according to our privacy policy.", 11f, Color.argb(180, 255, 255, 255)).apply {
            gravity = Gravity.CENTER
        }
        content.addView(privacyText, LinearLayout.LayoutParams(mp(), wc()))

        // Staggered Entrance Animations
        mainCard.alpha = 0f
        mainCard.translationY = dp(80).toFloat()
        mainCard.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(600)
            .setInterpolator(DecelerateInterpolator())
            .start()

        logoWrap.alpha = 0f
        logoWrap.scaleX = 0.5f
        logoWrap.scaleY = 0.5f
        logoWrap.animate()
            .alpha(1f)
            .scaleX(1f)
            .scaleY(1f)
            .setDuration(650)
            .setStartDelay(200)
            .setInterpolator(OvershootInterpolator(1.2f))
            .start()

        googleButton.alpha = 0f
        googleButton.translationY = dp(20).toFloat()
        googleButton.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(400)
            .setStartDelay(350)
            .setInterpolator(OvershootInterpolator())
            .start()

        emailButton.alpha = 0f
        emailButton.translationY = dp(20).toFloat()
        emailButton.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(400)
            .setStartDelay(450)
            .setInterpolator(OvershootInterpolator())
            .start()

        guestButton.alpha = 0f
        guestButton.translationY = dp(20).toFloat()
        guestButton.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(400)
            .setStartDelay(550)
            .setInterpolator(OvershootInterpolator())
            .start()
    }

    private fun benefit(icon: Int, title: String, subtitle: String): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(4), dp(10), dp(4), dp(10))
        }
        row.addView(ImageView(this).apply {
            setImageResource(icon)
            setColorFilter(brand)
            setPadding(dp(7), dp(7), dp(7), dp(7))
            background = rounded(Color.TRANSPARENT, softGreen, dp(18).toFloat())
        }, LinearLayout.LayoutParams(dp(38), dp(38)))
        row.addView(LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
            addView(text(title, 15f, ink, Typeface.BOLD))
            addView(text(subtitle, 12f, muted))
        }, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        return row
    }

    private fun beginGoogleSignIn() {
        hideError()
        setGoogleLoading(true, "Preparing Google sign-in…")
        lifecycleScope.launch {
            try {
                // Web client ID (same as Vercel GOOGLE_WEB_CLIENT_ID) — NOT the Android client ID.
                val clientId = withContext(Dispatchers.IO) { resolveGoogleWebClientId() }
                if (clientId.isBlank()) {
                    setGoogleLoading(false)
                    showError(
                        "Web client ID missing. Keep GOOGLE_WEB_CLIENT_ID on Vercel (Web type), " +
                            "rebuild the app, or check /api/auth/google/config."
                    )
                    return@launch
                }
                Log.i(TAG, "Google sign-in using web client: ${clientId.take(24)}… package=$packageName sha1=${appSigningSha1()}")
                setGoogleLoading(true, "Choose a Google account…")
                launchGoogleCredential(clientId)
            } catch (error: Exception) {
                setGoogleLoading(false)
                showError(error.message ?: "Could not start Google sign-in.")
            }
        }
    }

    private fun resolveGoogleWebClientId(): String {
        val baked = BuildConfig.GOOGLE_WEB_CLIENT_ID.trim()
        if (baked.isNotBlank()) return baked
        return try {
            val result = Net.get("/api/auth/google/config")
            if (!result.ok) return ""
            result.json().optString("clientId").trim()
        } catch (_: Exception) {
            ""
        }
    }

    /**
     * Prefer the explicit "Sign in with Google" button flow (GetSignInWithGoogleOption),
     * then fall back to the One Tap / ID option. Both need the **Web** client ID in code
     * and a separate **Android** OAuth client (package + SHA-1) in Google Cloud.
     */
    private suspend fun launchGoogleCredential(clientId: String) {
        val hashedNonce = sha256Hex(UUID.randomUUID().toString())

        // 1) Button flow — most reliable when the user tapped "Continue with Google"
        try {
            val buttonOption = GetSignInWithGoogleOption.Builder(clientId)
                .setNonce(hashedNonce)
                .build()
            val buttonRequest = GetCredentialRequest.Builder()
                .addCredentialOption(buttonOption)
                .build()
            val result = withTimeout(90_000L) {
                CredentialManager.create(this@WelcomeActivity)
                    .getCredential(this@WelcomeActivity, buttonRequest)
            }
            handleCredentialResult(result.credential)
            return
        } catch (_: GetCredentialCancellationException) {
            setGoogleLoading(false)
            showError("Google sign-in was cancelled.")
            return
        } catch (e: NoCredentialException) {
            Log.w(TAG, "SignInWithGoogleOption: NoCredential — trying GetGoogleIdOption", e)
        } catch (e: GetCredentialException) {
            Log.w(TAG, "SignInWithGoogleOption failed: ${e.message}", e)
            // Fall through to One Tap style option
        } catch (e: TimeoutCancellationException) {
            setGoogleLoading(false)
            showShaBlockedError(
                "Google took too long. Check internet, then try again.\n\n" +
                    "If it keeps failing, register this app in Google Cloud:"
            )
            return
        }

        // 2) Fallback: Google ID / One Tap style
        try {
            val idOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(clientId)
                .setAutoSelectEnabled(false)
                .setNonce(hashedNonce)
                .build()
            val idRequest = GetCredentialRequest.Builder()
                .addCredentialOption(idOption)
                .build()
            val result = withTimeout(90_000L) {
                CredentialManager.create(this@WelcomeActivity)
                    .getCredential(this@WelcomeActivity, idRequest)
            }
            handleCredentialResult(result.credential)
        } catch (_: TimeoutCancellationException) {
            setGoogleLoading(false)
            showShaBlockedError("Google took too long. Check internet, then register package + SHA-1:")
        } catch (_: GoogleIdTokenParsingException) {
            setGoogleLoading(false)
            showError("Google account information could not be read. Try again.")
        } catch (_: GetCredentialCancellationException) {
            setGoogleLoading(false)
            showError("Google sign-in was cancelled.")
        } catch (e: NoCredentialException) {
            setGoogleLoading(false)
            Log.e(TAG, "NoCredentialException — Android OAuth client missing or wrong SHA-1", e)
            showShaBlockedError(
                "Google blocked this app (not a missing account on the phone).\n\n" +
                    "Create an Android OAuth client in Google Cloud with:"
            )
        } catch (error: GetCredentialException) {
            setGoogleLoading(false)
            showError(friendlyGoogleError(error))
        } catch (error: Exception) {
            setGoogleLoading(false)
            showError(error.message?.ifBlank { null } ?: "Google sign-in failed. Try again.")
        }
    }

    private fun handleCredentialResult(credential: androidx.credentials.Credential) {
        if (credential is CustomCredential &&
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
        ) {
            setGoogleLoading(true, "Signing you in…")
            val google = GoogleIdTokenCredential.createFrom(credential.data)
            exchangeGoogleToken(google.idToken)
        } else {
            setGoogleLoading(false)
            showError("Google returned an unsupported credential. Try another account.")
        }
    }

    private fun showShaBlockedError(prefix: String) {
        val sha = appSigningSha1()
        showError(
            "$prefix\n\n" +
                "Package:\n$packageName\n\n" +
                "SHA-1 (tap setup text below to copy):\n$sha"
        )
        setupHint.text =
            "Google Cloud → Credentials → Create OAuth client → type Android\n" +
                "Package: $packageName\n" +
                "SHA-1: $sha\n\n" +
                "Keep the Web client ID in the app/Vercel (already set).\n" +
                "Tap this text to copy SHA-1 · wait 2–5 min after saving"
        setupHint.visibility = View.VISIBLE
        setupHint.setTextColor(ink)
    }

    private fun friendlyGoogleError(error: GetCredentialException): String {
        val msg = buildString {
            append(error.message.orEmpty())
            append(' ')
            append(error.javaClass.simpleName)
        }
        return when {
            msg.contains("canceled", ignoreCase = true) ||
                msg.contains("cancelled", ignoreCase = true) ||
                msg.contains("16:", ignoreCase = true) ->
                "Google sign-in was cancelled."
            msg.contains("no credentials", ignoreCase = true) ||
                msg.contains("NoCredential", ignoreCase = true) ||
                msg.contains("Cannot find a matching credential", ignoreCase = true) -> {
                showShaBlockedError("Google has no credentials for this app. Register package + SHA-1:")
                return errorText.text.toString()
            }
            msg.contains("developer console", ignoreCase = true) ||
                msg.contains("API_NOT_CONNECTED", ignoreCase = true) ||
                msg.contains("DEVELOPER_ERROR", ignoreCase = true) ||
                msg.contains("10:", ignoreCase = true) -> {
                showShaBlockedError("Google Cloud developer error. Register package + SHA-1:")
                return errorText.text.toString()
            }
            else ->
                msg.trim().ifBlank { "Google sign-in failed. Try again." } +
                    "\n\nTip: Web client ID stays in Vercel/app. Android needs a separate Android OAuth client with SHA-1."
        }
    }

    private fun exchangeGoogleToken(idToken: String) {
        executor.execute {
            val result = Net.post("/api/auth/google", JSONObject().put("idToken", idToken))
            val session = if (result.ok) result.json().optJSONObject("session") else null
            runOnUiThread {
                setGoogleLoading(false)
                if (result.ok && session != null && Net.hasSessionCookie()) {
                    Net.saveSession(session)
                    getSharedPreferences("supertech", MODE_PRIVATE)
                        .edit().putBoolean("welcome_complete", true).apply()
                    openMarketplace()
                } else {
                    showError(
                        result.errorMessage(
                            "Server rejected Google sign-in. Check GOOGLE_WEB_CLIENT_ID on Vercel matches the Web client ID used by the app."
                        )
                    )
                }
            }
        }
    }

    private fun setGoogleLoading(loading: Boolean, status: String = "") {
        googleButton.isEnabled = !loading
        googleButton.alpha = if (loading) 0.6f else 1f
        googleButton.text = if (loading) "Connecting to Google…" else "Continue with Google"
        if (::statusText.isInitialized) {
            if (loading && status.isNotBlank()) {
                statusText.text = status
                statusText.visibility = View.VISIBLE
            } else {
                statusText.visibility = View.GONE
            }
        }
    }

    private fun showError(message: String) {
        errorText.text = message
        errorText.visibility = View.VISIBLE
    }

    private fun hideError() {
        errorText.visibility = View.GONE
        if (::setupHint.isInitialized) setupHint.visibility = View.GONE
    }

    private fun openMarketplace() {
        startActivity(Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        })
        finish()
    }

    /** SHA-1 of the cert that signed this installed APK (what Google Cloud must list). */
    private fun appSigningSha1(): String {
        return try {
            val signatures = if (Build.VERSION.SDK_INT >= 28) {
                val info = packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)
                // Cert that signed this installed APK (what Google Cloud Android client needs)
                info.signingInfo?.apkContentsSigners ?: emptyArray()
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNATURES).signatures
                    ?: emptyArray()
            }
            val sig = signatures.firstOrNull() ?: return "unknown"
            val digest = MessageDigest.getInstance("SHA-1").digest(sig.toByteArray())
            digest.joinToString(":") { b -> "%02X".format(b) }
        } catch (e: Exception) {
            Log.w(TAG, "Could not read signing SHA-1", e)
            "unknown"
        }
    }

    private fun sha256Hex(value: String): String {
        val digest = MessageDigest.getInstance("SHA-256").digest(value.toByteArray())
        return digest.joinToString("") { "%02x".format(it) }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }

    companion object {
        private const val TAG = "SuperTechGoogle"
    }
}
