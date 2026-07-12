package africa.supertech.marketplace

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/**
 * Gentle cart reminders when the shopper leaves items without checking out.
 * Uses inexact alarms (battery-friendly). Cancelled when cart is emptied.
 */
object CartReminders {
    private const val REQ = 71001
    private const val PREFS = "supertech_cart_reminders"
    private const val KEY_LAST = "last_fired_at"
    /** First nudge ~45 minutes after last cart change. */
    private const val DELAY_MS = 45 * 60_000L
    /** Don't spam more than once per 12 hours. */
    private const val COOLDOWN_MS = 12 * 60 * 60_000L

    fun schedule(context: Context) {
        val app = context.applicationContext
        Cart.init(app)
        if (Cart.isEmpty()) {
            cancel(app)
            return
        }
        val am = app.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pi = pending(app)
        val triggerAt = System.currentTimeMillis() + DELAY_MS
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi)
            } else {
                am.set(AlarmManager.RTC_WAKEUP, triggerAt, pi)
            }
        } catch (_: Exception) {
            try {
                am.set(AlarmManager.RTC_WAKEUP, triggerAt, pi)
            } catch (_: Exception) {
            }
        }
    }

    fun cancel(context: Context) {
        val app = context.applicationContext
        val am = app.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        try {
            am.cancel(pending(app))
        } catch (_: Exception) {
        }
    }

    private fun pending(context: Context): PendingIntent {
        val intent = Intent(context, CartReminderReceiver::class.java)
        return PendingIntent.getBroadcast(
            context,
            REQ,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun maybeFire(context: Context) {
        val app = context.applicationContext
        Cart.init(app)
        NotificationsStore.init(app)
        if (Cart.isEmpty()) return

        val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val last = prefs.getLong(KEY_LAST, 0L)
        if (System.currentTimeMillis() - last < COOLDOWN_MS) {
            // Re-schedule for later rather than firing again
            schedule(app)
            return
        }

        val count = Cart.count()
        val first = Cart.snapshot().firstOrNull()
        val title = if (count == 1) "Still in your cart" else "You left $count items in your cart"
        val body = first?.let {
            if (count == 1) "${it.name} is waiting — finish checkout when you're ready."
            else "${it.name} and ${count - 1} more · checkout before stock moves."
        } ?: "Finish checkout on SuperTech when you're ready."

        NotificationsStore.pushEvent(
            app,
            title,
            body,
            kind = "cart_reminder",
            imageUrl = first?.heroImage.orEmpty()
        )
        prefs.edit().putLong(KEY_LAST, System.currentTimeMillis()).apply()
        // Soft follow-up if still not empty
        schedule(app)
    }
}

class CartReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        CartReminders.maybeFire(context.applicationContext)
    }
}
