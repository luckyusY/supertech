package africa.supertech.marketplace

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
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

        content.addView(ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher)
            scaleType = ImageView.ScaleType.FIT_CENTER
            contentDescription = "SuperTech"
        }, LinearLayout.LayoutParams(dp(112), dp(112)).apply { bottomMargin = dp(20) })

        content.block(text("Welcome to SuperTech", 28f, ink, Typeface.BOLD).apply {
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
        val clientId = BuildConfig.GOOGLE_WEB_CLIENT_ID.trim()
        if (clientId.isBlank()) {
            showError("Google sign-in needs its Google Cloud client ID before it can be used.")
            return
        }

        setGoogleLoading(true)
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
                showError(error.message ?: "Google sign-in was cancelled.")
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
