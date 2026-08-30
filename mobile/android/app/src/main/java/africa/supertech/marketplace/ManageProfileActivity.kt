package africa.supertech.marketplace

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import org.json.JSONObject
import java.util.concurrent.Executors

class ManageProfileActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var nameInput: EditText
    private lateinit var phoneInput: EditText
    private lateinit var saveButton: Button
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val session = Net.session()
        if (session == null) {
            startActivity(Intent(this, SignInActivity::class.java))
            finish()
            return
        }

        val content = scaffold("Profile", withBack = true)
        body = LinearLayout(this).apply { 
            orientation = LinearLayout.VERTICAL 
            setPadding(0, dp(8), 0, dp(8))
        }
        content.block(body, 0)
        
        buildForm(session)
    }

    private fun buildForm(session: Net.Session) {
        body.removeAllViews()

        body.addView(sectionTitle("Account details"))
        body.addView(text("Update your personal information.", 13f, muted).apply {
            setPadding(dp(16), 0, dp(16), dp(16))
        })

        val form = card()
        
        val nameLabel = fieldLabel("Full name")
        form.block(nameLabel, 0)
        nameInput = inputField(session.name, Types.TEXT).apply {
            setText(session.name)
        }
        nameInput.setOnFocusChangeListener { v, hasFocus ->
            v.background = rounded(if (hasFocus) brand else line, page, dp(12).toFloat())
            nameLabel.setTextColor(if (hasFocus) brand else muted)
        }
        form.block(nameInput, 10)

        val phoneLabel = fieldLabel("Phone number (optional)")
        form.block(phoneLabel, 0)
        phoneInput = inputField("+250...", Types.PHONE)
        phoneInput.setOnFocusChangeListener { v, hasFocus ->
            v.background = rounded(if (hasFocus) brand else line, page, dp(12).toFloat())
            phoneLabel.setTextColor(if (hasFocus) brand else muted)
        }
        form.block(phoneInput, 0)

        body.addView(form.apply { 
            val lp = layoutParams as? LinearLayout.LayoutParams ?: LinearLayout.LayoutParams(mp(), wc())
            lp.setMargins(dp(16), 0, dp(16), dp(16))
            layoutParams = lp
        })

        saveButton = primaryButton("Save profile") { saveProfile() }
        body.addView(saveButton.apply {
            val lp = layoutParams as? LinearLayout.LayoutParams ?: LinearLayout.LayoutParams(mp(), wc())
            lp.setMargins(dp(16), 0, dp(16), dp(16))
            layoutParams = lp
        })
    }

    private fun saveProfile() {
        val name = nameInput.text.toString().trim()
        val phone = phoneInput.text.toString().trim()

        if (name.isBlank()) {
            toast("Name cannot be empty")
            return
        }

        saveButton.isEnabled = false
        saveButton.text = "Saving..."
        saveButton.alpha = 0.7f

        executor.execute {
            val payload = JSONObject().apply {
                put("name", name)
                put("phone", phone)
            }
            val result = Net.put("/api/account/profile", payload)
            
            runOnUiThread {
                saveButton.isEnabled = true
                saveButton.text = "Save profile"
                saveButton.alpha = 1f
                
                if (result.ok) {
                    toast("Profile updated successfully")
                    // The server sets a new cookie with updated session info, we should refresh session.
                    val sessionResp = Net.get("/api/auth/session")
                    if (sessionResp.ok) {
                        val sessObj = sessionResp.json().optJSONObject("session")
                        if (sessObj != null) {
                            Net.saveSession(sessObj)
                        }
                    }
                    finish()
                } else {
                    toast(result.errorMessage("Failed to update profile"))
                }
            }
        }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
