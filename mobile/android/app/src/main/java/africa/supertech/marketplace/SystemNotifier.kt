package africa.supertech.marketplace

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

/**
 * Posts system tray notifications with sound + launcher badge count.
 */
object SystemNotifier {
    const val CHANNEL_ID = "supertech_alerts"
    private const val CHANNEL_NAME = "SuperTech alerts"
    private var notifIdSeq = 4000

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val mgr = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (mgr.getNotificationChannel(CHANNEL_ID) != null) return
        val sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val attrs = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_NOTIFICATION)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        val channel = NotificationChannel(
            CHANNEL_ID,
            CHANNEL_NAME,
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Orders, cart, and SuperTech updates"
            enableVibration(true)
            setShowBadge(true)
            setSound(sound, attrs)
        }
        mgr.createNotificationChannel(channel)
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

    fun show(
        context: Context,
        title: String,
        body: String,
        itemId: String = System.currentTimeMillis().toString(),
        playSound: Boolean = true
    ) {
        ensureChannel(context)
        if (!canPost(context)) return

        val open = Intent(context, NotificationsActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pi = PendingIntent.getActivity(
            context,
            itemId.hashCode(),
            open,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val unread = NotificationsStore.unreadCount().coerceAtLeast(1)
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_bell)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pi)
            .setNumber(unread)
            .setBadgeIconType(NotificationCompat.BADGE_ICON_SMALL)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
        if (playSound) {
            builder.setSound(sound)
            builder.setDefaults(NotificationCompat.DEFAULT_SOUND or NotificationCompat.DEFAULT_VIBRATE)
        }
        try {
            NotificationManagerCompat.from(context)
                .notify(itemId.hashCode() and 0x7fffffff, builder.build())
        } catch (_: SecurityException) {
            // Permission revoked mid-session
        }
    }

    fun updateBadgeOnly(context: Context) {
        ensureChannel(context)
        if (!canPost(context)) return
        val unread = NotificationsStore.unreadCount()
        if (unread <= 0) {
            NotificationManagerCompat.from(context).cancel(999001)
            return
        }
        val open = Intent(context, NotificationsActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pi = PendingIntent.getActivity(
            context,
            999001,
            open,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val n = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_bell)
            .setContentTitle("SuperTech")
            .setContentText("You have $unread unread notification${if (unread == 1) "" else "s"}")
            .setNumber(unread)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setContentIntent(pi)
            .setOngoing(false)
            .setAutoCancel(true)
            .build()
        try {
            NotificationManagerCompat.from(context).notify(999001, n)
        } catch (_: SecurityException) {
        }
    }
}
