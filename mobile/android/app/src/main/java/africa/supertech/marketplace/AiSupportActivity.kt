package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Native AI Support chat. Streams replies from /api/ai/support so customers get
 * the same assistant the website offers, but as a first-class mobile screen.
 */
class AiSupportActivity : BaseActivity() {

    private val executor = Executors.newSingleThreadExecutor()

    private lateinit var messagesView: LinearLayout
    private lateinit var scroll: ScrollView
    private lateinit var input: EditText
    private lateinit var sendButton: ImageView

    private val history = ArrayList<Msg>()
    private var sending = false

    private val suggestions = listOf(
        "Find me a laptop under 500,000 RWF",
        "How do I track my order?",
        "How do I pay with MoMo?",
        "How do I become a vendor?"
    )

    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.APP
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val content = scaffold("SuperTech AI", withBack = true)
        // Hide standard header for custom chat top bar
        try {
            val topBar = (content.parent.parent as LinearLayout).getChildAt(0)
            topBar.visibility = View.GONE
        } catch (_: Exception) {}
        content.setPadding(0, 0, 0, 0)

        val frame = FrameLayout(this)
        val outerCol = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(page)
        }
        outerCol.addView(topBarChat(), LinearLayout.LayoutParams(mp(), dp(58)))

        messagesView = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
        }
        scroll = ScrollView(this).apply {
            isFillViewport = true
            overScrollMode = View.OVER_SCROLL_NEVER
            addView(messagesView)
        }
        outerCol.addView(scroll, LinearLayout.LayoutParams(mp(), 0, 1f))
        outerCol.addView(composer(), LinearLayout.LayoutParams(mp(), wc()))

        frame.addView(outerCol, FrameLayout.LayoutParams(mp(), mp()))

        // Scroll to bottom FAB
        val fab = ImageView(this).apply {
            setImageResource(R.drawable.ic_chevron)
            rotation = 90f // points down
            setColorFilter(Color.WHITE)
            setPadding(dp(10), dp(10), dp(10), dp(10))
            background = rounded(Color.TRANSPARENT, brand, dp(18).toFloat())
            pressable()
            elevation = dp(6).toFloat()
            visibility = View.GONE
            setOnClickListener {
                scrollToBottom()
                visibility = View.GONE
            }
        }
        val fabLp = FrameLayout.LayoutParams(dp(36), dp(36), Gravity.BOTTOM or Gravity.END).apply {
            bottomMargin = dp(76)
            rightMargin = dp(16)
        }
        frame.addView(fab, fabLp)

        // Show FAB when scrolled up
        scroll.setOnScrollChangeListener { _, _, scrollY, _, _ ->
            val diff = messagesView.height - scroll.height
            if (diff > 0 && scrollY < diff - dp(100)) {
                fab.visibility = View.VISIBLE
            } else {
                fab.visibility = View.GONE
            }
        }

        setContentView(frame)

        addAssistant("Hi, I am **SuperTech AI Support**. Ask me about products, orders, requests, or becoming a vendor.")
        addSuggestions()
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }

    private fun topBarChat(): View {
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            background = gradient(brand, brandDark, 0f)
            setPadding(dp(8), 0, dp(10), 0)
        }
        val back = ImageView(this).apply {
            setImageResource(R.drawable.ic_chevron)
            setColorFilter(Color.WHITE)
            rotation = 180f
            setPadding(dp(10), dp(10), dp(10), dp(10))
            contentDescription = "Back"
            pressable()
            setOnClickListener { finishSmart() }
        }
        val copy = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(10), 0, 0, 0)
        }
        copy.addView(TextView(this).apply {
            text = "SuperTech AI"
            textSize = 17f
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
        })
        copy.addView(TextView(this).apply {
            text = "● Online · replies in seconds"
            textSize = 11f
            setTextColor(Color.argb(215, 255, 255, 255))
        })
        bar.addView(back, LinearLayout.LayoutParams(dp(40), dp(46)))
        bar.addView(ImageView(this).apply {
            setImageResource(R.mipmap.ic_launcher)
            scaleType = ImageView.ScaleType.CENTER_CROP
            background = rounded(Color.TRANSPARENT, Color.WHITE, dp(9).toFloat())
            clipToOutline = true
        }, LinearLayout.LayoutParams(dp(36), dp(36)))
        bar.addView(copy, LinearLayout.LayoutParams(0, wc(), 1f))
        return bar
    }

    private fun composer(): View {
        val wrap = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.WHITE)
            setPadding(dp(12), dp(10), dp(12), dp(12))
            elevation = dp(12).toFloat()
        }
        input = EditText(this).apply {
            hint = "Ask SuperTech AI…"
            textSize = 15f
            setTextColor(ink)
            setHintTextColor(muted)
            setSingleLine(true)
            setPadding(dp(16), 0, dp(16), 0)
            background = rounded(line, page, dp(22).toFloat())
            imeOptions = EditorInfo.IME_ACTION_SEND
            setOnEditorActionListener { _, actionId, _ ->
                if (actionId == EditorInfo.IME_ACTION_SEND) {
                    submit(); true
                } else false
            }
        }
        sendButton = ImageView(this).apply {
            setImageResource(R.drawable.ic_chevron) // chevron points right
            setColorFilter(Color.WHITE)
            setPadding(dp(12), dp(12), dp(12), dp(12))
            background = rounded(Color.TRANSPARENT, brand, dp(22).toFloat())
            pressable()
            setOnClickListener { submit() }
        }
        wrap.addView(input, LinearLayout.LayoutParams(0, dp(44), 1f))
        wrap.addView(sendButton, LinearLayout.LayoutParams(dp(44), dp(44)).apply { leftMargin = dp(8) })
        return wrap
    }

    private fun submit() {
        val text = input.text.toString().trim()
        if (text.isEmpty() || sending) return
        input.setText("")
        clearSuggestions()
        addUser(text)
        history.add(Msg("user", text))
        sendToAi(text)
    }

    private fun sendToAi(message: String) {
        sending = true
        sendButton.alpha = 0.5f
        val bubble = addAssistant("")
        val typing = TextView(this).apply {
            text = "● ● ●"
            textSize = 13f
            setTextColor(muted)
        }
        bubble.addView(typing)

        executor.execute {
            try {
                val payload = JSONObject().apply {
                    put("message", message)
                    put("page", "android-app")
                    val arr = JSONArray()
                    history.takeLast(8).forEach { m ->
                        arr.put(JSONObject().put("role", m.role).put("content", m.content))
                    }
                    put("messages", arr)
                }

                val result = Net.postText("/api/ai/support", payload)
                if (!result.ok) {
                    val reason = result.errorMessage("AI support is unavailable right now.")
                    runOnUiThread { finishReply(bubble, typing, reason) }
                    return@execute
                }

                val reply = result.body.trim().ifBlank { "AI support is unavailable right now." }
                runOnUiThread {
                    bubble.removeView(typing)
                    renderBubbleText(bubble, reply)
                    history.add(Msg("assistant", reply))
                    finishSending()
                    scrollToBottom()
                }
            } catch (_: Exception) {
                runOnUiThread { finishReply(bubble, typing, "AI support is unavailable right now. Check your connection and try again.") }
            }
        }
    }

    private fun finishReply(bubble: LinearLayout, typing: View, text: String) {
        bubble.removeView(typing)
        renderBubbleText(bubble, text)
        history.add(Msg("assistant", text))
        finishSending()
        scrollToBottom()
    }

    private fun finishSending() {
        sending = false
        sendButton.alpha = 1f
    }

    private fun addUser(text: String) {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.END
            setPadding(0, dp(6), 0, dp(6))
        }
        val bubble = TextView(this).apply {
            this.text = text
            textSize = 15f
            setTextColor(Color.WHITE)
            setLineSpacing(0f, 1.1f)
            setPadding(dp(14), dp(10), dp(14), dp(10))
            background = rounded(Color.TRANSPARENT, brand, dp(16).toFloat())
        }
        row.addView(bubble, LinearLayout.LayoutParams(wc(), wc()).apply {
            marginStart = dp(48)
        })
        messagesView.addView(row)
        animateIn(row)
        scrollToBottom()
    }

    private fun addAssistant(markdown: String): LinearLayout {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.START
            setPadding(0, dp(6), 0, dp(6))
        }
        val avatar = TextView(this).apply {
            text = "AI"
            textSize = 11f
            gravity = Gravity.CENTER
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            background = rounded(Color.TRANSPARENT, ink, dp(14).toFloat())
        }
        val bubble = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(14), dp(10), dp(14), dp(10))
            background = rounded(line, Color.WHITE, dp(16).toFloat())
        }
        row.addView(avatar, LinearLayout.LayoutParams(dp(28), dp(28)).apply { marginEnd = dp(8); topMargin = dp(2) })
        row.addView(bubble, LinearLayout.LayoutParams(wc(), wc()).apply { marginEnd = dp(40) })
        messagesView.addView(row)
        if (markdown.isNotBlank()) renderBubbleText(bubble, markdown)
        animateIn(row)
        return bubble
    }

    private fun renderBubbleText(bubble: LinearLayout, markdown: String) {
        bubble.removeAllViews()
        markdown.trim().split("\n").forEach { rawLine ->
            val lineText = rawLine.trim()
            if (lineText.isEmpty()) return@forEach
            val bullet = lineText.startsWith("- ") || lineText.startsWith("• ")
            val body = if (bullet) "•  " + lineText.removePrefix("- ").removePrefix("• ") else lineText
            bubble.addView(TextView(this).apply {
                text = stripMarkdown(body)
                textSize = 15f
                setTextColor(ink)
                setLineSpacing(0f, 1.12f)
                setPadding(0, dp(2), 0, dp(2))
            })
        }
        if (bubble.childCount == 0) {
            bubble.addView(TextView(this).apply {
                text = markdown
                textSize = 15f
                setTextColor(ink)
            })
        }
    }

    private fun stripMarkdown(value: String): String {
        return value.replace("**", "").replace(Regex("\\[(.*?)]\\((.*?)\\)"), "$1")
    }

    private fun addSuggestions() {
        val rail = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(dp(16), dp(8), dp(16), dp(8))
        }
        suggestions.forEach { suggestion ->
            val item = TextView(this).apply {
                text = suggestion
                textSize = 13f
                setTextColor(brandDark)
                typeface = Typeface.DEFAULT_BOLD
                setPadding(dp(14), dp(8), dp(14), dp(8))
                background = rounded(brand, Color.rgb(255, 244, 229), dp(16).toFloat())
                pressable()
                setOnClickListener {
                    input.setText(suggestion)
                    submit()
                }
            }
            rail.addView(item, LinearLayout.LayoutParams(wc(), wc()).apply { marginEnd = dp(8) })
        }
        val scrollContainer = android.widget.HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            tag = SUGGESTION_TAG
            addView(rail)
        }
        messagesView.addView(scrollContainer)
    }

    private fun clearSuggestions() {
        messagesView.findViewWithTag<View>(SUGGESTION_TAG)?.let { messagesView.removeView(it) }
    }

    private fun animateIn(view: View) {
        view.alpha = 0f
        view.translationY = dp(10).toFloat()
        view.animate().alpha(1f).translationY(0f).setDuration(200).start()
    }

    private fun scrollToBottom() {
        scroll.post { scroll.fullScroll(View.FOCUS_DOWN) }
    }

    private data class Msg(val role: String, val content: String)

    private companion object {
        const val SUGGESTION_TAG = "ai-suggestions"
    }
}
