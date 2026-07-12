package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import java.util.concurrent.Executors

/** In-app notification feed (local + remote for admin/vendor). */
class NotificationsActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.APP
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var body: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NotificationsStore.init(this)
        val content = scaffold("Notifications", withBack = true)
        content.block(
            text("Orders, product updates, and SuperTech tips.", 13f, muted),
            8
        )
        content.block(
            secondaryButton("Mark all read") {
                NotificationsStore.markAllRead(this)
                renderList()
                toast("All caught up")
            }.apply { minimumHeight = dp(48) },
            12
        )
        body = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        content.block(body, 0)
        body.addView(text("Loading…", 14f, muted))
        executor.execute {
            NotificationsStore.refreshRemote(this)
            runOnUiThread { renderList() }
        }
    }

    private fun renderList() {
        body.removeAllViews()
        val items = NotificationsStore.all()
        if (items.isEmpty()) {
            body.addView(
                emptyState(
                    "No notifications yet",
                    "When you place orders or manage your store, updates show up here.",
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
        }
        card.addView(top)
        card.addView(text(item.body, 13f, muted).apply {
            setPadding(0, dp(6), 0, 0)
            setLineSpacing(0f, 1.2f)
        })
        val whenLabel = item.createdAt.take(16).replace('T', ' ')
        card.addView(text(whenLabel, 11f, muted).apply { setPadding(0, dp(8), 0, 0) })
        card.pressable()
        card.setOnClickListener {
            NotificationsStore.markRead(this, item.id)
            renderList()
        }
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(card, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })
        }
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
