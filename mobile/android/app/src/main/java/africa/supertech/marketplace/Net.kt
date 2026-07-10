package africa.supertech.marketplace

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import java.net.URL

/**
 * Shared networking + session layer for the native app.
 *
 * The website authenticates with an HMAC-signed httpOnly cookie
 * (`supertech_session`). We capture that cookie from the sign-in response,
 * persist it, and replay it on every request — so the app and website share
 * one backend and the user stays logged in across launches.
 */
object Net {
    // Use the canonical apex host. www.supertech.africa 307-redirects here, and
    // HttpURLConnection does NOT auto-follow redirects on POST/PUT — which would
    // silently break sign-in and every other write request.
    const val BASE = "https://supertech.africa"
    private const val COOKIE_NAME = "supertech_session"
    private const val TAG = "SuperTechNet"

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        if (!::prefs.isInitialized) {
            prefs = context.applicationContext.getSharedPreferences("supertech", Context.MODE_PRIVATE)
        }
    }

    // ---- Session state ----

    data class Session(
        val email: String,
        val role: String,
        val name: String,
        val vendorSlug: String?,
        val dashboardPath: String
    )

    fun session(): Session? {
        val raw = prefs.getString("session", null) ?: return null
        return try {
            val o = JSONObject(raw)
            Session(
                email = o.optString("email"),
                role = o.optString("role", "customer"),
                name = o.optString("name", "SuperTech user"),
                vendorSlug = o.optString("vendorSlug").takeIf { it.isNotBlank() },
                dashboardPath = o.optString("dashboardPath", "/account")
            )
        } catch (_: Exception) {
            null
        }
    }

    fun isLoggedIn(): Boolean = prefs.getString("cookie", null) != null && session() != null

    fun saveSession(sessionJson: JSONObject) {
        prefs.edit().putString("session", sessionJson.toString()).commit()
    }

    fun signOut() {
        prefs.edit().remove("cookie").remove("session").commit()
    }

    private fun cookie(): String? = prefs.getString("cookie", null)

    fun hasSessionCookie(): Boolean = cookie()?.startsWith("$COOKIE_NAME=") == true

    private fun captureCookie(connection: HttpURLConnection) {
        val headers = connection.headerFields ?: return
        for ((key, values) in headers) {
            if (key != null && key.equals("Set-Cookie", ignoreCase = true)) {
                for (value in values) {
                    val cookiePart = value
                        .split(",")
                        .map { it.trim() }
                        .firstOrNull { it.startsWith("$COOKIE_NAME=") }
                    if (cookiePart != null) {
                        val pair = cookiePart.substringBefore(";").trim()
                        // Empty value means the server cleared the session (sign-out).
                        if (pair == "$COOKIE_NAME=") {
                            prefs.edit().remove("cookie").commit()
                        } else {
                            prefs.edit().putString("cookie", pair).commit()
                        }
                    }
                }
            }
        }
    }

    // ---- Requests ----

    data class Result(val code: Int, val body: String, val networkError: String? = null) {
        val ok: Boolean get() = code in 200..299
        fun json(): JSONObject = try {
            JSONObject(body)
        } catch (_: Exception) {
            JSONObject()
        }
        fun errorMessage(fallback: String): String {
            networkError?.let { return it }
            return try {
                JSONObject(body).optString("error").ifBlank { fallback }
            } catch (_: Exception) {
                fallback
            }
        }
    }

    fun get(path: String): Result = request(path, "GET", null)

    fun post(path: String, body: JSONObject): Result = request(path, "POST", body.toString())

    fun postText(path: String, body: JSONObject): Result = request(path, "POST", body.toString(), "text/plain")

    fun patch(path: String, body: JSONObject): Result = request(path, "PATCH", body.toString())

    fun put(path: String, body: JSONObject): Result = request(path, "PUT", body.toString())

    fun delete(path: String): Result = request(path, "DELETE", null)

    private fun request(path: String, method: String, body: String?, accept: String = "application/json"): Result {
        var lastError: Exception? = null
        val retryDelays = longArrayOf(600L, 1200L, 2200L)

        for (attempt in 0..retryDelays.size) {
            var url = if (path.startsWith("http")) path else BASE + path
            var redirects = 0
            try {
                while (true) {
                    val connection = URL(url).openConnection() as HttpURLConnection
                    connection.requestMethod = method
                    // Follow redirects manually so the method + body are preserved
                    // (the platform drops POST bodies and won't auto-follow on POST).
                    connection.instanceFollowRedirects = false
                    connection.connectTimeout = 15000
                    connection.readTimeout = 30000
                    connection.setRequestProperty("Accept", accept)
                    connection.setRequestProperty("User-Agent", "SuperTechAndroid/1")
                    cookie()?.let { connection.setRequestProperty("Cookie", it) }
                    if (body != null) {
                        connection.doOutput = true
                        connection.setRequestProperty("Content-Type", "application/json")
                        OutputStreamWriter(connection.outputStream).use { it.write(body) }
                    }

                    val code = connection.responseCode
                    captureCookie(connection)
                    Log.d(TAG, "$method $url -> $code cookie=${hasSessionCookie()}")

                    if (code in 300..399 && redirects < 4) {
                        val location = connection.getHeaderField("Location")
                        connection.disconnect()
                        if (location.isNullOrBlank()) return Result(code, "")
                        url = if (location.startsWith("http")) location else URL(URL(url), location).toString()
                        redirects++
                        continue
                    }

                    val stream = if (code in 200..299) connection.inputStream else connection.errorStream
                    val text = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
                    connection.disconnect()
                    return Result(code, text)
                }
            } catch (e: Exception) {
                lastError = e
                Log.e(TAG, "$method $url failed on attempt ${attempt + 1}: ${e.javaClass.simpleName}: ${e.message}", e)
                if (attempt == retryDelays.size || !isRetryable(e)) {
                    return Result(0, "", friendlyNetworkError(e))
                }
                try {
                    Thread.sleep(retryDelays[attempt])
                } catch (_: InterruptedException) {
                    Thread.currentThread().interrupt()
                    return Result(0, "", "Connection was interrupted. Try again.")
                }
            }
        }

        return Result(0, "", friendlyNetworkError(lastError))
    }

    private fun isRetryable(error: Exception): Boolean {
        if (error is UnknownHostException || error is SocketTimeoutException) return true
        val message = error.message.orEmpty().lowercase()
        return message.contains("timeout") ||
            message.contains("unable to resolve host") ||
            message.contains("connection reset") ||
            message.contains("failed to connect")
    }

    private fun friendlyNetworkError(error: Exception?): String {
        return when (error) {
            is UnknownHostException -> "The phone could not resolve supertech.africa. Turn Wi-Fi/mobile data off and on, then try again."
            is SocketTimeoutException -> "The SuperTech server took too long to respond. Try again."
            null -> "No connection. Check your internet and try again."
            else -> "Network error: ${error.message ?: error.javaClass.simpleName}"
        }
    }
}
