package africa.supertech.marketplace

import android.content.Context
import org.json.JSONObject
import java.io.File
import java.util.concurrent.atomic.AtomicReference

/**
 * Disk + memory cache for marketplace JSON so products still load on slow/offline
 * networks (stale-while-revalidate). Prefers a file under cacheDir (larger payloads)
 * over SharedPreferences size limits.
 */
object MarketplaceCache {
    private const val PREFS = "supertech_marketplace_cache"
    private const val KEY_AT = "saved_at"
    private const val FILE_NAME = "marketplace_payload.json"
    /** Soft fresh window — still serve after this, but refresh in background. */
    const val FRESH_MS = 10 * 60_000L
    /** Hard offline window — keep showing products for a day. */
    const val MAX_AGE_MS = 24 * 60 * 60_000L

    private val memory = AtomicReference<JSONObject?>(null)

    @Volatile
    private var savedAt: Long = 0L

    @Volatile
    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
        if (memory.get() != null) return
        val app = context.applicationContext
        // Prefer file cache
        val file = File(app.cacheDir, FILE_NAME)
        if (file.exists()) {
            try {
                val raw = file.readText()
                if (raw.isNotBlank()) {
                    memory.set(JSONObject(raw))
                    val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                    savedAt = prefs.getLong(KEY_AT, file.lastModified())
                    return
                }
            } catch (_: Exception) {
            }
        }
        // Legacy SharedPreferences fallback
        val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val raw = prefs.getString("payload", null) ?: return
        try {
            memory.set(JSONObject(raw))
            savedAt = prefs.getLong(KEY_AT, 0L)
            // Migrate to file
            try {
                file.writeText(raw)
            } catch (_: Exception) {
            }
        } catch (_: Exception) {
            memory.set(null)
        }
    }

    fun get(): JSONObject? = memory.get()

    fun productCount(): Int {
        val json = memory.get() ?: return 0
        return json.optJSONArray("products")?.length() ?: 0
    }

    fun ageMs(): Long = if (savedAt == 0L) Long.MAX_VALUE else System.currentTimeMillis() - savedAt

    fun put(context: Context, json: JSONObject) {
        // Don't clobber a good cache with empty product lists
        val incoming = json.optJSONArray("products")?.length() ?: 0
        val existing = productCount()
        if (incoming == 0 && existing > 0) return

        memory.set(json)
        savedAt = System.currentTimeMillis()
        val app = context.applicationContext
        appContext = app
        try {
            File(app.cacheDir, FILE_NAME).writeText(json.toString())
        } catch (_: Exception) {
        }
        app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putLong(KEY_AT, savedAt)
            .remove("payload") // prefer file
            .apply()
    }

    fun isFresh(maxAgeMs: Long = FRESH_MS): Boolean =
        memory.get() != null && ageMs() <= maxAgeMs

    fun isUsableOffline(): Boolean =
        memory.get() != null && productCount() > 0 && ageMs() <= MAX_AGE_MS

    /**
     * GET with retries for flaky mobile networks.
     * Returns first OK response body as JSONObject, or null.
     */
    fun fetchWithRetry(maxAttempts: Int = 3): JSONObject? {
        val delays = longArrayOf(0L, 800L, 1800L)
        var lastError: Exception? = null
        for (i in 0 until maxAttempts) {
            if (delays[i.coerceAtMost(delays.lastIndex)] > 0) {
                try {
                    Thread.sleep(delays[i.coerceAtMost(delays.lastIndex)])
                } catch (_: InterruptedException) {
                    Thread.currentThread().interrupt()
                    return null
                }
            }
            try {
                val result = Net.get("/api/mobile/marketplace")
                if (result.ok) {
                    val json = result.json()
                    val n = json.optJSONArray("products")?.length() ?: 0
                    if (n > 0 || i == maxAttempts - 1) return json
                }
            } catch (e: Exception) {
                lastError = e
            }
        }
        if (lastError != null) throw lastError
        return null
    }
}
