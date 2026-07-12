package africa.supertech.marketplace

import android.app.Application

/** Initialises the shared network + session layer once for the whole app. */
class App : Application() {
    override fun onCreate() {
        super.onCreate()
        Net.init(this)
        Wishlist.init(this)
        Cart.init(this)
        MarketplaceCache.init(this)
        AppLifecycle.install(this)
        SystemNotifier.ensureChannel(this)
        NotificationsStore.init(this)
        // If cart still has items after restart, keep a gentle reminder scheduled
        if (!Cart.isEmpty()) CartReminders.schedule(this)
    }
}
