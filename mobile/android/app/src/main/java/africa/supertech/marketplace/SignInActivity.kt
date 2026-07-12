package africa.supertech.marketplace

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.TextView
import org.json.JSONObject
import java.util.concurrent.Executors

class SignInActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submitButton: Button

    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.AUTH

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Net.isLoggedIn()) {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
            return
        }

        val content = scaffold("Sign in", withBack = true, withFab = false)

        content.block(text("Welcome back", 27f, ink, Typeface.BOLD), 4)
        content.block(text("Sign in to manage your orders, products, payouts and account.", 14f, muted), 18)

        content.block(secondaryButton("Continue with Google") {
            startActivity(Intent(this, WelcomeActivity::class.java).apply {
                putExtra("force_show", true)
            })
            finish()
        }, 12)
        content.block(text("or sign in with email", 12f, muted).apply {
            gravity = Gravity.CENTER
        }, 12)

        val form = card()
        form.block(fieldLabel("Email address"), 0)
        val email = inputField("you@example.com", Types.EMAIL)
        form.block(email, 10)
        form.block(fieldLabel("Password"), 0)
        val password = inputField("Your password", Types.PASSWORD)
        form.block(password, 0)
        content.block(form, 12)

        val error = text("", 13f, danger).apply { visibility = View.GONE }
        content.block(error, 6)

        submitButton = primaryButton("Sign in") {
            submit(email.text.toString().trim(), password.text.toString(), error)
        }
        submitButton.minimumHeight = dp(50)
        content.block(submitButton, 10)

        content.block(textButton("Forgot your password?") {
            startActivity(Intent(this, PasswordRecoveryActivity::class.java))
        }, 6)

        content.block(text("New to SuperTech?", 13f, muted).apply { gravity = Gravity.CENTER }, 6)
        content.block(secondaryButton("Create an account") {
            startActivity(Intent(this, SignUpActivity::class.java))
            finish()
        }, 8)
    }

    private fun submit(email: String, password: String, error: View) {
        error.visibility = View.GONE
        if (email.isBlank() || password.isBlank()) {
            showError(error, "Enter your email and password.")
            return
        }
        setLoading(true)
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
                setLoading(false)
                when {
                    result.ok -> {
                        if (verifiedSession != null) {
                            Net.saveSession(verifiedSession)
                            startActivity(Intent(this, DashboardActivity::class.java))
                            finish()
                        } else if (responseSession != null && !Net.hasSessionCookie()) {
                            showError(error, "Password is correct, but the app did not receive the session cookie. Install this updated build and try again.")
                        } else {
                            showError(error, "Signed in, but the app could not confirm the session. Try again.")
                        }
                    }
                    result.code == 0 -> showError(error, "No connection. Check your internet and try again.")
                    else -> showError(error, result.errorMessage("Invalid email or password."))
                }
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        submitButton.isEnabled = !loading
        submitButton.text = if (loading) "Signing in…" else "Sign in"
        submitButton.alpha = if (loading) 0.6f else 1f
    }

    private fun showError(error: View, message: String) {
        (error as TextView).text = message
        error.visibility = View.VISIBLE
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
