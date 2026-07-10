package africa.supertech.marketplace

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

/**
 * In-app browser used for every part of the SuperTech site that is not yet
 * native: full catalog, product pages, checkout, account, and the admin and
 * vendor dashboards. Keeping these in-app (instead of an external browser
 * intent) is what turns the shell into a full app — the session, cookies and
 * file uploads all stay inside SuperTech.
 */
class WebActivity : AppCompatActivity() {

    private val brand = Color.rgb(246, 139, 30)
    private val ink = Color.rgb(49, 49, 51)

    private lateinit var webView: WebView
    private lateinit var swipe: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var titleView: TextView

    private var fileCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooser = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val uris = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
        fileCallback?.onReceiveValue(uris)
        fileCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = brand
        window.navigationBarColor = Color.WHITE

        val url = intent.getStringExtra(EXTRA_URL) ?: "$BASE/"
        val initialTitle = intent.getStringExtra(EXTRA_TITLE) ?: "SuperTech"

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
        }

        root.addView(topBar(initialTitle), LinearLayout.LayoutParams(match(), dp(54)))

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 100
            progressTintList = android.content.res.ColorStateList.valueOf(brand)
            progressBackgroundTintList = android.content.res.ColorStateList.valueOf(Color.TRANSPARENT)
        }
        root.addView(progressBar, LinearLayout.LayoutParams(match(), dp(3)))

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(match(), match())
            configure()
        }

        swipe = SwipeRefreshLayout(this).apply {
            setColorSchemeColors(brand)
            setOnRefreshListener { webView.reload() }
            addView(webView)
        }
        root.addView(swipe, LinearLayout.LayoutParams(match(), 0, 1f))

        setContentView(root)

        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        webView.loadUrl(url)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun WebView.configure() {
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            javaScriptCanOpenWindowsAutomatically = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            userAgentString = "$userAgentString SuperTechApp/1.1"
        }

        webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean = handleUrl(request.url)

            override fun onPageFinished(view: WebView, url: String?) {
                CookieManager.getInstance().flush()
                titleView.text = view.title?.takeIf { it.isNotBlank() } ?: titleView.text
            }
        }

        webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, newProgress: Int) {
                progressBar.progress = newProgress
                progressBar.visibility = if (newProgress in 1..99) View.VISIBLE else View.GONE
                if (newProgress >= 100) swipe.isRefreshing = false
            }

            override fun onShowFileChooser(
                view: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: FileChooserParams
            ): Boolean {
                fileCallback?.onReceiveValue(null)
                fileCallback = callback
                return try {
                    fileChooser.launch(params.createIntent())
                    true
                } catch (_: Exception) {
                    fileCallback = null
                    false
                }
            }
        }
    }

    /** Keep SuperTech hosts in-app; hand everything else to the OS. */
    private fun handleUrl(uri: Uri): Boolean {
        val scheme = uri.scheme?.lowercase()
        val host = uri.host?.lowercase().orEmpty()
        val inApp = (scheme == "http" || scheme == "https") &&
            (host == "supertech.africa" || host.endsWith(".supertech.africa"))
        if (inApp) return false

        return try {
            startActivity(Intent(Intent.ACTION_VIEW, uri))
            true
        } catch (_: Exception) {
            Toast.makeText(this, "No app found to open this link", Toast.LENGTH_SHORT).show()
            true
        }
    }

    private fun topBar(title: String): View {
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(brand)
            setPadding(dp(6), 0, dp(6), 0)
        }

        val back = barButton("‹") {
            if (webView.canGoBack()) webView.goBack() else finish()
        }

        titleView = TextView(this).apply {
            text = title
            textSize = 17f
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
            setPadding(dp(6), 0, dp(6), 0)
        }

        val refresh = barButton("⟳") { webView.reload() }
        val external = barButton("↗") {
            try {
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(webView.url ?: "$BASE/")))
            } catch (_: Exception) {
            }
        }
        val close = barButton("✕") { finish() }

        bar.addView(back, LinearLayout.LayoutParams(dp(40), dp(44)))
        bar.addView(titleView, LinearLayout.LayoutParams(0, wrap(), 1f))
        bar.addView(refresh, LinearLayout.LayoutParams(dp(40), dp(44)))
        bar.addView(external, LinearLayout.LayoutParams(dp(40), dp(44)))
        bar.addView(close, LinearLayout.LayoutParams(dp(40), dp(44)))
        return bar
    }

    private fun barButton(symbol: String, onClick: () -> Unit): View {
        return TextView(this).apply {
            text = symbol
            textSize = if (symbol == "‹") 28f else 19f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            isClickable = true
            setOnClickListener { onClick() }
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
    private fun match() = ViewGroup.LayoutParams.MATCH_PARENT
    private fun wrap() = ViewGroup.LayoutParams.WRAP_CONTENT

    companion object {
        private const val EXTRA_URL = "extra_url"
        private const val EXTRA_TITLE = "extra_title"
        private const val BASE = "https://supertech.africa"

        fun start(context: Context, url: String, title: String) {
            context.startActivity(
                Intent(context, WebActivity::class.java)
                    .putExtra(EXTRA_URL, url)
                    .putExtra(EXTRA_TITLE, title)
            )
        }
    }
}
