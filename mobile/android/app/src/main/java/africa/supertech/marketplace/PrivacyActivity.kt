package africa.supertech.marketplace

import android.graphics.Typeface
import android.os.Bundle

class PrivacyActivity : BaseActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val content = scaffold("Privacy", withBack = true)
        content.block(text("SuperTech privacy", 24f, ink, Typeface.BOLD), 8)
        content.block(text("SuperTech uses your account details, product requests, order information, vendor submissions, and support messages to operate the marketplace, prevent misuse, and help buyers and sellers complete transactions.", 14f, muted), 12)
        content.block(sectionTitle("What the app stores"), 4)
        content.block(text("Account session, email, role, vendor profile, cart items, orders, product requests, recovery requests, and AI support conversation text when you send it.", 14f, muted), 12)
        content.block(sectionTitle("Payments"), 4)
        content.block(text("MoMoPay details are shown so customers can pay vendors. SuperTech does not collect card details inside this Android app.", 14f, muted), 12)
        content.block(sectionTitle("AI support"), 4)
        content.block(text("Messages sent to AI support are processed to answer questions about products, orders, vendors, and account workflows. Do not send passwords or private payment codes in chat.", 14f, muted), 12)
        content.block(sectionTitle("Control"), 4)
        content.block(text("You can sign out from the dashboard. For account help, use Reset password or contact SuperTech support.", 14f, muted), 0)
    }
}
