package africa.supertech.marketplace

import android.app.Activity
import android.app.Application
import android.os.Bundle
import java.util.concurrent.atomic.AtomicInteger

/**
 * Tracks whether SuperTech is in the foreground so we can:
 * - skip in-app logo badges while the user is already looking at the app
 * - still post system-tray notifications with sound when needed
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
        if (started.incrementAndGet() == 1) isForeground = true
    }

    override fun onActivityStopped(activity: Activity) {
        if (started.decrementAndGet() == 0) isForeground = false
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
    override fun onActivityResumed(activity: Activity) {}
    override fun onActivityPaused(activity: Activity) {}
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
    override fun onActivityDestroyed(activity: Activity) {}
}
