package africa.supertech.marketplace

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.Shader
import android.provider.Settings
import android.util.AttributeSet
import android.view.View
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

/**
 * Ambient app canvas — atmosphere under content (website SiteCanvas parity).
 * Zone + optional scroll-linked opacity. Draw cost: base fill + 2 radials + tiled grain.
 */
class AppCanvasView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    enum class Zone {
        STOREFRONT,
        AUTH,
        APP,
        DASHBOARD
    }

    private data class Levels(
        val grain: Float,
        val glowBrand: Float,
        val glowCool: Float,
        val vignette: Float
    )

    private val zoneBase = mapOf(
        Zone.STOREFRONT to Levels(0.04f, 0.12f, 0.04f, 0.025f),
        Zone.AUTH to Levels(0.03f, 0.10f, 0.08f, 0.02f),
        Zone.APP to Levels(0.018f, 0.04f, 0.02f, 0.01f),
        Zone.DASHBOARD to Levels(0.014f, 0.02f, 0.015f, 0.008f)
    )

    private val storefrontScrolled = Levels(0.018f, 0.03f, 0.02f, 0.01f)

    var zone: Zone = Zone.STOREFRONT
        set(value) {
            if (field != value) {
                field = value
                invalidate()
            }
        }

    /** 0 = top of storefront, 1 = fully scrolled / dimmed. */
    var scrollT: Float = 0f
        set(value) {
            val next = value.coerceIn(0f, 1f)
            if (kotlin.math.abs(field - next) > 0.008f) {
                field = next
                invalidate()
            }
        }

    private val basePaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val grainPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
    private var grainTile: Bitmap? = null

    private val canvasBase = Color.rgb(245, 244, 240)
    private val canvasBaseDashboard = Color.rgb(243, 243, 241)
    private val brandOrange = Color.rgb(232, 119, 10)
    private val coolTeal = Color.rgb(28, 84, 104)
    private val vignetteDark = Color.rgb(24, 24, 26)

    init {
        setWillNotDraw(false)
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
        isClickable = false
        isFocusable = false
    }

    private fun reduceMotion(): Boolean {
        return try {
            Settings.Global.getFloat(
                context.contentResolver,
                Settings.Global.ANIMATOR_DURATION_SCALE,
                1f
            ) == 0f
        } catch (_: Exception) {
            false
        }
    }

    private fun levels(): Levels {
        val base = zoneBase[zone] ?: zoneBase.getValue(Zone.APP)
        if (zone != Zone.STOREFRONT || reduceMotion() || scrollT <= 0.001f) return base
        val t = scrollT
        val s = storefrontScrolled
        return Levels(
            grain = lerp(base.grain, s.grain, t),
            glowBrand = lerp(base.glowBrand, s.glowBrand, t),
            glowCool = lerp(base.glowCool, s.glowCool, t),
            vignette = lerp(base.vignette, s.vignette, t)
        )
    }

    private fun lerp(a: Float, b: Float, t: Float) = a + (b - a) * t

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if (w > 0 && h > 0 && grainTile == null) {
            grainTile = makeGrainTile(128)
        }
    }

    override fun onDraw(canvas: Canvas) {
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0f || h <= 0f) return

        val lv = levels()
        val base = if (zone == Zone.DASHBOARD) canvasBaseDashboard else canvasBase
        basePaint.color = base
        canvas.drawRect(0f, 0f, w, h, basePaint)

        // Brand glow — top-start
        drawRadial(
            canvas,
            cx = w * 0.12f,
            cy = h * 0.08f,
            radius = max(w, h) * 0.72f,
            color = brandOrange,
            alpha = lv.glowBrand
        )

        // Cool glow — bottom-end
        drawRadial(
            canvas,
            cx = w * 0.95f,
            cy = h * 0.92f,
            radius = max(w, h) * 0.55f,
            color = coolTeal,
            alpha = lv.glowCool
        )

        // Grain
        val tile = grainTile
        if (tile != null && lv.grain > 0.001f) {
            grainPaint.alpha = (lv.grain * 255f).toInt().coerceIn(0, 255)
            var y = 0f
            while (y < h) {
                var x = 0f
                while (x < w) {
                    canvas.drawBitmap(tile, x, y, grainPaint)
                    x += tile.width
                }
                y += tile.height
            }
        }

        // Soft vignette
        if (lv.vignette > 0.001f) {
            drawRadial(
                canvas,
                cx = w * 0.5f,
                cy = h * 0.45f,
                radius = max(w, h) * 0.95f,
                color = vignetteDark,
                alpha = lv.vignette,
                reverse = true
            )
        }
    }

    private fun drawRadial(
        canvas: Canvas,
        cx: Float,
        cy: Float,
        radius: Float,
        color: Int,
        alpha: Float,
        reverse: Boolean = false
    ) {
        val a = (alpha.coerceIn(0f, 1f) * 255f).toInt().coerceIn(0, 255)
        if (a <= 0) return
        val solid = Color.argb(a, Color.red(color), Color.green(color), Color.blue(color))
        val transparent = Color.argb(0, Color.red(color), Color.green(color), Color.blue(color))
        val colors = if (reverse) {
            intArrayOf(transparent, solid)
        } else {
            intArrayOf(solid, transparent)
        }
        val stops = if (reverse) floatArrayOf(0.4f, 1f) else floatArrayOf(0f, 1f)
        glowPaint.shader = RadialGradient(cx, cy, max(1f, radius), colors, stops, Shader.TileMode.CLAMP)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), glowPaint)
        glowPaint.shader = null
    }

    private fun makeGrainTile(size: Int): Bitmap {
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val rnd = Random(42)
        for (y in 0 until size) {
            for (x in 0 until size) {
                val n = rnd.nextInt(40, 90)
                // Sparse speckles only
                if (rnd.nextFloat() < 0.12f) {
                    bmp.setPixel(x, y, Color.argb(n, 40, 40, 40))
                } else {
                    bmp.setPixel(x, y, Color.TRANSPARENT)
                }
            }
        }
        return bmp
    }

    companion object {
        fun scrollProgress(scrollY: Int, firstScreenPx: Int): Float {
            val span = max(1, firstScreenPx)
            return min(1f, max(0f, scrollY.toFloat() / span))
        }
    }
}
