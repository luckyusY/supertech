package africa.supertech.marketplace

import android.app.Application

/** Initialises the shared network + session layer once for the whole app. */
class App : Application() {
    override fun onCreate() {
        super.onCreate()
        Net.init(this)
        Wishlist.init(this)
        MarketplaceCache.init(this)
        AppLifecycle.install(this)
        SystemNotifier.ensureChannel(this)
        NotificationsStore.init(this)
    }
}
