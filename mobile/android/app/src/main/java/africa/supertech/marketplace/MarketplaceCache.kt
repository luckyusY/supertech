package africa.supertech.marketplace

import android.content.Context
import org.json.JSONObject

/**
 * Stale-while-revalidate cache for marketplace JSON so Home can paint instantly
 * on return visits while a network refresh runs.
 */
object MarketplaceCache {
    private const val PREFS = "supertech_marketplace_cache"
    private const val KEY_JSON = "payload"
    private const val KEY_AT = "saved_at"

    @Volatile
    private var memory: JSONObject? = null

    @Volatile
    private var savedAt: Long = 0L

    fun init(context: Context) {
        if (memory != null) return
        val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val raw = prefs.getString(KEY_JSON, null) ?: return
        try {
            memory = JSONObject(raw)
            savedAt = prefs.getLong(KEY_AT, 0L)
        } catch (_: Exception) {
            memory = null
        }
    }

    fun get(): JSONObject? = memory

    fun ageMs(): Long = if (savedAt == 0L) Long.MAX_VALUE else System.currentTimeMillis() - savedAt

    fun put(context: Context, json: JSONObject) {
        memory = json
        savedAt = System.currentTimeMillis()
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_JSON, json.toString())
            .putLong(KEY_AT, savedAt)
            .apply()
    }

    fun isFresh(maxAgeMs: Long = 5 * 60_000L): Boolean =
        memory != null && ageMs() <= maxAgeMs
}
