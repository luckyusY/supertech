package africa.supertech.marketplace

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Native role-aware dashboard. Reads live data from the same REST APIs the
 * website uses (cookie session), so admins, vendors and customers get a fully
 * native dashboard — no WebView.
 */
class DashboardActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val session = Net.session()
        if (session == null || !Net.isLoggedIn()) {
            startActivity(Intent(this, SignInActivity::class.java))
            finish()
            return
        }

        val content = scaffold("Dashboard")
        content.block(headerCard(session), 14)

        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)

        load(session)
    }

    private fun headerCard(session: Net.Session): View {
        val cardView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(18), dp(18), dp(18), dp(18))
            background = gradient(brand, brandDark, dp(18).toFloat())
            elevation = dp(4).toFloat()
        }
        val roleLabel = when (session.role) {
            "admin" -> "Administrator"
            "vendor" -> "Vendor"
            else -> "Customer"
        }
        cardView.addView(chip("● $roleLabel", Color_white_a(), brand).apply {
            // pill on the gradient
            background = rounded(android.graphics.Color.TRANSPARENT, android.graphics.Color.WHITE, dp(12).toFloat())
        })
        cardView.addView(text("Hi, ${session.name}", 23f, android.graphics.Color.WHITE, Typeface.BOLD).apply {
            setPadding(0, dp(8), 0, 0)
        })
        cardView.addView(text(session.email, 13f, android.graphics.Color.argb(215, 255, 255, 255)))

        val signOut = secondaryButton("Sign out") { signOut() }
        signOut.setTextColor(android.graphics.Color.WHITE)
        signOut.background = rounded(android.graphics.Color.argb(100, 255, 255, 255), android.graphics.Color.TRANSPARENT, dp(12).toFloat())
        val lp = LinearLayout.LayoutParams(wc(), wc()).apply { topMargin = dp(12) }
        cardView.addView(signOut, lp)
        return cardView
    }

    private fun Color_white_a() = android.graphics.Color.WHITE

    private fun load(session: Net.Session) {
        body.removeAllViews()
        body.addView(text("Loading your dashboard…", 14f, muted))
        executor.execute {
            when (session.role) {
                "admin" -> loadAdmin()
                "vendor" -> loadVendor(session)
                else -> runOnUiThread { renderCustomer() }
            }
        }
    }

    // ---- Admin ----

    private fun loadAdmin() {
        val analytics = Net.get("/api/analytics")
        val applications = Net.get("/api/vendor-applications?status=pending")
        val submissions = Net.get("/api/product-submissions?status=pending_review&limit=50")

        runOnUiThread {
            body.removeAllViews()
            if (!analytics.ok) {
                renderError(if (analytics.code == 0) "No connection." else analytics.errorMessage("Could not load analytics."))
                return@runOnUiThread
            }
            val a = analytics.json()
            body.addView(sectionTitle("Overview"))
            body.block(statGrid(listOf(
                "Vendors" to a.optInt("totalVendors").toString(),
                "Products" to a.optInt("totalProducts").toString(),
                "Gross sales" to "RWF ${money.format(a.optLong("totalGrossSales"))}",
                "Commission" to "RWF ${money.format(a.optLong("totalCommission"))}",
                "Net payouts" to "RWF ${money.format(a.optLong("totalNetPayouts"))}",
                "Pending approvals" to countOf(applications, "applications").toString()
            )), 4)

            val pendingProducts = countOf(submissions, "submissions")
            body.addView(actionCard("Approvals", "$pendingProducts products · ${countOf(applications, "applications")} vendor applications pending", "Review & approve") {
                startActivity(Intent(this, AdminModerationActivity::class.java))
            }.also { animateIn(it) })

            val breakdown = a.optJSONArray("vendorBreakdown")
            if (breakdown != null && breakdown.length() > 0) {
                body.addView(sectionTitle("Vendor performance"))
                for (i in 0 until breakdown.length()) {
                    val v = breakdown.optJSONObject(i) ?: continue
                    body.addView(vendorPerfCard(v).also { animateIn(it, i) })
                }
            }

            body.addView(sectionTitle("Manage"))
            body.addView(linkRow(R.drawable.ic_receipt, "Orders", "Confirm and fulfill customer orders") { startActivity(Intent(this, OrdersActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_box, "Products", "Manage listings and product stories") { startActivity(Intent(this, AdminProductsActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_star, "Analytics", "Sales, commission and vendor performance") { startActivity(Intent(this, AdminAnalyticsActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_sparkle, "AI Studio", "Generate marketplace content") { startActivity(Intent(this, AdminAiStudioActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_wallet, "Payouts", "Review vendor earnings") { startActivity(Intent(this, PayoutsActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_store, "Vendors", "Enable, disable and review sellers") { startActivity(Intent(this, AdminVendorsActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_shop, "Categories", "Organize marketplace sections") { startActivity(Intent(this, AdminCategoriesActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_receipt, "Blogs", "View and manage published blog posts") { startActivity(Intent(this, AdminBlogsActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_lock, "Account recovery", "Help users regain access") { startActivity(Intent(this, AdminRecoveryActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_person, "Profile", "Edit your admin account details") { startActivity(Intent(this, VendorProfileActivity::class.java)) })
        }
    }

    private fun vendorPerfCard(v: JSONObject): View {
        val cardView = card()
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(text(v.optString("vendorName", "Vendor"), 16f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        top.addView(chip("${v.optInt("activeProducts")} products", softGreen, brand))
        cardView.addView(top)
        cardView.addView(text("Gross RWF ${money.format(v.optLong("grossSales"))} · Net RWF ${money.format(v.optLong("netPayout"))}", 13f, muted))
        cardView.addView(text("Fulfillment ${v.optString("fulfillmentRate", "—")}", 12f, amber, Typeface.BOLD))
        return marginBottom(cardView)
    }

    // ---- Vendor ----

    private fun loadVendor(session: Net.Session) {
        val submissions = Net.get("/api/product-submissions?limit=50")
        val orders = Net.get("/api/order-requests?limit=10")

        runOnUiThread {
            body.removeAllViews()
            val subs = submissions.json().optJSONArray("submissions")
            val approved = countStatus(subs, "approved")
            val pending = countStatus(subs, "pending_review")

            body.addView(sectionTitle("Your store"))
            body.block(statGrid(listOf(
                "Products" to (subs?.length() ?: 0).toString(),
                "Approved" to approved.toString(),
                "In review" to pending.toString(),
                "Vendor" to (session.vendorSlug ?: "—")
            )), 4)

            body.addView(actionCard("List a new product", "Submit a product for review", "Add product") {
                startActivity(Intent(this, VendorProductActivity::class.java))
            }.also { animateIn(it) })

            body.addView(sectionTitle("Recent products"))
            if (subs == null || subs.length() == 0) {
                body.addView(emptyCard("No products yet", "Submit your first product to start selling."))
            } else {
                for (i in 0 until minOf(subs.length(), 12)) {
                    val p = subs.optJSONObject(i) ?: continue
                    body.addView(productRow(p).also { animateIn(it, i) })
                }
            }

            val orderArr = orders.json().optJSONArray("orders")
            if (orderArr != null && orderArr.length() > 0) {
                body.addView(sectionTitle("Recent orders"))
                for (i in 0 until minOf(orderArr.length(), 8)) {
                    val o = orderArr.optJSONObject(i) ?: continue
                    body.addView(orderRow(o).also { animateIn(it, i) })
                }
            }

            body.addView(sectionTitle("Manage"))
            body.addView(linkRow(R.drawable.ic_receipt, "Orders", "Manage customer requests") { startActivity(Intent(this, OrdersActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_wallet, "Payouts", "Track earnings and commission") { startActivity(Intent(this, PayoutsActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_sparkle, "AI Studio", "Write SEO blogs for your products") { startActivity(Intent(this, AdminAiStudioActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_receipt, "Blogs", "View and manage your published blogs") { startActivity(Intent(this, VendorBlogsActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_store, "Storefront & payments", "Branding and MoMo settings") { startActivity(Intent(this, StorefrontActivity::class.java)) })
            body.addView(linkRow(R.drawable.ic_person, "Profile", "Edit your vendor account details") { startActivity(Intent(this, VendorProfileActivity::class.java)) })
        }
    }

    private fun productRow(p: JSONObject): View {
        val cardView = card()
        cardView.pressable()
        cardView.setOnClickListener { openProductEdit(p) }
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(text(p.optString("name", "Product"), 16f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        top.addView(statusChip(p.optString("status")))
        cardView.addView(top)
        cardView.addView(text("${p.optString("category", "Tech")} · RWF ${money.format(p.optDouble("price", 0.0).toLong())}", 13f, muted))
        cardView.addView(text("Tap to edit", 12f, brand, Typeface.BOLD).apply { setPadding(0, dp(4), 0, 0) })
        return marginBottom(cardView)
    }

    private fun openProductEdit(p: JSONObject) {
        val features = ArrayList<String>()
        p.optJSONArray("features")?.let { arr -> for (i in 0 until arr.length()) arr.optString(i).takeIf { it.isNotBlank() }?.let(features::add) }
        startActivity(Intent(this, VendorProductActivity::class.java).apply {
            putExtra("editId", p.optString("id").ifBlank { p.optString("_id") })
            putExtra("name", p.optString("name"))
            putExtra("category", p.optString("category"))
            putExtra("price", p.optDouble("price", 0.0))
            putExtra("badge", p.optString("badge"))
            putExtra("stockLabel", p.optString("stockLabel"))
            putExtra("shipWindow", p.optString("shipWindow"))
            putExtra("description", p.optString("description"))
            putExtra("heroImage", p.optString("heroImage"))
            putExtra("features", features)
        })
    }

    private fun orderRow(o: JSONObject): View {
        val cardView = card()
        cardView.addView(text("Order ${o.optString("requestId", o.optString("id", "—"))}", 15f, ink, Typeface.BOLD))
        val who = o.optString("customerName").ifBlank { "Customer" }
        cardView.addView(text("$who · ${o.optString("status", "pending")}", 13f, muted))
        return marginBottom(cardView)
    }

    private fun statusChip(status: String): View {
        val (label, fill, fg) = when (status) {
            "approved" -> Triple("Approved", softGreen, brand)
            "rejected" -> Triple("Rejected", android.graphics.Color.rgb(253, 232, 232), danger)
            else -> Triple("In review", android.graphics.Color.rgb(252, 246, 230), amber)
        }
        return chip(label, fill, fg)
    }

    // ---- Customer ----

    private fun renderCustomer() {
        body.removeAllViews()
        body.addView(sectionTitle("Your account"))
        body.addView(actionCard("Track an order", "Follow your latest delivery", "Track order") {
            startActivity(Intent(this, TrackOrderActivity::class.java))
        })
        body.addView(actionCard("Request a product", "Ask vendors to source any item", "Request product") {
            startActivity(Intent(this, RequestProductActivity::class.java))
        })
        body.addView(sectionTitle("Shop"))
        body.addView(linkRow(R.drawable.ic_shop, "Browse the marketplace", "Discover products and trusted vendors") {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        })
    }

    // ---- Shared pieces ----

    private fun statGrid(items: List<Pair<String, String>>): View {
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        items.chunked(2).forEach { pair ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEachIndexed { i, item ->
                val lp = LinearLayout.LayoutParams(0, wc(), 1f).apply {
                    leftMargin = if (i == 0) 0 else dp(5)
                    rightMargin = if (i == 0) dp(5) else 0
                    bottomMargin = dp(10)
                }
                row.addView(statCard(item.first, item.second), lp)
            }
            if (pair.size == 1) row.addView(View(this), LinearLayout.LayoutParams(0, wc(), 1f))
            col.addView(row, LinearLayout.LayoutParams(mp(), wc()))
        }
        return col
    }

    private fun actionCard(title: String, subtitle: String, button: String, onClick: () -> Unit): View {
        val cardView = card()
        val iconRes = when {
            title.contains("approval", ignoreCase = true) -> R.drawable.ic_shield
            title.contains("track", ignoreCase = true) -> R.drawable.ic_truck
            else -> R.drawable.ic_box
        }
        val top = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        top.addView(iconBubble(iconRes, brand, softGreen, 44))
        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), 0, 0, 0)
        }
        copy.addView(text(title, 17f, ink, Typeface.BOLD))
        copy.addView(text(subtitle, 13f, muted))
        top.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))
        cardView.addView(top)
        val b = secondaryButton(button, onClick)
        cardView.addView(b, LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(14) })
        return marginBottom(cardView)
    }

    private fun linkRow(iconRes: Int, title: String, subtitle: String, onClick: () -> Unit): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(13), dp(14), dp(13))
            background = rounded(line, android.graphics.Color.WHITE, dp(16).toFloat())
            elevation = dp(2).toFloat()
            pressable()
            setOnClickListener { onClick() }
        }
        row.addView(iconBubble(iconRes, brand, softGreen, 40))
        val copy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(dp(12), 0, dp(8), 0) }
        copy.addView(text(title, 15f, ink, Typeface.BOLD))
        copy.addView(text(subtitle, 12f, muted).apply { maxLines = 1 })
        row.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))
        row.addView(icon(R.drawable.ic_chevron, muted, 20))
        return marginBottom(row, 10)
    }

    private fun emptyCard(title: String, detail: String): View {
        val cardView = card()
        cardView.addView(text(title, 16f, ink, Typeface.BOLD))
        cardView.addView(text(detail, 13f, muted))
        return marginBottom(cardView)
    }

    private fun renderError(message: String) {
        body.removeAllViews()
        body.addView(emptyCard("Could not load dashboard", message))
        body.addView(primaryButton("Try again") { Net.session()?.let { load(it) } }
            .apply { minimumHeight = dp(48) })
    }

    private fun marginBottom(view: View, bottom: Int = 12): View {
        view.layoutParams = LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(bottom) }
        return view
    }

    private fun countOf(result: Net.Result, key: String): Int =
        result.json().optJSONArray(key)?.length() ?: 0

    private fun countStatus(arr: org.json.JSONArray?, status: String): Int {
        if (arr == null) return 0
        var n = 0
        for (i in 0 until arr.length()) {
            if (arr.optJSONObject(i)?.optString("status") == status) n++
        }
        return n
    }

    private fun signOut() {
        executor.execute { Net.get("/api/auth/sign-out") }
        Net.signOut()
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
