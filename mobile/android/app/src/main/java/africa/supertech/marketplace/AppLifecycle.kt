package africa.supertech.marketplace

import android.app.Activity
import android.app.Application
import android.os.Bundle
import java.util.concurrent.atomic.AtomicInteger

/**
 * Tracks whether SuperTech is in the foreground so we can:
 * - keep the in-app logo clean (no notification badge on logo while open)
 * - clear launcher badge-holder when user returns to the app
 * - still post system-tray notifications with SuperTech chime
 */
object AppLifecycle : Application.ActivityLifecycleCallbacks {
    private val started = AtomicInteger(0)

    @Volatile
    var isForeground: Boolean = false
        private set

    fun install(app: Application) {
        app.registerActivityLifecycleCallbacks(this)
    }

    override fun onActivityStarted(activity: Activity) {
        val wasBackground = started.get() == 0
        if (started.incrementAndGet() == 1) isForeground = true
        if (wasBackground) {
            // App opened: remove silent badge-holder so logo / launcher stay clean
            SystemNotifier.clearLauncherBadge(activity.applicationContext)
        }
    }

    override fun onActivityStopped(activity: Activity) {
        if (started.decrementAndGet() == 0) {
            isForeground = false
            // Going background: restore launcher badge if there are unread items
            SystemNotifier.updateBadgeOnly(activity.applicationContext)
        }
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
    override fun onActivityResumed(activity: Activity) {}
    override fun onActivityPaused(activity: Activity) {}
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
    override fun onActivityDestroyed(activity: Activity) {}
}
