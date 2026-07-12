package africa.supertech.marketplace

import android.graphics.Color

/** Shared product model for retail cards across Home, Shop, Stores, cart recs, vendor profile. */
data class CatalogProduct(
    val slug: String,
    val name: String,
    val category: String,
    val badge: String = "",
    val description: String = "",
    val price: Double,
    val compareAt: Double = 0.0,
    val rating: Double = 0.0,
    val reviewCount: Int = 0,
    val stockLabel: String = "",
    val accent: String = "#276076",
    val heroImage: String = "",
    val features: List<String> = emptyList(),
    val vendorSlug: String = "",
    val vendorName: String = "",
    val featured: Boolean = false
) {
    val color: Int
        get() = try {
            Color.parseColor(accent.ifBlank { "#276076" })
        } catch (_: Exception) {
            Color.rgb(39, 96, 118)
        }

    fun mode(): String {
        val c = category.lowercase()
        if (c.contains("car") || c.contains("motor")) return "motors"
        if (c.contains("apartment") || c.contains("land") || c.contains("commercial") || c.contains("property")) {
            return "property"
        }
        return "shop"
    }

    fun outOfStock(): Boolean {
        val v = stockLabel.trim().lowercase()
        return v.contains("out of stock") || v.contains("sold out") || v == "unavailable"
    }
}
