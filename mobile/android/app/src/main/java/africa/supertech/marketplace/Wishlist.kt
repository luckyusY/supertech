package africa.supertech.marketplace

import android.content.Context
import android.content.SharedPreferences

/** Local wishlist / save-for-later (Phase A). Survives restarts via SharedPreferences. */
object Wishlist {
    private const val PREFS = "supertech_wishlist"
    private const val KEY = "slugs"

    private var prefs: SharedPreferences? = null
    private val memory = LinkedHashSet<String>()

    fun init(context: Context) {
        if (prefs != null) return
        prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val raw = prefs?.getStringSet(KEY, emptySet()) ?: emptySet()
        memory.clear()
        memory.addAll(raw.filter { it.isNotBlank() })
    }

    fun isSaved(slug: String): Boolean {
        if (slug.isBlank()) return false
        return memory.contains(slug)
    }

    fun toggle(slug: String): Boolean {
        if (slug.isBlank()) return false
        val nowSaved = if (memory.contains(slug)) {
            memory.remove(slug)
            false
        } else {
            memory.add(slug)
            true
        }
        persist()
        return nowSaved
    }

    fun count(): Int = memory.size

    fun all(): List<String> = memory.toList()

    private fun persist() {
        prefs?.edit()?.putStringSet(KEY, HashSet(memory))?.apply()
    }
}
