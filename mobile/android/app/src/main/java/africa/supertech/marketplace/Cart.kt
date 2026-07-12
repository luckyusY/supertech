package africa.supertech.marketplace

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/** App-wide cart — persisted so reminders and restarts keep items. */
object Cart {
    data class Line(
        val slug: String,
        val name: String,
        val price: Double,
        var qty: Int,
        val heroImage: String = ""
    )

    private const val PREFS = "supertech_cart"
    private const val KEY = "lines"

    val lines = LinkedHashMap<String, Line>()
    @Volatile private var appContext: Context? = null
    private val listeners = java.util.concurrent.CopyOnWriteArrayList<() -> Unit>()

    fun init(context: Context) {
        if (appContext != null) return
        appContext = context.applicationContext
        load()
    }

    fun addListener(listener: () -> Unit) {
        listeners.add(listener)
    }

    fun removeListener(listener: () -> Unit) {
        listeners.remove(listener)
    }

    private fun emit() {
        listeners.forEach {
            try {
                it()
            } catch (_: Exception) {
            }
        }
    }

    fun add(slug: String, name: String, price: Double, qty: Int = 1, heroImage: String = "") {
        val existing = lines[slug]
        if (existing != null) {
            existing.qty += qty
        } else {
            lines[slug] = Line(slug, name, price, qty, heroImage)
        }
        persist()
        emit()
        appContext?.let { CartReminders.schedule(it) }
    }

    fun changeQty(slug: String, delta: Int) {
        val line = lines[slug] ?: return
        line.qty += delta
        if (line.qty <= 0) lines.remove(slug)
        persist()
        emit()
        appContext?.let {
            if (isEmpty()) CartReminders.cancel(it) else CartReminders.schedule(it)
        }
    }

    fun remove(slug: String) {
        lines.remove(slug)
        persist()
        emit()
        appContext?.let {
            if (isEmpty()) CartReminders.cancel(it) else CartReminders.schedule(it)
        }
    }

    fun count(): Int = lines.values.sumOf { it.qty }

    fun total(): Double = lines.values.sumOf { it.price * it.qty }

    fun clear() {
        lines.clear()
        persist()
        emit()
        appContext?.let { CartReminders.cancel(it) }
    }

    fun isEmpty(): Boolean = lines.isEmpty()

    fun snapshot(): List<Line> = lines.values.toList()

    private fun load() {
        val ctx = appContext ?: return
        val raw = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null) ?: return
        try {
            val arr = JSONArray(raw)
            lines.clear()
            for (i in 0 until arr.length()) {
                val o = arr.optJSONObject(i) ?: continue
                val slug = o.optString("slug")
                if (slug.isBlank()) continue
                lines[slug] = Line(
                    slug = slug,
                    name = o.optString("name"),
                    price = o.optDouble("price"),
                    qty = o.optInt("qty", 1).coerceAtLeast(1),
                    heroImage = o.optString("heroImage")
                )
            }
        } catch (_: Exception) {
        }
    }

    private fun persist() {
        val ctx = appContext ?: return
        val arr = JSONArray()
        lines.values.forEach { line ->
            arr.put(
                JSONObject()
                    .put("slug", line.slug)
                    .put("name", line.name)
                    .put("price", line.price)
                    .put("qty", line.qty)
                    .put("heroImage", line.heroImage)
            )
        }
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY, arr.toString())
            .apply()
    }
}
