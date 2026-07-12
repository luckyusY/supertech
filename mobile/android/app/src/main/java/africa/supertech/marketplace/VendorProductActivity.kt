package africa.supertech.marketplace

import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.text.InputType
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import org.json.JSONArray
import org.json.JSONObject
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/** Native "list a product" form for vendors → POST /api/product-submissions. */
class VendorProductActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submit: Button
    private lateinit var heroField: EditText
    private lateinit var uploadStatus: TextView
    private lateinit var preview: ImageView

    private val pickImage = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) uploadImage(uri)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val session = Net.session()
        if (session == null || (session.role != "vendor" && session.role != "admin")) {
            toast("Sign in as a vendor or admin to manage products")
            startActivity(android.content.Intent(this, SignInActivity::class.java))
            finish()
            return
        }

        val editId = intent.getStringExtra("editId")
        val editing = !editId.isNullOrBlank()

        val content = scaffold(if (editing) "Edit product" else "List a product", withBack = true)
        content.block(text(if (editing) "Edit product" else "New product", 24f, ink, Typeface.BOLD), 4)
        content.block(text(
            if (editing) "Update your product. Changes go back through review."
            else "Submit a product for review. Once approved it appears in the marketplace.",
            14f, muted), 16)

        val form = card()
        form.block(fieldLabel("Product name"), 0)
        val name = inputField("e.g. Dell XPS 13", Types.TEXT); form.block(name, 10)
        form.block(fieldLabel("Category"), 0)
        val category = categoryPicker(intent.getStringExtra("category")); form.block(category, 10)
        form.block(fieldLabel("Price (RWF)"), 0)
        val price = inputField("450000", InputType.TYPE_CLASS_NUMBER); form.block(price, 10)
        form.block(fieldLabel("Badge (optional)"), 0)
        val badge = inputField("e.g. Best seller", Types.TEXT); form.block(badge, 10)
        form.block(fieldLabel("Stock label"), 0)
        val stock = inputField("e.g. In stock", Types.TEXT); form.block(stock, 10)
        form.block(fieldLabel("Ship window"), 0)
        val ship = inputField("e.g. 2–3 days", Types.TEXT); form.block(ship, 10)
        form.block(fieldLabel("Description"), 0)
        val description = inputField("Describe the product", Types.TEXT).apply {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            setSingleLine(false)
            minLines = 3
        }
        form.block(description, 10)
        form.block(fieldLabel("Features (one per line)"), 0)
        val features = inputField("8GB RAM\n256GB SSD", Types.TEXT).apply {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            setSingleLine(false)
            minLines = 2
        }
        form.block(features, 0)
        content.block(form, 14)

        if (editing) {
            name.setText(intent.getStringExtra("name").orEmpty())
            val p = intent.getDoubleExtra("price", 0.0)
            if (p > 0) price.setText(p.toLong().toString())
            badge.setText(intent.getStringExtra("badge").orEmpty())
            stock.setText(intent.getStringExtra("stockLabel").orEmpty())
            ship.setText(intent.getStringExtra("shipWindow").orEmpty())
            description.setText(intent.getStringExtra("description").orEmpty())
            features.setText(intent.getStringArrayListExtra("features")?.joinToString("\n").orEmpty())
        }

        // Image
        val imageCard = card()
        imageCard.addView(text("Product image", 15f, ink, Typeface.BOLD))
        preview = ImageView(this).apply {
            setBackgroundColor(Color.rgb(232, 237, 242))
            scaleType = ImageView.ScaleType.CENTER_CROP
            visibility = View.GONE
        }
        imageCard.addView(preview, LinearLayout.LayoutParams(mp(), dp(160)).apply { topMargin = dp(10) })
        uploadStatus = text("Upload an image, or paste an image URL below.", 13f, muted).apply { setPadding(0, dp(8), 0, 0) }
        imageCard.addView(uploadStatus)
        imageCard.addView(
            secondaryButton("Upload from gallery") { pickImage.launch("image/*") },
            LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(8) }
        )
        heroField = inputField("https://…/image.jpg", InputType.TYPE_TEXT_VARIATION_URI or InputType.TYPE_CLASS_TEXT)
        imageCard.addView(fieldLabel("Image URL"))
        imageCard.addView(heroField, LinearLayout.LayoutParams(mp(), wc()))
        content.block(imageCard, 14)

        if (editing) intent.getStringExtra("heroImage")?.takeIf { it.isNotBlank() }?.let {
            heroField.setText(it)
            preview.visibility = View.VISIBLE
            loadImage(preview, it)
        }

        val error = text("", 13f, danger).apply { visibility = View.GONE }
        content.block(error, 6)

        submit = primaryButton(if (editing) "Save changes" else "Submit for review") {
            create(
                editId,
                name.text.toString().trim(),
                selectedCategory(category),
                price.text.toString().trim(),
                badge.text.toString().trim(),
                stock.text.toString().trim(),
                ship.text.toString().trim(),
                description.text.toString().trim(),
                features.text.toString(),
                session.vendorSlug.orEmpty(),
                error
            )
        }
        submit.minimumHeight = dp(52)
        content.block(submit, 10)
    }

    private fun create(
        editId: String?,
        name: String, category: String, priceText: String, badge: String, stock: String,
        ship: String, description: String, featuresText: String, vendorSlug: String, error: View
    ) {
        error as TextView
        val price = priceText.replace(",", "").toDoubleOrNull()
        if (name.isBlank() || category.isBlank() || price == null) {
            show(error, "Name, category and a valid price are required.")
            return
        }
        val heroImage = heroField.text.toString().trim()
        if (heroImage.isBlank()) {
            show(error, "Add a product image (upload or paste a URL).")
            return
        }
        val featureList = featuresText.split("\n", ",").map { it.trim() }.filter { it.isNotBlank() }
        val body = JSONObject()
            .put("vendorSlug", vendorSlug)
            .put("name", name)
            .put("category", category)
            .put("price", price)
            .put("badge", badge)
            .put("stockLabel", stock.ifBlank { "In stock" })
            .put("shipWindow", ship.ifBlank { "2–4 days" })
            .put("description", description)
            .put("features", JSONArray(featureList))
            .put("heroImage", heroImage)
            .put("gallery", JSONArray(listOf(heroImage)))

        setLoading(true)
        executor.execute {
            val result = if (!editId.isNullOrBlank()) Net.put("/api/product-submissions/$editId", body)
            else Net.post("/api/product-submissions", body)
            runOnUiThread {
                setLoading(false)
                when {
                    result.ok -> {
                        toast(if (!editId.isNullOrBlank()) "Product updated" else "Submitted for review")
                        finish()
                    }
                    result.code == 0 -> show(error, "No connection. Try again.")
                    else -> show(error, result.errorMessage("Could not save product."))
                }
            }
        }
    }

    private val editing: Boolean get() = !intent.getStringExtra("editId").isNullOrBlank()

    // ---- Cloudinary upload ----

    private fun uploadImage(uri: Uri) {
        uploadStatus.text = "Uploading image…"
        uploadStatus.setTextColor(muted)
        executor.execute {
            try {
                val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
                if (bytes == null) {
                    runOnUiThread { uploadStatus.text = "Could not read that image." }
                    return@execute
                }
                val sign = Net.post("/api/cloudinary/sign", JSONObject().put("paramsToSign", JSONObject()))
                if (!sign.ok) {
                    runOnUiThread { uploadStatus.text = "Image upload unavailable. Paste an image URL instead." }
                    return@execute
                }
                val s = sign.json()
                val url = uploadToCloudinary(
                    bytes,
                    s.optString("cloudName"),
                    s.optString("apiKey"),
                    s.optLong("timestamp"),
                    s.optString("signature")
                )
                runOnUiThread {
                    if (url != null) {
                        heroField.setText(url)
                        uploadStatus.text = "Image uploaded ✓"
                        uploadStatus.setTextColor(brand)
                        preview.visibility = View.VISIBLE
                        loadImage(preview, url)
                    } else {
                        uploadStatus.text = "Upload failed. Paste an image URL instead."
                    }
                }
            } catch (_: Exception) {
                runOnUiThread { uploadStatus.text = "Upload failed. Paste an image URL instead." }
            }
        }
    }

    private fun uploadToCloudinary(
        bytes: ByteArray, cloudName: String, apiKey: String, timestamp: Long, signature: String
    ): String? {
        if (cloudName.isBlank() || apiKey.isBlank()) return null
        val boundary = "----SuperTech${System.currentTimeMillis()}"
        val connection = URL("https://api.cloudinary.com/v1_1/$cloudName/image/upload").openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.doOutput = true
        connection.connectTimeout = 20000
        connection.readTimeout = 40000
        connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")

        DataOutputStream(connection.outputStream).use { out ->
            fun field(name: String, value: String) {
                out.writeBytes("--$boundary\r\n")
                out.writeBytes("Content-Disposition: form-data; name=\"$name\"\r\n\r\n")
                out.writeBytes("$value\r\n")
            }
            field("api_key", apiKey)
            field("timestamp", timestamp.toString())
            field("signature", signature)
            out.writeBytes("--$boundary\r\n")
            out.writeBytes("Content-Disposition: form-data; name=\"file\"; filename=\"upload.jpg\"\r\n")
            out.writeBytes("Content-Type: image/jpeg\r\n\r\n")
            out.write(bytes)
            out.writeBytes("\r\n")
            out.writeBytes("--$boundary--\r\n")
            out.flush()
        }

        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val text = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
        connection.disconnect()
        return try {
            JSONObject(text).optString("secure_url").takeIf { it.isNotBlank() }
        } catch (_: Exception) {
            null
        }
    }

    private fun setLoading(loading: Boolean) {
        submit.isEnabled = !loading
        submit.text = when {
            loading && editing -> "Saving…"
            loading -> "Submitting…"
            editing -> "Save changes"
            else -> "Submit for review"
        }
        submit.alpha = if (loading) 0.6f else 1f
    }

    private fun show(view: TextView, msg: String) {
        view.text = msg
        view.setTextColor(danger)
        view.visibility = View.VISIBLE
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
