package africa.supertech.marketplace

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Spinner
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

/**
 * Native "Add a product for review" — layout/fields aligned with website
 * [ProductSubmissionForm] (product details, availability, multi-image, AI copy).
 */
class VendorProductActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submit: Button
    private lateinit var uploadStatus: TextView
    private lateinit var galleryHost: LinearLayout
    private lateinit var errorText: TextView
    private lateinit var successText: TextView
    private lateinit var aiStatus: TextView

    private lateinit var nameField: EditText
    private lateinit var categorySpinner: Spinner
    private lateinit var badgeSpinner: Spinner
    private lateinit var priceField: EditText
    private lateinit var compareField: EditText
    private lateinit var stockSpinner: Spinner
    private lateinit var shipSpinner: Spinner
    private lateinit var descriptionField: EditText
    private lateinit var featuresField: EditText

    private val galleryUrls = ArrayList<String>()
    private val maxImages = 4

    private val badgeOptions = listOf(
        "New listing", "Best seller", "Limited stock", "Editor's pick", "Sale", "Pre-order"
    )
    private val stockOptions = listOf(
        "In stock", "Limited stock", "Only 3 left", "Pre-order", "Out of stock"
    )
    private val shipOptions = listOf(
        "Ships within 24h", "Ships within 48h", "Ships within 3-5 days", "Ships within 1 week"
    )

    private val pickImage = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) uploadImage(uri)
        else toast("No image selected")
    }

    private val requestMediaPermission = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        val ok = grants.values.any { it } || grants.isEmpty()
        if (ok || canReadImagesWithoutPermission()) {
            openImagePicker()
        } else {
            toast("Allow photos access to upload product images")
            uploadStatus.text = "Permission needed: allow Photos / Media for SuperTech in Settings."
            uploadStatus.setTextColor(danger)
        }
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

        val content = scaffold(if (editing) "Edit product" else "Add product", withBack = true)

        // —— Header card (website soft-card header)
        val header = card()
        header.setBackgroundColor(Color.rgb(248, 249, 251))
        header.addView(text("PRODUCT LISTING", 11f, muted, Typeface.BOLD).apply {
            letterSpacing = 0.12f
        })
        header.addView(text(
            if (editing) "Edit product for review" else "Add a product for review",
            22f, ink, Typeface.BOLD
        ).apply { setPadding(0, dp(6), 0, 0) })
        header.addView(text(
            "Once submitted, an admin will review and publish it to the catalog.",
            13f, muted
        ).apply { setPadding(0, dp(4), 0, dp(12)) })
        header.addView(text("SELLING AS", 10f, muted, Typeface.BOLD).apply { letterSpacing = 0.1f })
        header.addView(
            text(session.name.ifBlank { session.vendorSlug ?: "Your store" }, 15f, ink, Typeface.BOLD).apply {
                setPadding(dp(12), dp(10), dp(12), dp(10))
                background = rounded(line, Color.rgb(241, 243, 246), dp(12).toFloat())
            }
        )
        content.block(header, 14)

        // —— Product details
        val details = card()
        details.addView(sectionLabel("Product details"))
        details.block(fieldLabel("Product name *"), 0)
        nameField = inputField("e.g. Wireless Noise-Cancelling Headphones", Types.TEXT)
        details.block(nameField, 10)

        details.block(fieldLabel("Category *"), 0)
        categorySpinner = categoryPicker(intent.getStringExtra("category"))
        details.block(categorySpinner, 10)

        details.block(fieldLabel("Badge label"), 0)
        badgeSpinner = optionSpinner(badgeOptions, "New listing")
        details.block(badgeSpinner, 10)

        details.block(fieldLabel("Price (RWF) *"), 0)
        priceField = inputField("e.g. 450000", InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL)
        details.block(priceField, 10)

        details.block(fieldLabel("Compare-at price (strikethrough, optional)"), 0)
        compareField = inputField("Optional original price", InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL)
        details.block(compareField, 10)

        val descHead = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        descHead.addView(
            fieldLabel("Description *"),
            LinearLayout.LayoutParams(0, wc(), 1f)
        )
        descHead.addView(
            secondaryButton("Generate with AI") { generateAiCopy() }.apply {
                minimumHeight = dp(40)
                textSize = 12f
            },
            LinearLayout.LayoutParams(wc(), wc())
        )
        details.addView(descHead)
        descriptionField = inputField("What does this product do? Who is it for?", Types.TEXT).apply {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            setSingleLine(false)
            minLines = 4
        }
        details.block(descriptionField, 4)
        aiStatus = text("Tip: enter the product name, then let AI draft description and bullets.", 12f, muted)
        details.addView(aiStatus)

        details.block(fieldLabel("Key features (one per line, up to 8)"), 0)
        featuresField = inputField("Active noise cancellation\n40h battery life\nUSB-C fast charging", Types.TEXT).apply {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE
            setSingleLine(false)
            minLines = 4
            typeface = Typeface.MONOSPACE
            textSize = 12f
        }
        details.block(featuresField, 0)
        content.block(details, 14)

        // —— Availability
        val avail = card()
        avail.addView(sectionLabel("Availability & shipping"))
        avail.block(fieldLabel("Stock status"), 0)
        stockSpinner = optionSpinner(stockOptions, "In stock")
        avail.block(stockSpinner, 10)
        avail.block(fieldLabel("Shipping window"), 0)
        shipSpinner = optionSpinner(shipOptions, "Ships within 48h")
        avail.block(shipSpinner, 0)
        content.block(avail, 14)

        // —— Images
        val images = card()
        images.addView(sectionLabel("Product images"))
        images.addView(text("First image becomes the hero. Add up to 4 total.", 13f, muted).apply {
            setPadding(0, dp(4), 0, dp(10))
        })
        galleryHost = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        images.addView(galleryHost)
        uploadStatus = text("Upload from gallery or camera.", 13f, muted).apply {
            setPadding(0, dp(8), 0, 0)
        }
        images.addView(uploadStatus)
        images.addView(
            secondaryButton("Upload image") {
                if (galleryUrls.size >= maxImages) {
                    toast("Maximum $maxImages images")
                    return@secondaryButton
                }
                ensureMediaPermissionThenPick()
            },
            LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(8) }
        )
        content.block(images, 14)

        // Prefill edit mode
        if (editing) {
            nameField.setText(intent.getStringExtra("name").orEmpty())
            val p = intent.getDoubleExtra("price", 0.0)
            if (p > 0) priceField.setText(p.toLong().toString())
            val cmp = intent.getDoubleExtra("compareAt", 0.0)
            if (cmp > 0) compareField.setText(cmp.toLong().toString())
            selectSpinner(badgeSpinner, badgeOptions, intent.getStringExtra("badge") ?: "New listing")
            selectSpinner(stockSpinner, stockOptions, intent.getStringExtra("stockLabel") ?: "In stock")
            selectSpinner(shipSpinner, shipOptions, intent.getStringExtra("shipWindow") ?: "Ships within 48h")
            descriptionField.setText(intent.getStringExtra("description").orEmpty())
            featuresField.setText(intent.getStringArrayListExtra("features")?.joinToString("\n").orEmpty())
            intent.getStringExtra("heroImage")?.takeIf { it.isNotBlank() }?.let {
                galleryUrls.add(it)
            }
            intent.getStringArrayListExtra("gallery")?.forEach { u ->
                if (u.isNotBlank() && !galleryUrls.contains(u)) galleryUrls.add(u)
            }
            renderGallery()
        }

        errorText = text("", 13f, danger).apply { visibility = View.GONE }
        content.block(errorText, 6)
        successText = text("", 13f, brand).apply { visibility = View.GONE }
        content.block(successText, 6)

        val foot = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(0, dp(4), 0, dp(8))
        }
        foot.addView(text("Products go live after admin approval — usually within 24 hours.", 12f, muted))
        submit = primaryButton(if (editing) "Save changes" else "Submit for review") {
            create(editId, session.vendorSlug.orEmpty())
        }
        submit.minimumHeight = dp(54)
        foot.addView(submit, LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(12) })
        content.block(foot, 16)
    }

    private fun sectionLabel(title: String): View {
        return text(title.uppercase(), 12f, muted, Typeface.BOLD).apply {
            letterSpacing = 0.08f
            setPadding(0, 0, 0, dp(10))
            setTextColor(brand)
        }
    }

    private fun optionSpinner(options: List<String>, selected: String): Spinner {
        val spinner = Spinner(this).apply {
            background = rounded(line, page, dp(12).toFloat())
            setPadding(dp(10), dp(8), dp(10), dp(8))
            adapter = ArrayAdapter(this@VendorProductActivity, android.R.layout.simple_spinner_dropdown_item, options)
        }
        selectSpinner(spinner, options, selected)
        return spinner
    }

    private fun selectSpinner(spinner: Spinner, options: List<String>, selected: String) {
        val i = options.indexOfFirst { it.equals(selected, true) }
        if (i >= 0) spinner.setSelection(i)
    }

    private fun spinnerValue(spinner: Spinner): String =
        spinner.selectedItem?.toString()?.trim().orEmpty()

    private fun renderGallery() {
        galleryHost.removeAllViews()
        galleryUrls.forEachIndexed { index, url ->
            val row = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                background = rounded(line, Color.WHITE, dp(14).toFloat())
                setPadding(dp(10), dp(10), dp(10), dp(10))
            }
            val img = ImageView(this).apply {
                scaleType = ImageView.ScaleType.CENTER_CROP
                setBackgroundColor(Color.rgb(232, 237, 242))
            }
            row.addView(img, LinearLayout.LayoutParams(mp(), dp(140)))
            loadImage(img, url)
            val meta = LinearLayout(this).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, dp(8), 0, 0)
            }
            meta.addView(
                text(if (index == 0) "HERO IMAGE" else "GALLERY $index", 11f, muted, Typeface.BOLD),
                LinearLayout.LayoutParams(0, wc(), 1f)
            )
            meta.addView(textButton("Remove") {
                galleryUrls.removeAt(index)
                renderGallery()
            })
            row.addView(meta)
            galleryHost.addView(row, LinearLayout.LayoutParams(mp(), wc()).apply { bottomMargin = dp(10) })
        }
    }

    private fun generateAiCopy() {
        val name = nameField.text.toString().trim()
        if (name.length < 3) {
            aiStatus.text = "Enter a product name first, then generate."
            aiStatus.setTextColor(danger)
            return
        }
        aiStatus.text = "Writing with AI…"
        aiStatus.setTextColor(muted)
        executor.execute {
            try {
                val body = JSONObject()
                    .put("name", name)
                    .put("category", selectedCategory(categorySpinner))
                    .put("keywords", featuresField.text.toString())
                val price = priceField.text.toString().replace(",", "").toDoubleOrNull()
                if (price != null) body.put("price", price)
                val result = Net.post("/api/ai/product-copy", body)
                runOnUiThread {
                    if (!result.ok) {
                        aiStatus.text = result.errorMessage("Unable to generate copy.")
                        aiStatus.setTextColor(danger)
                        return@runOnUiThread
                    }
                    val json = result.json()
                    json.optString("description").takeIf { it.isNotBlank() }?.let {
                        descriptionField.setText(it)
                    }
                    val feats = json.optJSONArray("features")
                    if (feats != null && feats.length() > 0) {
                        val lines = (0 until feats.length()).mapNotNull { feats.optString(it).takeIf { s -> s.isNotBlank() } }
                        featuresField.setText(lines.joinToString("\n"))
                    }
                    aiStatus.text = "AI draft ready — edit before you submit."
                    aiStatus.setTextColor(brand)
                }
            } catch (e: Exception) {
                runOnUiThread {
                    aiStatus.text = e.message ?: "Unable to generate copy."
                    aiStatus.setTextColor(danger)
                }
            }
        }
    }

    private fun create(editId: String?, vendorSlug: String) {
        errorText.visibility = View.GONE
        successText.visibility = View.GONE
        val name = nameField.text.toString().trim()
        val category = selectedCategory(categorySpinner)
        val price = priceField.text.toString().replace(",", "").toDoubleOrNull()
        val compareAt = compareField.text.toString().replace(",", "").toDoubleOrNull()
        val description = descriptionField.text.toString().trim()
        if (name.isBlank() || category.isBlank() || price == null || price <= 0) {
            showError("Name, category and a valid price are required.")
            return
        }
        if (description.isBlank()) {
            showError("Description is required.")
            return
        }
        if (galleryUrls.isEmpty()) {
            showError("Upload at least one product image before saving.")
            return
        }
        val featureList = featuresField.text.toString()
            .split("\n", ",")
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .take(8)
        val heroImage = galleryUrls.first()
        val gallery = galleryUrls.drop(1)
        val body = JSONObject()
            .put("vendorSlug", vendorSlug)
            .put("name", name)
            .put("category", category)
            .put("price", price)
            .put("badge", spinnerValue(badgeSpinner).ifBlank { "New listing" })
            .put("stockLabel", spinnerValue(stockSpinner).ifBlank { "In stock" })
            .put("shipWindow", spinnerValue(shipSpinner).ifBlank { "Ships within 48h" })
            .put("description", description)
            .put("features", JSONArray(featureList))
            .put("heroImage", heroImage)
            .put("gallery", JSONArray(gallery))
        if (compareAt != null && compareAt > 0) body.put("compareAt", compareAt)

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
                    result.code == 0 -> showError("No connection. Try again.")
                    else -> showError(result.errorMessage("Could not save product."))
                }
            }
        }
    }

    /** Ask for gallery/photos permission before opening the system picker. */
    private fun ensureMediaPermissionThenPick() {
        val needed = mediaPermissionsNeeded()
        if (needed.isEmpty()) {
            openImagePicker()
            return
        }
        val missing = needed.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isEmpty()) {
            openImagePicker()
            return
        }
        // Explain first, then system dialog
        android.app.AlertDialog.Builder(this)
            .setTitle("Allow photo access")
            .setMessage(
                "SuperTech needs access to your photos so you can upload product images " +
                    "for review. You can change this later in Settings."
            )
            .setPositiveButton("Continue") { _, _ ->
                requestMediaPermission.launch(missing.toTypedArray())
            }
            .setNegativeButton("Not now", null)
            .show()
    }

    private fun mediaPermissionsNeeded(): List<String> {
        return if (Build.VERSION.SDK_INT >= 33) {
            listOf(Manifest.permission.READ_MEDIA_IMAGES)
        } else if (Build.VERSION.SDK_INT >= 23) {
            listOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        } else {
            emptyList()
        }
    }

    /** Android Photo Picker / GetContent often works without legacy storage grants. */
    private fun canReadImagesWithoutPermission(): Boolean = Build.VERSION.SDK_INT >= 33

    private fun openImagePicker() {
        try {
            pickImage.launch("image/*")
        } catch (e: Exception) {
            toast(e.message ?: "Could not open gallery")
        }
    }

    private fun uploadImage(uri: Uri) {
        if (galleryUrls.size >= maxImages) {
            toast("Maximum $maxImages images")
            return
        }
        if (!Net.isLoggedIn()) {
            uploadStatus.text = "Sign in as a vendor to upload images."
            uploadStatus.setTextColor(danger)
            return
        }
        uploadStatus.text = "Uploading image…"
        uploadStatus.setTextColor(muted)
        executor.execute {
            try {
                val mime = contentResolver.getType(uri).orEmpty()
                val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
                if (bytes == null || bytes.isEmpty()) {
                    runOnUiThread {
                        uploadStatus.text = "Could not read that image."
                        uploadStatus.setTextColor(danger)
                    }
                    return@execute
                }
                // Must sign the same params we send to Cloudinary (folder is required)
                val folder = "supertech/products"
                val paramsToSign = JSONObject().put("folder", folder)
                val sign = Net.post(
                    "/api/cloudinary/sign",
                    JSONObject().put("paramsToSign", paramsToSign)
                )
                if (!sign.ok) {
                    val msg = when {
                        sign.code == 401 || sign.code == 403 ->
                            "Session expired — sign in as vendor and try again."
                        sign.code == 0 ->
                            "No connection. Check internet and try again."
                        else ->
                            sign.errorMessage("Image upload unavailable (${sign.code}).")
                    }
                    runOnUiThread {
                        uploadStatus.text = msg
                        uploadStatus.setTextColor(danger)
                    }
                    return@execute
                }
                val s = sign.json()
                val cloudName = s.optString("cloudName")
                val apiKey = s.optString("apiKey")
                val timestamp = s.optLong("timestamp")
                val signature = s.optString("signature")
                if (cloudName.isBlank() || apiKey.isBlank() || signature.isBlank()) {
                    runOnUiThread {
                        uploadStatus.text = "Cloudinary is not configured on the server."
                        uploadStatus.setTextColor(danger)
                    }
                    return@execute
                }
                val filename = when {
                    mime.contains("png") -> "upload.png"
                    mime.contains("webp") -> "upload.webp"
                    else -> "upload.jpg"
                }
                val contentType = when {
                    mime.contains("png") -> "image/png"
                    mime.contains("webp") -> "image/webp"
                    mime.isNotBlank() -> mime
                    else -> "image/jpeg"
                }
                val upload = uploadToCloudinary(
                    bytes = bytes,
                    cloudName = cloudName,
                    apiKey = apiKey,
                    timestamp = timestamp,
                    signature = signature,
                    folder = folder,
                    filename = filename,
                    contentType = contentType
                )
                runOnUiThread {
                    if (upload.url != null) {
                        if (!galleryUrls.contains(upload.url) && galleryUrls.size < maxImages) {
                            galleryUrls.add(upload.url)
                            renderGallery()
                        }
                        uploadStatus.text = "Image uploaded"
                        uploadStatus.setTextColor(brand)
                    } else {
                        uploadStatus.text = upload.error.ifBlank { "Upload failed. Try another image." }
                        uploadStatus.setTextColor(danger)
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    uploadStatus.text = e.message?.take(120) ?: "Upload failed. Try another image."
                    uploadStatus.setTextColor(danger)
                }
            }
        }
    }

    private data class UploadResult(val url: String?, val error: String = "")

    private fun uploadToCloudinary(
        bytes: ByteArray,
        cloudName: String,
        apiKey: String,
        timestamp: Long,
        signature: String,
        folder: String,
        filename: String,
        contentType: String
    ): UploadResult {
        if (cloudName.isBlank() || apiKey.isBlank() || signature.isBlank()) {
            return UploadResult(null, "Missing Cloudinary credentials.")
        }
        val boundary = "----SuperTech${System.currentTimeMillis()}"
        val connection = URL("https://api.cloudinary.com/v1_1/$cloudName/image/upload")
            .openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.doOutput = true
        connection.doInput = true
        connection.connectTimeout = 30000
        connection.readTimeout = 60000
        connection.useCaches = false
        connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
        connection.setRequestProperty("Accept", "application/json")

        try {
            connection.outputStream.use { raw ->
                val out = DataOutputStream(raw)
                fun field(name: String, value: String) {
                    out.writeBytes("--$boundary\r\n")
                    out.writeBytes("Content-Disposition: form-data; name=\"$name\"\r\n\r\n")
                    out.writeBytes("$value\r\n")
                }
                // Only signed params + api_key (api_key is not part of the signature)
                field("api_key", apiKey)
                field("timestamp", timestamp.toString())
                field("signature", signature)
                field("folder", folder)
                out.writeBytes("--$boundary\r\n")
                out.writeBytes(
                    "Content-Disposition: form-data; name=\"file\"; filename=\"$filename\"\r\n"
                )
                out.writeBytes("Content-Type: $contentType\r\n\r\n")
                out.write(bytes)
                out.writeBytes("\r\n")
                out.writeBytes("--$boundary--\r\n")
                out.flush()
            }

            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val text = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            connection.disconnect()

            if (code !in 200..299) {
                val cloudErr = try {
                    JSONObject(text).optString("error").ifBlank {
                        JSONObject(text).optJSONObject("error")?.optString("message").orEmpty()
                    }
                } catch (_: Exception) {
                    text.take(160)
                }
                return UploadResult(
                    null,
                    cloudErr.ifBlank { "Cloudinary error ($code)." }
                )
            }
            val url = try {
                JSONObject(text).optString("secure_url").takeIf { it.isNotBlank() }
            } catch (_: Exception) {
                null
            }
            return if (url != null) UploadResult(url)
            else UploadResult(null, "Cloudinary returned no image URL.")
        } catch (e: Exception) {
            try {
                connection.disconnect()
            } catch (_: Exception) {
            }
            return UploadResult(null, e.message ?: "Network error uploading image.")
        }
    }

    private val editing: Boolean get() = !intent.getStringExtra("editId").isNullOrBlank()

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

    private fun showError(msg: String) {
        errorText.text = msg
        errorText.setTextColor(danger)
        errorText.visibility = View.VISIBLE
    }

    override fun onDestroy() {
        executor.shutdownNow()
        super.onDestroy()
    }
}
