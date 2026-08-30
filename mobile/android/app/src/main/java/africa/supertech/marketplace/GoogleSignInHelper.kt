package africa.supertech.marketplace

import android.app.Activity
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import org.json.JSONObject
import java.security.MessageDigest
import java.util.UUID
import java.util.concurrent.Executors

/**
 * Shared Google Sign-In (Credential Manager) for Welcome + Sign-in screens.
 *
 * Call [begin] from a coroutine (e.g. lifecycleScope.launch).
 * App uses the **Web** client ID; Google Cloud also needs an **Android** client
 * (package + SHA-1).
 */
class GoogleSignInHelper(
    private val activity: Activity,
    private val onLoading: (loading: Boolean, status: String) -> Unit,
    private val onError: (message: String, setupHint: String?) -> Unit,
    private val onSuccess: () -> Unit,
    /** When true (switch account), clear saved Google state so the account picker shows. */
    private val forceAccountPicker: Boolean = false
) {
    private val io = Executors.newSingleThreadExecutor()

    suspend fun begin() {
        onLoading(true, "Preparing Google sign-in…")
        if (forceAccountPicker) {
            onLoading(true, "Opening account picker…")
            clearGoogleState(activity)
        }
        val clientId = withContext(Dispatchers.IO) { resolveGoogleWebClientId() }
        if (clientId.isBlank()) {
            onLoading(false, "")
            onError(
                "Web client ID missing. Keep GOOGLE_WEB_CLIENT_ID on Vercel (Web type).",
                null
            )
            return
        }
        runCredentialFlow(clientId)
    }

    companion object {
        private const val TAG = "SuperTechGoogle"

        /**
         * Clears Credential Manager state so the next Google sign-in can pick a different account.
         */
        suspend fun clearGoogleState(activity: Activity) {
            try {
                CredentialManager.create(activity)
                    .clearCredentialState(ClearCredentialStateRequest())
            } catch (e: Exception) {
                Log.w(TAG, "clearCredentialState failed (ok if none stored): ${e.message}")
            }
        }
    }

    private fun resolveGoogleWebClientId(): String {
        val baked = BuildConfig.GOOGLE_WEB_CLIENT_ID.trim()
        if (baked.isNotBlank()) return baked
        return try {
            val result = Net.get("/api/auth/google/config")
            if (!result.ok) return ""
            result.json().optString("clientId").trim()
        } catch (_: Exception) {
            ""
        }
    }

    private suspend fun runCredentialFlow(clientId: String) {
        onLoading(true, "Choose a Google account…")
        Log.i(
            TAG,
            "Google sign-in webClient=${clientId.take(24)}… pkg=${activity.packageName} sha1=${appSigningSha1()}"
        )
        val hashedNonce = sha256Hex(UUID.randomUUID().toString())

        try {
            val buttonOption = GetSignInWithGoogleOption.Builder(clientId)
                .setNonce(hashedNonce)
                .build()
            val buttonRequest = GetCredentialRequest.Builder()
                .addCredentialOption(buttonOption)
                .build()
            val result = withTimeout(90_000L) {
                CredentialManager.create(activity).getCredential(activity, buttonRequest)
            }
            handleCredential(result.credential)
            return
        } catch (_: GetCredentialCancellationException) {
            onLoading(false, "")
            onError("Google sign-in was cancelled.", null)
            return
        } catch (e: NoCredentialException) {
            Log.w(TAG, "SignInWithGoogleOption: NoCredential", e)
        } catch (e: GetCredentialException) {
            Log.w(TAG, "SignInWithGoogleOption failed: ${e.message}", e)
        } catch (_: TimeoutCancellationException) {
            onLoading(false, "")
            emitShaError("Google took too long. Check internet, then register package + SHA-1:")
            return
        }

        try {
            val idOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(clientId)
                .setAutoSelectEnabled(false)
                .setNonce(hashedNonce)
                .build()
            val idRequest = GetCredentialRequest.Builder()
                .addCredentialOption(idOption)
                .build()
            val result = withTimeout(90_000L) {
                CredentialManager.create(activity).getCredential(activity, idRequest)
            }
            handleCredential(result.credential)
        } catch (_: TimeoutCancellationException) {
            onLoading(false, "")
            emitShaError("Google took too long. Register package + SHA-1:")
        } catch (_: GoogleIdTokenParsingException) {
            onLoading(false, "")
            onError("Google account information could not be read. Try again.", null)
        } catch (_: GetCredentialCancellationException) {
            onLoading(false, "")
            onError("Google sign-in was cancelled.", null)
        } catch (e: NoCredentialException) {
            onLoading(false, "")
            Log.e(TAG, "NoCredentialException — Android OAuth client / SHA-1", e)
            emitShaError(
                "Google blocked this app (not a missing account).\n\n" +
                    "Create an Android OAuth client in Google Cloud with:"
            )
        } catch (error: GetCredentialException) {
            onLoading(false, "")
            onError(friendlyError(error), setupHintForError(error))
        } catch (error: Exception) {
            onLoading(false, "")
            onError(error.message?.ifBlank { null } ?: "Google sign-in failed. Try again.", null)
        }
    }

    private fun handleCredential(credential: androidx.credentials.Credential) {
        if (credential is CustomCredential &&
            credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
        ) {
            onLoading(true, "Signing you in…")
            val google = GoogleIdTokenCredential.createFrom(credential.data)
            exchangeGoogleToken(google.idToken)
        } else {
            onLoading(false, "")
            onError("Google returned an unsupported credential. Try another account.", null)
        }
    }

    private fun exchangeGoogleToken(idToken: String) {
        io.execute {
            val result = Net.post("/api/auth/google", JSONObject().put("idToken", idToken))
            val session = if (result.ok) result.json().optJSONObject("session") else null
            activity.runOnUiThread {
                onLoading(false, "")
                if (result.ok && session != null && Net.hasSessionCookie()) {
                    Net.saveSession(session)
                    activity.getSharedPreferences("supertech", Activity.MODE_PRIVATE)
                        .edit().putBoolean("welcome_complete", true).apply()
                    onSuccess()
                } else {
                    onError(
                        result.errorMessage(
                            "Server rejected Google sign-in. Check GOOGLE_WEB_CLIENT_ID on Vercel."
                        ),
                        null
                    )
                }
            }
        }
    }

    private fun emitShaError(prefix: String) {
        val sha = appSigningSha1()
        val pkg = activity.packageName
        onError(
            "$prefix\n\nPackage:\n$pkg\n\nSHA-1:\n$sha",
            "Google Cloud → Credentials → OAuth client → Android\n" +
                "Package: $pkg\nSHA-1: $sha\n\n" +
                "Keep Web client ID in the app. Wait 2–5 min after saving. Tap to copy SHA-1."
        )
    }

    private fun setupHintForError(error: GetCredentialException): String? {
        val msg = "${error.message.orEmpty()} ${error.javaClass.simpleName}"
        return if (
            msg.contains("10:", ignoreCase = true) ||
            msg.contains("DEVELOPER_ERROR", ignoreCase = true) ||
            msg.contains("NoCredential", ignoreCase = true)
        ) {
            "Package: ${activity.packageName}\nSHA-1: ${appSigningSha1()}"
        } else null
    }

    private fun friendlyError(error: GetCredentialException): String {
        val msg = "${error.message.orEmpty()} ${error.javaClass.simpleName}"
        return when {
            msg.contains("cancel", ignoreCase = true) || msg.contains("16:") ->
                "Google sign-in was cancelled."
            msg.contains("10:") || msg.contains("DEVELOPER_ERROR", ignoreCase = true) ->
                "Google Cloud setup needed: Android OAuth client with package + SHA-1."
            else -> msg.trim().ifBlank { "Google sign-in failed. Try again." }
        }
    }

    fun appSigningSha1(): String {
        return try {
            val signatures = if (Build.VERSION.SDK_INT >= 28) {
                val info = activity.packageManager.getPackageInfo(
                    activity.packageName,
                    PackageManager.GET_SIGNING_CERTIFICATES
                )
                info.signingInfo?.apkContentsSigners ?: emptyArray()
            } else {
                @Suppress("DEPRECATION")
                activity.packageManager.getPackageInfo(
                    activity.packageName,
                    PackageManager.GET_SIGNATURES
                ).signatures ?: emptyArray()
            }
            val sig = signatures.firstOrNull() ?: return "unknown"
            MessageDigest.getInstance("SHA-1").digest(sig.toByteArray())
                .joinToString(":") { "%02X".format(it) }
        } catch (_: Exception) {
            "unknown"
        }
    }

    private fun sha256Hex(value: String): String {
        val digest = MessageDigest.getInstance("SHA-256").digest(value.toByteArray())
        return digest.joinToString("") { "%02x".format(it) }
    }
}
