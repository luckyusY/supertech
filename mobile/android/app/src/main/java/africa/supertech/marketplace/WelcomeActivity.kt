package africa.supertech.marketplace

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import androidx.lifecycle.lifecycleScope
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.concurrent.Executors

class WelcomeActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var googleButton: Button
    private lateinit var errorText: TextView

    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.AUTH

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val preferences = getSharedPreferences("supertech", MODE_PRIVATE)
        val forceShow = intent.getBooleanExtra("force_show", false)
        if (!forceShow && (Net.isLoggedIn() || preferences.getBoolean("welcome_complete", false))) {
            openMarketplace()
            return
        }

        val content = scaffold("", withBack = false, withFab = false)
        content.gravity = Gravity.CENTER_HORIZONTAL
        content.setPadding(dp(24), dp(34), dp(24), dp(24))

        content.addView(FrameLayout(this).apply {
            background = rounded(line, Color.WHITE, dp(28).toFloat())
            elevation = dp(6).toFloat()
            addView(ImageView(this@WelcomeActivity).apply {
                setImageResource(R.mipmap.ic_launcher)
                scaleType = ImageView.ScaleType.CENTER_CROP
                contentDescription = "SuperTech"
            }, FrameLayout.LayoutParams(dp(120), dp(120)))
        }, LinearLayout.LayoutParams(dp(120), dp(120)).apply {
            gravity = Gravity.CENTER_HORIZONTAL
            bottomMargin = dp(18)
        })

        content.block(text("SuperTech", 14f, brand, Typeface.BOLD).apply {
            gravity = Gravity.CENTER
            letterSpacing = 0.12f
        }, 4)
        content.block(text("Welcome to SuperTech", 26f, ink, Typeface.BOLD).apply {
            gravity = Gravity.CENTER
        }, 8)
        content.block(text("Discover trusted products, request what you need, and manage every order from one app.", 15f, muted).apply {
            gravity = Gravity.CENTER
            setLineSpacing(0f, 1.15f)
        }, 28)

        val benefits = card()
        benefits.addView(benefit(R.drawable.ic_shield, "Trusted marketplace", "Products and sellers in one place"))
        benefits.addView(benefit(R.drawable.ic_sparkle, "AI assistance", "Get help finding the right product"))
        benefits.addView(benefit(R.drawable.ic_truck, "Track requests", "Follow orders and delivery progress"))
        content.block(benefits, 22)

        errorText = text("", 13f, danger).apply {
            visibility = View.GONE
            gravity = Gravity.CENTER
        }
        content.block(errorText, 8)

        googleButton = secondaryButton("Continue with Google") { beginGoogleSignIn() }
        googleButton.minimumHeight = dp(52)
        content.block(googleButton, 10)
        content.block(primaryButton("Sign in with email") {
            startActivity(Intent(this, SignInActivity::class.java))
        }.apply { minimumHeight = dp(52) }, 10)
        content.block(textButton("Continue as visitor") {
            preferences.edit().putBoolean("welcome_complete", true).apply()
            openMarketplace()
        }, 12)
        content.block(text("By continuing, you agree to use SuperTech according to our privacy policy.", 11f, muted).apply {
            gravity = Gravity.CENTER
        }, 0)
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
        setGoogleLoading(true)
        // BuildConfig is set at compile time; if blank, pull live client ID from supertech.africa
        // (same GOOGLE_WEB_CLIENT_ID used on Vercel). Vercel env never ships inside the APK by itself.
        executor.execute {
            val clientId = resolveGoogleWebClientId()
            runOnUiThread {
                if (clientId.isBlank()) {
                    setGoogleLoading(false)
                    showError(
                        "Google client ID is missing. Rebuild the app with SUPERTECH_GOOGLE_WEB_CLIENT_ID, " +
                            "or ensure https://supertech.africa/api/auth/google/config is online."
                    )
                    return@runOnUiThread
                }
                launchGoogleCredential(clientId)
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

    private fun launchGoogleCredential(clientId: String) {
        val googleOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(clientId)
            .setAutoSelectEnabled(false)
            .build()
        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleOption)
            .build()

        lifecycleScope.launch {
            try {
                val result = CredentialManager.create(this@WelcomeActivity)
                    .getCredential(this@WelcomeActivity, request)
                val credential = result.credential
                if (credential is CustomCredential &&
                    credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                ) {
                    val google = GoogleIdTokenCredential.createFrom(credential.data)
                    exchangeGoogleToken(google.idToken)
                } else {
                    setGoogleLoading(false)
                    showError("Google returned an unsupported credential. Try another account.")
                }
            } catch (_: GoogleIdTokenParsingException) {
                setGoogleLoading(false)
                showError("Google account information could not be read. Try again.")
            } catch (error: GetCredentialException) {
                setGoogleLoading(false)
                val msg = error.message.orEmpty()
                showError(
                    when {
                        msg.contains("16:", ignoreCase = true) ||
                            msg.contains("canceled", ignoreCase = true) ||
                            msg.contains("cancelled", ignoreCase = true) ->
                            "Google sign-in was cancelled."
                        msg.contains("no credentials", ignoreCase = true) ||
                            msg.contains("Cannot find a matching credential", ignoreCase = true) ->
                            "No Google account available on this phone. Add a Google account in Settings, then try again."
                        msg.contains("developer console", ignoreCase = true) ||
                            msg.contains("API_NOT_CONNECTED", ignoreCase = true) ->
                            "Google project setup: add this app’s package (africa.supertech.marketplace) and SHA-1 in Google Cloud."
                        else -> msg.ifBlank { "Google sign-in failed. Try again." }
                    }
                )
            }
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
                    showError(result.errorMessage("Google sign-in could not be completed."))
                }
            }
        }
    }

    private fun setGoogleLoading(loading: Boolean) {
        googleButton.isEnabled = !loading
        googleButton.alpha = if (loading) 0.6f else 1f
        googleButton.text = if (loading) "Connecting to Google..." else "Continue with Google"
    }

    private fun showError(message: String) {
        errorText.text = message
        errorText.visibility = View.VISIBLE
    }

    private fun hideError() {
        errorText.visibility = View.GONE
    }

    private fun openMarketplace() {
        startActivity(Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        })
        finish()
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
