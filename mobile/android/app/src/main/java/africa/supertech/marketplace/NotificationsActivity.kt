package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/** In-app notification feed — role-scoped remote + local events. */
class NotificationsActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.APP
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout
    private lateinit var subtitle: TextView
    private lateinit var markAllBtn: View
    private val markingAll = AtomicBoolean(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NotificationsStore.init(this)
        val role = Net.session()?.role ?: "guest"
        val content = scaffold("Notifications", withBack = true)

        subtitle = text(subtitleForRole(role), 13f, muted)
        content.block(subtitle, 8)

        markAllBtn = secondaryButton("Mark all as read") {
            markEverythingRead()
        }.apply { minimumHeight = dp(48) }
        content.block(markAllBtn, 12)

        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        body.addView(text("Loading…", 14f, muted))

        // Local list first so Mark all works even before network returns
        renderList()
        executor.execute {
            NotificationsStore.refreshRemote(this)
            runOnUiThread {
                if (!isFinishing) renderList()
            }
        }
    }

    private fun subtitleForRole(role: String): String = when (role) {
        "admin" -> "Platform orders, product moderation, and payouts."
        "vendor" -> "Orders and updates for your store only."
        "customer" -> "Your order updates and SuperTech tips."
        else -> "Local alerts. Sign in to sync admin, vendor, or account updates."
    }

    private fun markEverythingRead() {
        if (!markingAll.compareAndSet(false, true)) return
        // Invalidate any in-flight refresh so it cannot re-apply unread remote items
        NotificationsStore.invalidateRefresh()
        markAllBtn.isEnabled = false
        toast("Marking all as read…")
        executor.execute {
            // Local + server PATCH (sticky read ids prevent revert)
            NotificationsStore.markAllRead(this)
            // Refresh once more so server-confirmed read state is merged (sticky keeps them read)
            NotificationsStore.refreshRemote(this)
            runOnUiThread {
                markingAll.set(false)
                markAllBtn.isEnabled = true
                renderList()
                toast("All caught up")
            }
        }
    }

    private fun renderList() {
        if (!::body.isInitialized) return
        body.removeAllViews()
        val items = NotificationsStore.all()
        val unread = NotificationsStore.unreadCount()
        val role = Net.session()?.role ?: "guest"
        subtitle.text = buildString {
            append(subtitleForRole(role))
            if (unread > 0) append(" · $unread unread")
        }

        if (items.isEmpty()) {
            body.addView(
                emptyState(
                    "No notifications yet",
                    when (role) {
                        "admin" -> "New checkout requests and moderation events will show here."
                        "vendor" -> "When shoppers order your products, alerts appear here."
                        else -> "When you place orders or manage your store, updates show up here."
                    },
                    "Browse marketplace"
                ) { openMainTab("Home") }
            )
            return
        }
        items.forEachIndexed { i, item ->
            body.addView(notifCard(item).also { animateIn(it, i) })
        }
        animateContentIn(body)
    }

    private fun notifCard(item: NotificationsStore.Item): View {
        val card = card()
        if (!item.read) {
            card.background = rounded(brand, Color.WHITE, dp(16).toFloat())
        }
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val thumb = android.widget.ImageView(this).apply {
            scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
            setImageResource(R.mipmap.ic_launcher)
            background = rounded(line, softGreen, dp(12).toFloat())
        }
        row.addView(thumb, LinearLayout.LayoutParams(dp(48), dp(48)).apply { rightMargin = dp(12) })
        if (item.imageUrl.isNotBlank()) loadImage(thumb, item.imageUrl)

        val copy = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        val top = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        top.addView(
            text(item.title, 15f, ink, Typeface.BOLD),
            LinearLayout.LayoutParams(0, wc(), 1f)
        )
        if (!item.read) {
            top.addView(chip("New", softGreen, brand))
        } else {
            top.addView(chip("Read", line, muted))
        }
        copy.addView(top)

        // Kind / audience context chip row
        val meta = kindLabel(item.kind)
        if (meta.isNotBlank()) {
            copy.addView(
                text(meta, 11f, brand, Typeface.BOLD).apply {
                    setPadding(0, dp(4), 0, 0)
                }
            )
        }

        copy.addView(text(item.body, 13f, muted).apply {
            setPadding(0, dp(4), 0, 0)
            setLineSpacing(0f, 1.2f)
            maxLines = 4
        })
        val whenLabel = item.createdAt.take(16).replace('T', ' ')
        copy.addView(text(whenLabel, 11f, muted).apply { setPadding(0, dp(6), 0, 0) })
        row.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))
        card.addView(row)
        card.pressable()
        card.setOnClickListener {
            if (!item.read) {
                executor.execute {
                    NotificationsStore.markRead(this, item.id)
                    runOnUiThread { if (!isFinishing) renderList() }
                }
            }
        }
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(card, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })
        }
    }

    private fun kindLabel(kind: String): String = when (kind) {
        "order_received" -> "Order"
        "order_confirmed" -> "Order update"
        "order_shipped" -> "Shipping"
        "product_approved" -> "Product approved"
        "product_rejected" -> "Product needs changes"
        "payout_scheduled", "payout_sent" -> "Payout"
        "review_received" -> "Review"
        "cart" -> "Cart"
        "order" -> "Order"
        "system", "app" -> ""
        else -> kind.replace('_', ' ').replaceFirstChar { it.uppercase() }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
