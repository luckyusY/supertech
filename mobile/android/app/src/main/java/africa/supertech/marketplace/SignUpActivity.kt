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

class SignUpActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submitButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = scaffold("Create account", withBack = true, withFab = false)

        content.block(text("Join SuperTech", 27f, ink, Typeface.BOLD), 4)
        content.block(text("Create a free account to order, track deliveries and request products.", 14f, muted), 18)

        val form = card()
        form.block(fieldLabel("Full name"), 0)
        val name = inputField("Your name", Types.TEXT)
        form.block(name, 10)
        form.block(fieldLabel("Email address"), 0)
        val email = inputField("you@example.com", Types.EMAIL)
        form.block(email, 10)
        form.block(fieldLabel("Phone (optional)"), 0)
        val phone = inputField("+250…", Types.PHONE)
        form.block(phone, 10)
        form.block(fieldLabel("Password"), 0)
        val password = inputField("At least 8 characters", Types.PASSWORD)
        form.block(password, 0)
        content.block(form, 12)

        val message = text("", 13f, danger).apply { visibility = View.GONE }
        content.block(message, 6)

        submitButton = primaryButton("Create account") {
            submit(
                name.text.toString().trim(),
                email.text.toString().trim(),
                phone.text.toString().trim(),
                password.text.toString(),
                message
            )
        }
        submitButton.minimumHeight = dp(50)
        content.block(submitButton, 10)

        content.block(text("Already have an account?", 13f, muted).apply { gravity = Gravity.CENTER }, 6)
        content.block(secondaryButton("Sign in instead") {
            startActivity(Intent(this, SignInActivity::class.java))
            finish()
        }, 8)
    }

    private fun submit(name: String, email: String, phone: String, password: String, message: TextView) {
        message.visibility = View.GONE
        if (name.isBlank() || email.isBlank() || password.isBlank()) {
            show(message, danger, "Name, email and password are required.")
            return
        }
        if (password.length < 8) {
            show(message, danger, "Password must be at least 8 characters.")
            return
        }
        setLoading(true)
        executor.execute {
            val body = JSONObject()
                .put("name", name)
                .put("email", email)
                .put("password", password)
            if (phone.isNotBlank()) body.put("phone", phone)
            val result = Net.post("/api/auth/sign-up", body)
            runOnUiThread {
                setLoading(false)
                when {
                    result.ok -> {
                        show(message, brand, "Account created. Check your email to confirm, then sign in.")
                        submitButton.text = "Go to sign in"
                        submitButton.setOnClickListener {
                            startActivity(Intent(this, SignInActivity::class.java))
                            finish()
                        }
                    }
                    result.code == 0 -> show(message, danger, "No connection. Check your internet and try again.")
                    else -> show(message, danger, result.errorMessage("Could not create account."))
                }
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        submitButton.isEnabled = !loading
        submitButton.text = if (loading) "Creating account…" else "Create account"
        submitButton.alpha = if (loading) 0.6f else 1f
    }

    private fun show(view: TextView, color: Int, msg: String) {
        view.text = msg
        view.setTextColor(color)
        view.visibility = View.VISIBLE
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
