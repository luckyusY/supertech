package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import org.json.JSONArray
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Checkout — clear order summary with images, form sections, sticky place-order bar.
 */
class CheckoutActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()
    private val money = NumberFormat.getNumberInstance(Locale.US)
    private lateinit var submit: Button
    private lateinit var stickyTotal: TextView
    private lateinit var errorText: TextView

    private var contactPref = "whatsapp"
    private var paymentPref = "mobile_money"

    // form fields retained for place()
    private lateinit var nameField: EditText
    private lateinit var emailField: EditText
    private lateinit var phoneField: EditText
    private lateinit var cityField: EditText
    private lateinit var addressField: EditText
    private lateinit var notesField: EditText

    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.APP
    override fun dockHighlight(): DockTab = DockTab.CART

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = backgroundStrong
        window.navigationBarColor = Color.WHITE

        if (Cart.isEmpty()) {
            val content = scaffold("Checkout", withBack = true, withFab = false)
            content.block(
                emptyState(
                    "Your cart is empty",
                    "Add products from the shop before checking out.",
                    "Back to shop"
                ) { navigateToMain() },
                8
            )
            return
        }

        val root = FrameLayout(this)
        root.addView(
            AppCanvasView(this).apply { zone = AppCanvasView.Zone.APP },
            FrameLayout.LayoutParams(mp(), mp())
        )

        val column = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.TRANSPARENT)
        }

        // Brand top bar
        column.addView(checkoutTopBar(), LinearLayout.LayoutParams(mp(), dp(56)))

        val scrollContent = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(14), dp(16), dp(140))
            setBackgroundColor(Color.TRANSPARENT)
        }
        val scroll = ScrollView(this).apply {
            isFillViewport = false
            overScrollMode = View.OVER_SCROLL_NEVER
            setBackgroundColor(Color.TRANSPARENT)
            addView(scrollContent)
        }
        column.addView(scroll, LinearLayout.LayoutParams(mp(), 0, 1f))
        val dock = globalBottomDock()
        column.addView(dock, LinearLayout.LayoutParams(mp(), dp(64)))
        ViewCompat.setOnApplyWindowInsetsListener(dock) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(dp(2), dp(6), dp(2), dp(8) + bars.bottom)
            v.layoutParams = (v.layoutParams as LinearLayout.LayoutParams).apply {
                height = dp(56) + bars.bottom + dp(8)
            }
            insets
        }
        root.addView(column, FrameLayout.LayoutParams(mp(), mp()))

        val session = Net.session()

        // Trust strip
        scrollContent.block(trustStrip(), 12)

        // Order items with images
        scrollContent.block(sectionLabel("Your items", "${Cart.count()} in cart"), 8)
        val itemsCard = card()
        val cartLines = Cart.lines.values.toList()
        cartLines.forEachIndexed { i, cartLine ->
            itemsCard.addView(checkoutLine(cartLine))
            if (i < cartLines.size - 1) {
                itemsCard.addView(View(this).apply { setBackgroundColor(line) },
                    LinearLayout.LayoutParams(mp(), dp(1)).apply {
                        topMargin = dp(8); bottomMargin = dp(8)
                    })
            }
        }
        val totalRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(12), 0, 0)
        }
        totalRow.addView(text("Estimated total", 15f, ink, Typeface.BOLD), LinearLayout.LayoutParams(0, wc(), 1f))
        totalRow.addView(text("RWF ${money.format(Cart.total())}", 18f, brand, Typeface.BOLD))
        itemsCard.addView(totalRow)
        scrollContent.block(itemsCard, 16)

        // Contact
        scrollContent.block(sectionLabel("Delivery details", "We’ll use this to fulfill your request"), 8)
        val form = card()
        form.block(fieldLabel("Full name"), 0)
        nameField = inputField("Your name", Types.TEXT)
        session?.name?.takeIf { it.isNotBlank() }?.let { nameField.setText(it) }
        form.block(nameField, 10)
        form.block(fieldLabel("Email"), 0)
        emailField = inputField("you@example.com", Types.EMAIL)
        session?.email?.takeIf { it.isNotBlank() }?.let { emailField.setText(it) }
        form.block(emailField, 10)
        form.block(fieldLabel("Phone / WhatsApp"), 0)
        phoneField = inputField("+250…", Types.PHONE)
        form.block(phoneField, 10)
        form.block(fieldLabel("City"), 0)
        cityField = inputField("Kigali", Types.TEXT)
        form.block(cityField, 10)
        form.block(fieldLabel("Delivery address"), 0)
        addressField = inputField("Street, area, landmark", Types.TEXT)
        form.block(addressField, 10)
        form.block(fieldLabel("Notes (optional)"), 0)
        notesField = inputField("Anything we should know", Types.TEXT)
        form.block(notesField, 0)
        scrollContent.block(form, 16)

        scrollContent.block(sectionLabel("Contact preference", "How vendors should reach you"), 8)
        scrollContent.block(
            choiceGroup(
                listOf("whatsapp" to "WhatsApp", "phone" to "Phone", "email" to "Email"),
                contactPref
            ) { contactPref = it },
            14
        )

        scrollContent.block(sectionLabel("Payment preference", "Confirm with vendor at fulfillment"), 8)
        scrollContent.block(
            choiceGroup(
                listOf(
                    "mobile_money" to "Mobile money",
                    "cash_on_delivery" to "Cash on delivery",
                    "bank_transfer" to "Bank transfer",
                    "manual_arrangement" to "Arrange later"
                ),
                paymentPref
            ) { paymentPref = it },
            12
        )

        errorText = text("", 13f, danger).apply { visibility = View.GONE }
        scrollContent.block(errorText, 8)

        // Sticky place order
        val sticky = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
            elevation = dp(16).toFloat()
            setPadding(dp(14), dp(12), dp(14), dp(12))
            background = GradientDrawable().apply {
                setColor(Color.WHITE)
                setStroke(dp(1), line)
            }
        }
        val stickyTop = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        stickyTop.addView(
            logoBadge(36),
            LinearLayout.LayoutParams(dp(36), dp(36)).apply { rightMargin = dp(10) }
        )
        val stickyCopy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        stickyCopy.addView(text("${Cart.count()} items · SuperTech checkout", 12f, muted))
        stickyTotal = text("RWF ${money.format(Cart.total())}", 17f, brand, Typeface.BOLD)
        stickyCopy.addView(stickyTotal)
        stickyTop.addView(stickyCopy, LinearLayout.LayoutParams(0, wc(), 1f))
        sticky.addView(stickyTop)

        submit = primaryButton("Place order request") {
            place()
        }.apply { minimumHeight = dp(54) }
        sticky.addView(submit, LinearLayout.LayoutParams(mp(), dp(54)).apply { topMargin = dp(10) })

        // Sticky sits above global dock
        root.addView(
            sticky,
            FrameLayout.LayoutParams(mp(), wc(), Gravity.BOTTOM).apply {
                bottomMargin = dp(64)
            }
        )
        ViewCompat.setOnApplyWindowInsetsListener(sticky) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val dockH = dp(56) + bars.bottom + dp(8)
            (v.layoutParams as FrameLayout.LayoutParams).bottomMargin = dockH
            v.setPadding(dp(14), dp(12), dp(14), dp(12))
            v.requestLayout()
            insets
        }
        setContentView(root)
        animateContentIn(scrollContent)
    }

    private fun checkoutTopBar(): View {
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(backgroundStrong)
            setPadding(dp(8), 0, dp(14), 0)
        }
        bar.addView(android.widget.ImageView(this).apply {
            setImageResource(R.drawable.ic_chevron)
            setColorFilter(Color.WHITE)
            rotation = 180f
            setPadding(dp(10), dp(10), dp(10), dp(10))
            contentDescription = "Back"
            setOnClickListener { finishSmart() }
        }, LinearLayout.LayoutParams(dp(44), dp(48)))
        bar.addView(
            logoBadge(40),
            LinearLayout.LayoutParams(dp(40), dp(40)).apply { rightMargin = dp(10) }
        )
        val titles = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        titles.addView(text("Checkout", 18f, Color.WHITE, Typeface.BOLD))
        titles.addView(text("SuperTech · Secure request", 11f, Color.argb(200, 255, 255, 255)))
        bar.addView(titles, LinearLayout.LayoutParams(0, wc(), 1f))
        return bar
    }

    private fun logoBadge(size: Int): View {
        return FrameLayout(this).apply {
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(10).toFloat())
            elevation = dp(2).toFloat()
            addView(ImageView(this@CheckoutActivity).apply {
                setImageResource(R.mipmap.ic_launcher)
                scaleType = ImageView.ScaleType.CENTER_CROP
                contentDescription = "SuperTech"
            }, FrameLayout.LayoutParams(dp(size), dp(size)))
        }
    }

    private fun trustStrip(): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(10), dp(10), dp(10), dp(10))
            background = rounded(line, Color.WHITE, dp(12).toFloat())
        }
        listOf(
            "Verified sellers" to R.drawable.ic_shield,
            "Trackable" to R.drawable.ic_truck,
            "Assisted pay" to R.drawable.ic_wallet
        ).forEachIndexed { i, (label, icon) ->
            val cell = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER
            }
            cell.addView(ImageView(this).apply {
                setImageResource(icon)
                setColorFilter(brand)
            }, LinearLayout.LayoutParams(dp(14), dp(14)).apply { rightMargin = dp(4) })
            cell.addView(text(label, 11f, ink, Typeface.BOLD))
            row.addView(cell, LinearLayout.LayoutParams(0, wc(), 1f))
            if (i < 2) {
                row.addView(View(this).apply { setBackgroundColor(line) }, LinearLayout.LayoutParams(dp(1), dp(24)))
            }
        }
        return row
    }

    private fun sectionLabel(title: String, subtitle: String): View {
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        col.addView(text(title, 16f, ink, Typeface.BOLD))
        col.addView(text(subtitle, 12f, muted).apply { setPadding(0, dp(2), 0, 0) })
        return col
    }

    private fun checkoutLine(line: Cart.Line): View {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val thumb = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setImageResource(android.R.drawable.ic_menu_gallery)
            setColorFilter(Color.WHITE)
            setBackgroundColor(softGreen)
            setPadding(if (line.heroImage.isBlank()) dp(12) else 0, if (line.heroImage.isBlank()) dp(12) else 0, if (line.heroImage.isBlank()) dp(12) else 0, if (line.heroImage.isBlank()) dp(12) else 0)
        }
        if (line.heroImage.isNotBlank()) loadImage(thumb, line.heroImage)
        row.addView(thumb, LinearLayout.LayoutParams(dp(64), dp(64)).apply { rightMargin = dp(12) })

        val copy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        copy.addView(text(line.name, 14f, ink, Typeface.BOLD).apply { maxLines = 2 })
        copy.addView(text("Qty ${line.qty} · RWF ${money.format(line.price)} each", 12f, muted).apply {
            setPadding(0, dp(3), 0, 0)
        })
        copy.addView(text("RWF ${money.format(line.price * line.qty)}", 14f, brand, Typeface.BOLD).apply {
            setPadding(0, dp(4), 0, 0)
        })
        row.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))
        return row
    }

    private fun choiceGroup(
        options: List<Pair<String, String>>,
        selected: String,
        onSelect: (String) -> Unit
    ): View {
        val wrap = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        var current = selected
        val chips = HashMap<String, TextView>()
        fun restyle() {
            chips.forEach { (key, view) ->
                val active = key == current
                view.setTextColor(if (active) Color.WHITE else brand)
                view.background = rounded(
                    if (active) brand else line,
                    if (active) brand else Color.WHITE,
                    dp(12).toFloat()
                )
                view.minimumHeight = dp(48)
            }
        }
        options.chunked(2).forEach { pair ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            pair.forEachIndexed { i, opt ->
                val chipView = text(opt.second, 14f, brand, Typeface.BOLD).apply {
                    gravity = Gravity.CENTER
                    setPadding(dp(12), dp(14), dp(12), dp(14))
                    minimumHeight = dp(48)
                    pressable()
                    setOnClickListener {
                        current = opt.first
                        onSelect(opt.first)
                        restyle()
                    }
                }
                chips[opt.first] = chipView
                val lp = LinearLayout.LayoutParams(0, wc(), 1f).apply {
                    leftMargin = if (i == 0) 0 else dp(6)
                    rightMargin = if (i == 0) dp(6) else 0
                    bottomMargin = dp(8)
                }
                row.addView(chipView, lp)
            }
            if (pair.size == 1) row.addView(View(this), LinearLayout.LayoutParams(0, wc(), 1f))
            wrap.addView(row, LinearLayout.LayoutParams(mp(), wc()))
        }
        restyle()
        return wrap
    }

    private fun place() {
        val name = nameField.text.toString().trim()
        val email = emailField.text.toString().trim()
        val phone = phoneField.text.toString().trim()
        val city = cityField.text.toString().trim()
        val address = addressField.text.toString().trim()
        val notes = notesField.text.toString().trim()

        if (name.isBlank() || email.isBlank() || phone.isBlank() || city.isBlank() || address.isBlank()) {
            showError("Please fill in name, email, phone, city and address.")
            return
        }
        setLoading(true)
        val items = JSONArray()
        Cart.lines.values.forEach { line ->
            items.put(JSONObject().put("productSlug", line.slug).put("quantity", line.qty))
        }
        val body = JSONObject()
            .put("items", items)
            .put("customerName", name)
            .put("customerEmail", email)
            .put("customerPhone", phone)
            .put("city", city)
            .put("deliveryAddress", address)
            .put("contactPreference", contactPref)
            .put("paymentPreference", paymentPref)
        if (notes.isNotBlank()) body.put("notes", notes)

        executor.execute {
            val result = Net.post("/api/order-requests", body)
            runOnUiThread {
                setLoading(false)
                when {
                    result.ok -> {
                        Cart.clear()
                        NotificationsStore.pushEvent(
                            this,
                            "Order request sent",
                            "Vendors will contact you to confirm delivery."
                        )
                        showSuccess()
                    }
                    result.code == 0 -> showError("No connection. Check your internet and try again.")
                    else -> showError(result.errorMessage("Could not place your order request."))
                }
            }
        }
    }

    private fun showSuccess() {
        val content = scaffold("Order placed", withBack = false, withFab = false)
        content.gravity = Gravity.CENTER_HORIZONTAL
        content.addView(
            logoBadge(72),
            LinearLayout.LayoutParams(dp(72), dp(72)).apply {
                gravity = Gravity.CENTER_HORIZONTAL
                bottomMargin = dp(16)
            }
        )
        val cardView = card()
        cardView.addView(text("✓ Request received", 22f, brand, Typeface.BOLD))
        cardView.addView(
            text(
                "Your order request has been sent. The vendor will contact you to confirm and arrange delivery.",
                14f,
                muted
            ).apply {
                setPadding(0, dp(10), 0, 0)
                setLineSpacing(0f, 1.25f)
            }
        )
        content.block(cardView, 16)
        animateContentIn(cardView)

        content.block(
            primaryButton("Track this order") {
                navigateForward(android.content.Intent(this, TrackOrderActivity::class.java))
                finish()
            }.apply { minimumHeight = dp(54) },
            10
        )
        content.block(
            secondaryButton("Back to marketplace") { navigateToMain() }.apply { minimumHeight = dp(52) },
            8
        )
    }

    private fun setLoading(loading: Boolean) {
        if (!::submit.isInitialized) return
        submit.isEnabled = !loading
        submit.text = if (loading) "Placing request…" else "Place order request"
        submit.alpha = if (loading) 0.65f else 1f
    }

    private fun showError(message: String) {
        errorText.text = message
        errorText.visibility = View.VISIBLE
        shake(errorText)
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
