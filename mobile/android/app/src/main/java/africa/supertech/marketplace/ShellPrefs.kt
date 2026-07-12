package africa.supertech.marketplace

import android.content.Context

/** Remembers last shopper shell tab for smarter cold starts. */
object ShellPrefs {
    private const val PREFS = "supertech_shell"
    private const val KEY_TAB = "last_tab"

    fun saveTab(context: Context, tabName: String) {
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_TAB, tabName)
            .apply()
    }

    fun lastTab(context: Context, default: String = "Home"): String {
        return context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_TAB, default) ?: default
    }
}
