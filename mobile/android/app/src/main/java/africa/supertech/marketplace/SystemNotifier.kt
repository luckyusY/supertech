package africa.supertech.marketplace

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import java.util.concurrent.Executors

/**
 * System tray notifications with SuperTech logo, optional product image,
 * unique chime, vibration, and launcher badge count (background only).
 */
object SystemNotifier {
    /** Bump channel id when sound/settings change (Android freezes channel after create). */
    const val CHANNEL_ID = "supertech_alerts_v2"
    private const val CHANNEL_NAME = "SuperTech alerts"
    private const val BADGE_NOTIFY_ID = 999001

    private val io = Executors.newSingleThreadExecutor()
    private val main = Handler(Looper.getMainLooper())

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val mgr = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        // Remove legacy silent-ish channel if present
        try {
            mgr.deleteNotificationChannel("supertech_alerts")
        } catch (_: Exception) {
        }
        if (mgr.getNotificationChannel(CHANNEL_ID) != null) return
        val sound = chimeUri(context)
        val attrs = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        val channel = NotificationChannel(
            CHANNEL_ID,
            CHANNEL_NAME,
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Orders, cart, and SuperTech updates with SuperTech chime"
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 80, 60, 80)
            setShowBadge(true)
            setSound(sound, attrs)
        }
        mgr.createNotificationChannel(channel)
    }

    private fun chimeUri(context: Context): Uri {
        // Unique SuperTech three-note chime packaged in res/raw
        return Uri.parse("android.resource://${context.packageName}/${R.raw.supertech_chime}")
    }

    fun canPost(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= 33) {
            return ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        }
        return NotificationManagerCompat.from(context).areNotificationsEnabled()
    }

    /**
     * Post a tray notification. Loads product image off the main thread when [imageUrl] is set.
     * Large icon = SuperTech logo (always); BigPicture = product/store image when available.
     */
    fun show(
        context: Context,
        title: String,
        body: String,
        itemId: String = System.currentTimeMillis().toString(),
        playSound: Boolean = true,
        imageUrl: String? = null
    ) {
        val app = context.applicationContext
        ensureChannel(app)
        if (!canPost(app)) return

        if (imageUrl.isNullOrBlank()) {
            postNow(app, title, body, itemId, playSound, logo = logoBitmap(app), product = null)
            return
        }
        io.execute {
            val product = loadRemoteBitmap(imageUrl)
            val logo = logoBitmap(app)
            main.post {
                postNow(app, title, body, itemId, playSound, logo = logo, product = product)
            }
        }
    }

    private fun postNow(
        context: Context,
        title: String,
        body: String,
        itemId: String,
        playSound: Boolean,
        logo: Bitmap?,
        product: Bitmap?
    ) {
        val open = Intent(context, NotificationsActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pi = PendingIntent.getActivity(
            context,
            itemId.hashCode(),
            open,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val unread = NotificationsStore.unreadCount().coerceAtLeast(1)
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_bell)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pi)
            .setNumber(unread)
            .setBadgeIconType(NotificationCompat.BADGE_ICON_SMALL)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setColor(0xFFE8770A.toInt())
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

        // Always show SuperTech logo as large icon when no product art
        if (logo != null) {
            builder.setLargeIcon(logo)
        }

        if (product != null) {
            // Expanded tray: product photo + brand logo collapsed large icon
            builder.setStyle(
                NotificationCompat.BigPictureStyle()
                    .bigPicture(product)
                    .bigLargeIcon(null as Bitmap?)
                    .setSummaryText(body)
                    .setBigContentTitle(title)
            )
            builder.setLargeIcon(product)
        } else {
            builder.setStyle(NotificationCompat.BigTextStyle().bigText(body))
        }

        if (playSound) {
            builder.setSound(chimeUri(context))
            builder.setVibrate(longArrayOf(0, 80, 60, 80))
        } else {
            builder.setSilent(true)
        }
        try {
            NotificationManagerCompat.from(context)
                .notify(itemId.hashCode() and 0x7fffffff, builder.build())
        } catch (_: SecurityException) {
        }
    }

    /**
     * Silent launcher badge-holder — only while app is in the background.
     * In-app, the logo stays clean; unread count lives on the header bell.
     */
    fun updateBadgeOnly(context: Context) {
        ensureChannel(context)
        if (!canPost(context)) return
        val unread = NotificationsStore.unreadCount()
        if (unread <= 0 || AppLifecycle.isForeground) {
            clearLauncherBadge(context)
            return
        }
        val open = Intent(context, NotificationsActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pi = PendingIntent.getActivity(
            context,
            BADGE_NOTIFY_ID,
            open,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val logo = logoBitmap(context)
        val n = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_bell)
            .setContentTitle("SuperTech")
            .setContentText("You have $unread unread notification${if (unread == 1) "" else "s"}")
            .setNumber(unread)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setColor(0xFFE8770A.toInt())
        if (logo != null) n.setLargeIcon(logo)
        try {
            NotificationManagerCompat.from(context).notify(BADGE_NOTIFY_ID, n.build())
        } catch (_: SecurityException) {
        }
    }

    /** Drop silent badge-holder when user opens the app (logo / launcher stays clean). */
    fun clearLauncherBadge(context: Context) {
        try {
            NotificationManagerCompat.from(context).cancel(BADGE_NOTIFY_ID)
        } catch (_: Exception) {
        }
    }

    private fun logoBitmap(context: Context): Bitmap? {
        return try {
            BitmapFactory.decodeResource(context.resources, R.mipmap.ic_launcher)
        } catch (_: Exception) {
            null
        }
    }

    private fun loadRemoteBitmap(url: String?): Bitmap? {
        if (url.isNullOrBlank()) return null
        return try {
            val full = when {
                url.startsWith("http", true) -> url
                url.startsWith("/") -> "${Net.BASE}$url"
                else -> "${Net.BASE}/$url"
            }
            val conn = java.net.URL(full).openConnection() as java.net.HttpURLConnection
            conn.connectTimeout = 4000
            conn.readTimeout = 4000
            conn.instanceFollowRedirects = true
            conn.inputStream.use { stream ->
                val raw = BitmapFactory.decodeStream(stream) ?: return null
                // Keep notification bitmaps modest for tray memory
                val max = 1024
                if (raw.width <= max && raw.height <= max) return raw
                val scale = max.toFloat() / maxOf(raw.width, raw.height)
                val w = (raw.width * scale).toInt().coerceAtLeast(1)
                val h = (raw.height * scale).toInt().coerceAtLeast(1)
                Bitmap.createScaledBitmap(raw, w, h, true).also {
                    if (it !== raw) raw.recycle()
                }
            }
        } catch (_: Exception) {
            null
        }
    }
}
