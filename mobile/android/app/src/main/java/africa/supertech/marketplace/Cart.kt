package africa.supertech.marketplace

/** App-wide cart shared between the marketplace, product detail and checkout. */
object Cart {
    data class Line(
        val slug: String,
        val name: String,
        val price: Double,
        var qty: Int,
        val heroImage: String = ""
    )

    val lines = LinkedHashMap<String, Line>()

    fun add(slug: String, name: String, price: Double, qty: Int = 1, heroImage: String = "") {
        val existing = lines[slug]
        if (existing != null) {
            existing.qty += qty
        } else {
            lines[slug] = Line(slug, name, price, qty, heroImage)
        }
    }

    fun changeQty(slug: String, delta: Int) {
        val line = lines[slug] ?: return
        line.qty += delta
        if (line.qty <= 0) lines.remove(slug)
    }

    fun remove(slug: String) {
        lines.remove(slug)
    }

    fun count(): Int = lines.values.sumOf { it.qty }

    fun total(): Double = lines.values.sumOf { it.price * it.qty }

    fun clear() = lines.clear()

    fun isEmpty(): Boolean = lines.isEmpty()
}
