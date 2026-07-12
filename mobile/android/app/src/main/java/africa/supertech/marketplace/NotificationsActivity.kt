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
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        // Logo / product image thumb
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
        }
        copy.addView(top)
        copy.addView(text(item.body, 13f, muted).apply {
            setPadding(0, dp(4), 0, 0)
            setLineSpacing(0f, 1.2f)
            maxLines = 3
        })
        val whenLabel = item.createdAt.take(16).replace('T', ' ')
        copy.addView(text(whenLabel, 11f, muted).apply { setPadding(0, dp(6), 0, 0) })
        row.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))
        card.addView(row)
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
