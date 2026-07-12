package africa.supertech.marketplace

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.HashSet
import java.util.Locale

/**
 * Notifications: remote feed by role (admin / vendor / customer) + local app events.
 *
 * Read state is sticky: once marked read locally (or on the server), remote refresh
 * must not flip items back to unread — that was the mark-all-read bug.
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
        val imageUrl: String = "",
        val audience: String = "" // admin | vendor | customer | local
    )

    private const val PREFS = "supertech_notifications"
    private const val KEY_LOCAL = "local_items"
    private const val KEY_READ = "read_ids"

    private val memory = LinkedHashMap<String, Item>()
    private val readIds = HashSet<String>()
    @Volatile private var initialized = false
    @Volatile private var refreshGeneration = 0

    fun init(context: Context) {
        if (initialized) return
        synchronized(this) {
            if (initialized) return
            val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            // Copy the set — SharedPreferences StringSet is mutable under the hood and buggy if reused
            readIds.clear()
            readIds.addAll(prefs.getStringSet(KEY_READ, emptySet()) ?: emptySet())
            val raw = prefs.getString(KEY_LOCAL, null)
            if (raw != null) {
                try {
                    val arr = JSONArray(raw)
                    for (i in 0 until arr.length()) {
                        val o = arr.optJSONObject(i) ?: continue
                        val id = o.optString("id")
                        if (id.isBlank()) continue
                        val read = o.optBoolean("read") || readIds.contains(id)
                        if (read) readIds.add(id)
                        memory[id] = Item(
                            id = id,
                            title = o.optString("title"),
                            body = o.optString("body"),
                            kind = o.optString("kind"),
                            createdAt = o.optString("createdAt"),
                            read = read,
                            refId = o.optString("refId"),
                            imageUrl = o.optString("imageUrl"),
                            audience = o.optString("audience")
                        )
                    }
                } catch (_: Exception) {
                }
            }
            if (memory.isEmpty()) {
                seedRoleLocal(context)
                persist(context)
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

    /** Role-aware welcome / tips when the feed is empty. */
    private fun seedRoleLocal(context: Context) {
        val session = Net.session()
        val role = session?.role ?: "guest"
        val now = System.currentTimeMillis()
        val fmt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        fun ago(h: Int) = fmt.format(Date(now - h * 3_600_000L))

        memory["local-welcome"] = Item(
            "local-welcome",
            when (role) {
                "admin" -> "Admin control center"
                "vendor" -> "Your store feed"
                else -> "Welcome to SuperTech"
            },
            when (role) {
                "admin" -> "New orders, product moderation, and payouts show here."
                "vendor" -> "Orders for your store, approvals, and payouts land here."
                else -> "Browse verified products, save favourites, and track requests."
            },
            "system",
            ago(1),
            false,
            audience = role
        )
        memory["local-tip"] = Item(
            "local-tip",
            when (role) {
                "admin" -> "Tip: Moderation"
                "vendor" -> "Tip: Keep stock fresh"
                else -> "Tip: Save products"
            },
            when (role) {
                "admin" -> "Open Products → pending to approve or reject listings."
                "vendor" -> "Update prices and stock so shoppers see accurate availability."
                else -> "Tap the heart on any card to save items for later."
            },
            "system",
            ago(4),
            false,
            audience = role
        )
        if (role == "admin") {
            memory["local-admin-orders"] = Item(
                "local-admin-orders",
                "Watch new order requests",
                "When shoppers check out, you and the matching vendors are notified.",
                "order_received",
                ago(2),
                false,
                audience = "admin"
            )
        }
        if (role == "vendor") {
            memory["local-vendor-orders"] = Item(
                "local-vendor-orders",
                "Orders for your products",
                "You only see requests that include your listings — not other vendors’.",
                "order_received",
                ago(2),
                false,
                audience = "vendor"
            )
        }
    }

    fun pushLocal(
        context: Context,
        item: Item,
        persistNow: Boolean = true,
        systemNotify: Boolean = true
    ) {
        init(context)
        val merged = if (readIds.contains(item.id) || item.read) item.copy(read = true) else item
        if (merged.read) readIds.add(merged.id)
        memory[merged.id] = merged
        if (persistNow) persist(context)
        if (systemNotify && !merged.read) {
            SystemNotifier.show(
                context.applicationContext,
                merged.title,
                merged.body,
                merged.id,
                playSound = true,
                imageUrl = merged.imageUrl.takeIf { it.isNotBlank() }
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
            Item(id, title, body, kind, iso, false, imageUrl = imageUrl, audience = "local"),
            systemNotify = true
        )
    }

    fun all(): List<Item> = synchronized(this) {
        memory.values.sortedByDescending { it.createdAt }
    }

    fun unreadCount(): Int = synchronized(this) {
        memory.values.count { !it.read }
    }

    fun markRead(context: Context, id: String) {
        init(context)
        synchronized(this) {
            memory[id]?.let {
                it.read = true
                readIds.add(id)
            }
        }
        persist(context)
        SystemNotifier.updateBadgeOnly(context)
        // Sync remote id if logged in (fire-and-forget from caller preferred)
        if (!id.startsWith("local-") && !id.startsWith("evt-") && Net.isLoggedIn()) {
            try {
                Net.patch(
                    "/api/notifications",
                    JSONObject().put("notificationId", id)
                )
            } catch (_: Exception) {
            }
        }
    }

    /**
     * Mark every item read locally + cancel tray, then PATCH server for admin/vendor/customer.
     * Returns true when local state updated.
     */
    fun markAllRead(context: Context): Boolean {
        init(context)
        synchronized(this) {
            memory.values.forEach {
                it.read = true
                readIds.add(it.id)
            }
        }
        persist(context)
        try {
            androidx.core.app.NotificationManagerCompat.from(context).cancelAll()
        } catch (_: Exception) {
        }
        SystemNotifier.clearLauncherBadge(context)
        SystemNotifier.updateBadgeOnly(context)

        // Server sync — must not re-run on UI thread if called from UI; callers use executor
        if (Net.isLoggedIn()) {
            try {
                Net.patch(
                    "/api/notifications",
                    JSONObject().put("markAll", true)
                )
            } catch (_: Exception) {
            }
        }
        return true
    }

    fun mergeRemote(context: Context, remote: List<Item>) {
        init(context)
        synchronized(this) {
            remote.forEach { incoming ->
                // Sticky read: never re-open something the user already marked read
                val alreadyRead = readIds.contains(incoming.id) || memory[incoming.id]?.read == true
                val read = alreadyRead || incoming.read
                if (read) readIds.add(incoming.id)
                memory[incoming.id] = incoming.copy(read = read)
            }
        }
        persist(context)
    }

    private fun persist(context: Context) {
        val arr = JSONArray()
        val snapshot: List<Item>
        val ids: Set<String>
        synchronized(this) {
            snapshot = memory.values.toList()
            ids = HashSet(readIds)
        }
        snapshot.forEach { item ->
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
                    .put("audience", item.audience)
            )
        }
        // commit() so mark-all survives process death / race with refresh
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_LOCAL, arr.toString())
            .putStringSet(KEY_READ, HashSet(ids))
            .commit()
    }

    /**
     * Fetch role-scoped remote notifications for signed-in admin, vendor, or customer.
     * Safe to call on a background thread. Generation token drops stale responses after mark-all.
     */
    fun refreshRemote(context: Context): Boolean {
        init(context)
        val session = Net.session() ?: return false
        if (session.role !in setOf("admin", "vendor", "customer")) return false
        val gen = ++refreshGeneration
        try {
            val result = Net.get("/api/notifications")
            if (!result.ok) return false
            // Stale after a newer refresh or mark-all bumped generation via cancelRefresh
            if (gen != refreshGeneration) return false
            val arr = result.json().optJSONArray("notifications") ?: return false
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
                        read = o.optBoolean("read") || readIds.contains(id),
                        refId = o.optString("refId"),
                        imageUrl = o.optString("imageUrl"),
                        audience = session.role
                    )
                )
            }
            if (gen != refreshGeneration) return false
            mergeRemote(context, list)
            return true
        } catch (_: Exception) {
            return false
        }
    }

    /** Call before mark-all so an in-flight refresh cannot re-apply unread server state. */
    fun invalidateRefresh() {
        refreshGeneration++
    }
}
