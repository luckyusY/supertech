package africa.supertech.marketplace

import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.concurrent.Executors

class PasswordRecoveryActivity : BaseActivity() {
    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submit: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = scaffold("Reset password", withBack = true, withFab = false)
        content.block(text("Recover your account", 24f, ink, Typeface.BOLD), 6)
        content.block(text("Send a request to SuperTech support. Admins can review it inside the app.", 14f, muted), 14)

        val form = card()
        form.block(fieldLabel("Account email"), 0)
        val email = inputField("you@example.com", Types.EMAIL)
        form.block(email, 8)
        form.block(fieldLabel("Name"), 0)
        val name = inputField("Your name", Types.TEXT)
        form.block(name, 8)
        form.block(fieldLabel("Phone"), 0)
        val phone = inputField("07...", Types.PHONE)
        form.block(phone, 8)
        form.block(fieldLabel("Notes"), 0)
        val notes = inputField("What happened?", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE)
        notes.setSingleLine(false)
        notes.minLines = 3
        form.block(notes, 0)
        content.block(form, 12)

        val status = text("", 13f, muted).apply { visibility = View.GONE }
        content.block(status, 8)
        submit = primaryButton("Submit recovery request") {
            send(email.text.toString(), name.text.toString(), phone.text.toString(), notes.text.toString(), status)
        }
        content.block(submit, 0)
    }

    private fun send(email: String, name: String, phone: String, notes: String, status: TextView) {
        if (email.trim().isBlank()) {
            status.setTextColor(danger)
            status.text = "Enter your account email."
            status.visibility = View.VISIBLE
            return
        }
        submit.isEnabled = false
        submit.alpha = 0.6f
        status.setTextColor(muted)
        status.text = "Sending request..."
        status.visibility = View.VISIBLE
        executor.execute {
            val result = Net.post(
                "/api/auth/password-recovery",
                JSONObject()
                    .put("email", email.trim())
                    .put("name", name.trim())
                    .put("phone", phone.trim())
                    .put("notes", notes.trim())
            )
            runOnUiThread {
                submit.isEnabled = true
                submit.alpha = 1f
                if (result.ok) {
                    status.setTextColor(brand)
                    status.text = "Request submitted. SuperTech support will help you recover the account."
                } else {
                    status.setTextColor(danger)
                    status.text = result.errorMessage("Unable to submit recovery request.")
                }
            }
        }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
