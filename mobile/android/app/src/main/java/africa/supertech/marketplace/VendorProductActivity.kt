package africa.supertech.marketplace

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.HorizontalScrollView
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
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
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Native "Add a product for review" — layout/fields aligned with website
 * [ProductSubmissionForm] (product details, availability, multi-image, AI copy).
 */
class VendorProductActivity : BaseActivity() {
    override fun canvasZone(): AppCanvasView.Zone = AppCanvasView.Zone.DASHBOARD
    override fun dockHighlight(): DockTab = DockTab.ACCOUNT

    private val executor = Executors.newSingleThreadExecutor()
    private lateinit var submit: Button
    private lateinit var uploadButton: Button
    private lateinit var uploadStatus: TextView
    private lateinit var uploadProgress: ProgressBar
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
    /** Local preview while a Cloudinary upload is in flight. */
    private var pendingLocalUri: Uri? = null
    private var uploadPercent: Int = 0
    private val isUploading = AtomicBoolean(false)

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
        if (session == null || !Net.isLoggedIn()) {
            startActivity(
                SignInActivity.intent(
                    this,
                    reason = "Sign in as a vendor to add or edit products.",
                    promptGoogle = true
                )
            )
            finish()
            return
        }
        if (session.role != "vendor" && session.role != "admin") {
            toast("Only vendors and admins can manage products")
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
        descriptionField = multiLineInputField(
            "What does this product do? Who is it for?",
            lines = 5
        )
        details.block(descriptionField, 4)
        aiStatus = text("Tip: enter the product name, then let AI draft description and bullets.", 12f, muted)
        details.addView(aiStatus)

        details.block(fieldLabel("Key features (one per line, up to 8)"), 0)
        featuresField = multiLineInputField(
            "Active noise cancellation\n40h battery life\nUSB-C fast charging",
            lines = 4
        ).apply {
            typeface = Typeface.MONOSPACE
            textSize = 13f
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
        images.addView(text("First image is the hero. Tap a thumbnail to remove. Up to $maxImages.", 13f, muted).apply {
            setPadding(0, dp(4), 0, dp(10))
        })
        galleryHost = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val galleryScroll = HorizontalScrollView(this).apply {
            isHorizontalScrollBarEnabled = false
            overScrollMode = View.OVER_SCROLL_NEVER
            clipToPadding = false
            addView(galleryHost)
        }
        images.addView(galleryScroll, LinearLayout.LayoutParams(mp(), wc()))

        uploadProgress = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 100
            progress = 0
            visibility = View.GONE
            progressTintList = android.content.res.ColorStateList.valueOf(brand)
            progressBackgroundTintList = android.content.res.ColorStateList.valueOf(line)
        }
        images.addView(
            uploadProgress,
            LinearLayout.LayoutParams(mp(), dp(6)).apply { topMargin = dp(12) }
        )
        uploadStatus = text("Choose clear product photos — first becomes the storefront hero.", 13f, muted).apply {
            setPadding(0, dp(8), 0, 0)
        }
        images.addView(uploadStatus)
        uploadButton = secondaryButton("Add photo") {
            if (isUploading.get()) {
                toast("Wait for the current upload to finish")
                return@secondaryButton
            }
            if (galleryUrls.size >= maxImages) {
                toast("Maximum $maxImages images")
                return@secondaryButton
            }
            ensureMediaPermissionThenPick()
        }.apply { minimumHeight = dp(48) }
        images.addView(
            uploadButton,
            LinearLayout.LayoutParams(mp(), wc()).apply { topMargin = dp(10) }
        )
        content.block(images, 14)
        renderGallery()

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
        val thumb = dp(108)
        val radius = dp(14).toFloat()

        // Uploaded images as square thumbnails
        galleryUrls.forEachIndexed { index, url ->
            galleryHost.addView(
                thumbnailCard(
                    size = thumb,
                    radius = radius,
                    badge = if (index == 0) "HERO" else "${index + 1}",
                    onRemove = {
                        if (isUploading.get()) {
                            toast("Wait for upload to finish")
                            return@thumbnailCard
                        }
                        galleryUrls.removeAt(index)
                        renderGallery()
                        uploadStatus.text = when {
                            galleryUrls.isEmpty() -> "No photos yet — add at least one for the hero."
                            else -> "${galleryUrls.size}/$maxImages photos · first is hero"
                        }
                        uploadStatus.setTextColor(muted)
                    },
                    bindImage = { img -> loadImage(img, url) }
                ),
                LinearLayout.LayoutParams(thumb, thumb).apply {
                    rightMargin = dp(10)
                }
            )
        }

        // In-progress local preview with progress overlay
        pendingLocalUri?.let { uri ->
            galleryHost.addView(
                thumbnailCard(
                    size = thumb,
                    radius = radius,
                    badge = "…",
                    onRemove = null,
                    bindImage = { img -> loadLocalThumb(img, uri) },
                    uploading = true,
                    progress = uploadPercent
                ),
                LinearLayout.LayoutParams(thumb, thumb).apply {
                    rightMargin = dp(10)
                }
            )
        }

        // Empty state tile
        if (galleryUrls.isEmpty() && pendingLocalUri == null) {
            val empty = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
                background = rounded(line, Color.rgb(248, 249, 251), radius)
                setPadding(dp(8), dp(8), dp(8), dp(8))
            }
            empty.addView(
                text("No photos", 12f, muted, Typeface.BOLD).apply { gravity = Gravity.CENTER }
            )
            empty.addView(
                text("Tap Add photo", 11f, muted).apply {
                    gravity = Gravity.CENTER
                    setPadding(0, dp(4), 0, 0)
                }
            )
            galleryHost.addView(empty, LinearLayout.LayoutParams(thumb, thumb))
        }
    }

    private fun thumbnailCard(
        size: Int,
        radius: Float,
        badge: String,
        onRemove: (() -> Unit)?,
        bindImage: (ImageView) -> Unit,
        uploading: Boolean = false,
        progress: Int = 0
    ): View {
        val frame = FrameLayout(this)
        frame.background = rounded(line, Color.rgb(232, 237, 242), radius)
        frame.clipToOutline = true
        frame.outlineProvider = object : android.view.ViewOutlineProvider() {
            override fun getOutline(view: View, outline: android.graphics.Outline) {
                outline.setRoundRect(0, 0, view.width, view.height, radius)
            }
        }

        val img = ImageView(this).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            setBackgroundColor(Color.rgb(232, 237, 242))
        }
        frame.addView(img, FrameLayout.LayoutParams(size, size))
        bindImage(img)

        // Badge (HERO / index)
        val badgeView = TextView(this).apply {
            text = badge
            textSize = 10f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.WHITE)
            setPadding(dp(8), dp(3), dp(8), dp(3))
            background = GradientDrawable().apply {
                setColor(if (badge == "HERO") brand else Color.argb(180, 20, 24, 32))
                cornerRadius = dp(8).toFloat()
            }
        }
        frame.addView(
            badgeView,
            FrameLayout.LayoutParams(wc(), wc(), Gravity.TOP or Gravity.START).apply {
                leftMargin = dp(6)
                topMargin = dp(6)
            }
        )

        if (onRemove != null) {
            val remove = TextView(this).apply {
                text = "×"
                textSize = 16f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(Color.WHITE)
                gravity = Gravity.CENTER
                setPadding(dp(6), dp(2), dp(6), dp(2))
                background = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setColor(Color.argb(200, 30, 30, 34))
                }
                setOnClickListener { onRemove() }
            }
            frame.addView(
                remove,
                FrameLayout.LayoutParams(dp(28), dp(28), Gravity.TOP or Gravity.END).apply {
                    topMargin = dp(4)
                    rightMargin = dp(4)
                }
            )
        }

        if (uploading) {
            val dim = View(this).apply {
                setBackgroundColor(Color.argb(120, 10, 15, 26))
            }
            frame.addView(dim, FrameLayout.LayoutParams(size, size))
            val col = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity = Gravity.CENTER
            }
            col.addView(ProgressBar(this).apply {
                isIndeterminate = progress <= 0
                if (progress > 0) {
                    isIndeterminate = false
                    max = 100
                    this.progress = progress
                }
            }, LinearLayout.LayoutParams(dp(36), dp(36)))
            col.addView(
                text(if (progress > 0) "$progress%" else "Uploading", 11f, Color.WHITE, Typeface.BOLD).apply {
                    gravity = Gravity.CENTER
                    setPadding(0, dp(6), 0, 0)
                }
            )
            frame.addView(col, FrameLayout.LayoutParams(size, size, Gravity.CENTER))
        }

        return frame
    }

    private fun loadLocalThumb(target: ImageView, uri: Uri) {
        try {
            contentResolver.openInputStream(uri)?.use { stream ->
                val opts = BitmapFactory.Options().apply { inSampleSize = 4 }
                val bmp = BitmapFactory.decodeStream(stream, null, opts)
                if (bmp != null) {
                    target.setImageBitmap(bmp)
                    target.scaleType = ImageView.ScaleType.CENTER_CROP
                }
            }
        } catch (_: Exception) {
            target.setImageResource(android.R.drawable.ic_menu_gallery)
        }
    }

    private fun setUploadUi(
        progress: Int,
        message: String,
        error: Boolean = false,
        rebuildGallery: Boolean = false
    ) {
        uploadPercent = progress.coerceIn(0, 100)
        uploadProgress.visibility = View.VISIBLE
        if (progress <= 0) {
            uploadProgress.isIndeterminate = true
        } else {
            uploadProgress.isIndeterminate = false
            uploadProgress.progress = uploadPercent
        }
        uploadStatus.text = message
        uploadStatus.setTextColor(if (error) danger else muted)
        uploadButton.isEnabled = !isUploading.get()
        uploadButton.alpha = if (isUploading.get()) 0.55f else 1f
        uploadButton.text = if (isUploading.get()) "Uploading…" else "Add photo"
        // Rebuild thumbs only when starting / finishing — avoids flicker on every % tick
        if (rebuildGallery) renderGallery()
    }

    private fun clearUploadUi(successMessage: String? = null, error: Boolean = false) {
        pendingLocalUri = null
        uploadPercent = 0
        isUploading.set(false)
        uploadProgress.visibility = View.GONE
        uploadProgress.progress = 0
        uploadButton.isEnabled = true
        uploadButton.alpha = 1f
        uploadButton.text = "Add photo"
        if (successMessage != null) {
            uploadStatus.text = successMessage
            uploadStatus.setTextColor(if (error) danger else brand)
        }
        renderGallery()
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
            clearUploadUi("Sign in as a vendor to upload images.", error = true)
            return
        }
        if (!isUploading.compareAndSet(false, true)) {
            toast("Already uploading a photo")
            return
        }
        pendingLocalUri = uri
        uploadPercent = 0
        setUploadUi(0, "Reading photo…", rebuildGallery = true)

        executor.execute {
            try {
                val mime = contentResolver.getType(uri).orEmpty()
                runOnUiThread { setUploadUi(5, "Reading photo…") }
                val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
                if (bytes == null || bytes.isEmpty()) {
                    runOnUiThread { clearUploadUi("Could not read that image.", error = true) }
                    return@execute
                }
                // Cap very large camera photos to avoid OOM / slow uploads
                if (bytes.size > 12 * 1024 * 1024) {
                    runOnUiThread {
                        clearUploadUi("Image is too large (max ~12 MB). Try a smaller photo.", error = true)
                    }
                    return@execute
                }
                runOnUiThread { setUploadUi(12, "Preparing secure upload…") }

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
                    runOnUiThread { clearUploadUi(msg, error = true) }
                    return@execute
                }
                val s = sign.json()
                val cloudName = s.optString("cloudName")
                val apiKey = s.optString("apiKey")
                val timestamp = s.optLong("timestamp")
                val signature = s.optString("signature")
                if (cloudName.isBlank() || apiKey.isBlank() || signature.isBlank()) {
                    runOnUiThread {
                        clearUploadUi("Cloudinary is not configured on the server.", error = true)
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
                runOnUiThread { setUploadUi(18, "Uploading photo… 0%") }
                val upload = uploadToCloudinary(
                    bytes = bytes,
                    cloudName = cloudName,
                    apiKey = apiKey,
                    timestamp = timestamp,
                    signature = signature,
                    folder = folder,
                    filename = filename,
                    contentType = contentType,
                    onProgress = { pct ->
                        // Map stream progress into 18–95% of overall bar
                        val overall = 18 + ((pct * 77) / 100)
                        runOnUiThread {
                            if (isUploading.get()) {
                                setUploadUi(overall, "Uploading photo… $pct%")
                            }
                        }
                    }
                )
                runOnUiThread {
                    if (upload.url != null) {
                        if (!galleryUrls.contains(upload.url) && galleryUrls.size < maxImages) {
                            galleryUrls.add(upload.url)
                        }
                        val n = galleryUrls.size
                        clearUploadUi(
                            if (n >= maxImages) "All $maxImages photos ready · first is hero"
                            else "Photo $n of $maxImages uploaded · first is hero"
                        )
                    } else {
                        clearUploadUi(
                            upload.error.ifBlank { "Upload failed. Try another image." },
                            error = true
                        )
                    }
                }
            } catch (e: Exception) {
                runOnUiThread {
                    clearUploadUi(e.message?.take(120) ?: "Upload failed. Try another image.", error = true)
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
        contentType: String,
        onProgress: (Int) -> Unit = {}
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
        connection.readTimeout = 90000
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
                // Chunked write so progress tracks the image body only
                var offset = 0
                val chunk = 16 * 1024
                var lastPct = -1
                val total = bytes.size.coerceAtLeast(1)
                while (offset < bytes.size) {
                    val len = minOf(chunk, bytes.size - offset)
                    out.write(bytes, offset, len)
                    offset += len
                    val pct = ((offset * 100) / total).coerceIn(0, 100)
                    if (pct != lastPct && (pct == 100 || pct - lastPct >= 3)) {
                        lastPct = pct
                        onProgress(pct)
                    }
                }
                out.writeBytes("\r\n")
                out.writeBytes("--$boundary--\r\n")
                out.flush()
            }

            onProgress(100)
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
