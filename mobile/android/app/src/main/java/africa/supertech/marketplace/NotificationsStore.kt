package africa.supertech.marketplace

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Notifications: remote feed for admin/vendor (API) + local app events for everyone.
 */
object NotificationsStore {
    data class Item(
        val id: String,
        val title: String,
        val body: String,
        val kind: String,
        val createdAt: String,
        var read: Boolean,
        val refId: String = "",
        val imageUrl: String = ""
    )

    private const val PREFS = "supertech_notifications"
    private const val KEY_LOCAL = "local_items"
    private const val KEY_READ = "read_ids"

    private val memory = LinkedHashMap<String, Item>()
    @Volatile private var initialized = false

    fun init(context: Context) {
        if (initialized) return
        synchronized(this) {
            if (initialized) return
            val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val readIds = prefs.getStringSet(KEY_READ, emptySet()) ?: emptySet()
            val raw = prefs.getString(KEY_LOCAL, null)
            if (raw != null) {
                try {
                    val arr = JSONArray(raw)
                    for (i in 0 until arr.length()) {
                        val o = arr.optJSONObject(i) ?: continue
                        val id = o.optString("id")
                        if (id.isBlank()) continue
                        memory[id] = Item(
                            id = id,
                            title = o.optString("title"),
                            body = o.optString("body"),
                            kind = o.optString("kind"),
                            createdAt = o.optString("createdAt"),
                            read = o.optBoolean("read") || readIds.contains(id),
                            refId = o.optString("refId"),
                            imageUrl = o.optString("imageUrl")
                        )
                    }
                } catch (_: Exception) {
                }
            }
            if (memory.isEmpty()) {
                seedLocalIntoMemory()
                persist(context)
                // One system notification for welcome so tray + badge work on first install
                memory["local-welcome"]?.let { welcome ->
                    if (!welcome.read) {
                        SystemNotifier.show(
                            context.applicationContext,
                            welcome.title,
                            welcome.body,
                            welcome.id,
                            playSound = true
                        )
                    }
                }
                SystemNotifier.updateBadgeOnly(context.applicationContext)
            }
            initialized = true
        }
    }

    private fun seedLocalIntoMemory() {
        val now = System.currentTimeMillis()
        val fmt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        fun ago(h: Int) = fmt.format(Date(now - h * 3_600_000L))
        memory["local-welcome"] = Item(
            "local-welcome",
            "Welcome to SuperTech",
            "Browse verified products, save favourites, and track requests.",
            "system",
            ago(2),
            false
        )
        memory["local-tip"] = Item(
            "local-tip",
            "Tip: Save products",
            "Tap the heart on any card to save items for later.",
            "system",
            ago(5),
            false
        )
    }

    fun pushLocal(
        context: Context,
        item: Item,
        persistNow: Boolean = true,
        systemNotify: Boolean = true
    ) {
        init(context)
        memory[item.id] = item
        if (persistNow) persist(context)
        if (systemNotify && !item.read) {
            // Always alert the phone tray with SuperTech chime; in-app logo badges stay off while foreground.
            SystemNotifier.show(
                context.applicationContext,
                item.title,
                item.body,
                item.id,
                playSound = true,
                imageUrl = item.imageUrl.takeIf { it.isNotBlank() }
            )
            if (!AppLifecycle.isForeground) {
                SystemNotifier.updateBadgeOnly(context.applicationContext)
            }
        }
    }

    fun pushEvent(
        context: Context,
        title: String,
        body: String,
        kind: String = "app",
        imageUrl: String = ""
    ) {
        val id = "evt-${System.currentTimeMillis()}"
        val iso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
        pushLocal(
            context,
            Item(id, title, body, kind, iso, false, imageUrl = imageUrl),
            systemNotify = true
        )
    }

    fun all(): List<Item> = memory.values.sortedByDescending { it.createdAt }

    fun unreadCount(): Int = memory.values.count { !it.read }

    fun markRead(context: Context, id: String) {
        init(context)
        memory[id]?.read = true
        persist(context)
        SystemNotifier.updateBadgeOnly(context)
    }

    fun markAllRead(context: Context) {
        init(context)
        memory.values.forEach { it.read = true }
        persist(context)
        SystemNotifier.updateBadgeOnly(context)
        try {
            androidx.core.app.NotificationManagerCompat.from(context).cancelAll()
        } catch (_: Exception) {
        }
    }

    fun mergeRemote(context: Context, remote: List<Item>) {
        init(context)
        remote.forEach { memory[it.id] = it }
        persist(context)
    }

    private fun persist(context: Context) {
        val arr = JSONArray()
        memory.values.forEach { item ->
            arr.put(
                JSONObject()
                    .put("id", item.id)
                    .put("title", item.title)
                    .put("body", item.body)
                    .put("kind", item.kind)
                    .put("createdAt", item.createdAt)
                    .put("read", item.read)
                    .put("refId", item.refId)
                    .put("imageUrl", item.imageUrl)
            )
        }
        val readIds = memory.values.filter { it.read }.map { it.id }.toSet()
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_LOCAL, arr.toString())
            .putStringSet(KEY_READ, readIds)
            .apply()
    }

    /** Fetch remote notifications when session is admin/vendor. */
    fun refreshRemote(context: Context) {
        val session = Net.session() ?: return
        if (session.role != "admin" && session.role != "vendor") return
        try {
            val result = Net.get("/api/notifications")
            if (!result.ok) return
            val arr = result.json().optJSONArray("notifications") ?: return
            val list = ArrayList<Item>()
            for (i in 0 until arr.length()) {
                val o = arr.optJSONObject(i) ?: continue
                val id = o.optString("notificationId").ifBlank { o.optString("id") }
                if (id.isBlank()) continue
                list.add(
                    Item(
                        id = id,
                        title = o.optString("title"),
                        body = o.optString("body"),
                        kind = o.optString("kind"),
                        createdAt = o.optString("createdAt"),
                        read = o.optBoolean("read"),
                        refId = o.optString("refId")
                    )
                )
            }
            mergeRemote(context, list)
        } catch (_: Exception) {
        }
    }
}
