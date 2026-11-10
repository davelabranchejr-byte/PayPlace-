package expo.modules.billdocuments

import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File

class PayPlaceBillDocumentsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PayPlaceBillDocuments")
    AsyncFunction("readPDF") { input: String, output: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("App not ready.")
      val uri = Uri.parse(input)
      val folderUri = Uri.parse(output)
      require(uri.scheme == "file" && folderUri.scheme == "file") { "Choose a local PDF file." }
      val file = File(requireNotNull(uri.path))
      val folder = File(requireNotNull(folderUri.path)).canonicalFile
      require(folder.path.startsWith(context.cacheDir.canonicalPath + File.separator) && folder.name.startsWith("Billiam-")) { "Invalid temporary folder." }
      require(file.length() in 1..(20L * 1024 * 1024)) { "Choose a PDF smaller than 20 MB." }
      ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY).use { descriptor ->
        PdfRenderer(descriptor).use { renderer ->
          require(renderer.pageCount in 1..12) { "Choose an unlocked PDF of at most 12 pages." }
          (0 until renderer.pageCount).map { index ->
            renderer.openPage(index).use { page ->
              val scale = 1800.0 / maxOf(page.width, page.height).coerceAtLeast(1)
              val bitmap = Bitmap.createBitmap((page.width * scale).toInt().coerceAtLeast(1), (page.height * scale).toInt().coerceAtLeast(1), Bitmap.Config.ARGB_8888)
              try {
                bitmap.eraseColor(Color.WHITE)
                page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                val target = File(folder, "page-$index.jpg")
                target.outputStream().use { stream -> check(bitmap.compress(Bitmap.CompressFormat.JPEG, 95, stream)) }
                mapOf("uri" to Uri.fromFile(target).toString())
              } finally { bitmap.recycle() }
            }
          }
        }
      }
    }
  }
}
