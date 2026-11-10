import ExpoModulesCore
import PDFKit
import UIKit

public class PayPlaceBillDocumentsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PayPlaceBillDocuments")
    AsyncFunction("readPDF") { (input: String, output: String) throws -> [[String: String]] in
      guard let url = URL(string: input), url.isFileURL,
            let folder = URL(string: output), folder.isFileURL else {
        throw NSError(domain: "Billiam", code: 1, userInfo: [NSLocalizedDescriptionKey: "Choose a local PDF file."])
      }
      let cache = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0].resolvingSymlinksInPath().path + "/"
      guard folder.resolvingSymlinksInPath().path.hasPrefix(cache),
            folder.lastPathComponent.hasPrefix("Billiam-") else {
        throw NSError(domain: "Billiam", code: 2, userInfo: [NSLocalizedDescriptionKey: "Invalid temporary folder."])
      }
      let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
      guard size > 0 && size <= 20 * 1024 * 1024,
            let document = PDFDocument(url: url), !document.isLocked,
            document.pageCount > 0 && document.pageCount <= 12 else {
        throw NSError(domain: "Billiam", code: 3, userInfo: [NSLocalizedDescriptionKey: "Choose an unlocked PDF of at most 12 pages and 20 MB."])
      }
      var result: [[String: String]] = []
      for index in 0..<document.pageCount {
        try autoreleasepool {
          guard let page = document.page(at: index) else { throw NSError(domain: "Billiam", code: 4) }
          let text = page.string ?? ""
          if !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            result.append(["text": String(text.prefix(50000))])
          } else {
            // PDFKit's thumbnail preserves page rotation and aspect ratio.
            let image = page.thumbnail(of: CGSize(width: 1800, height: 1800), for: .mediaBox)
            guard let jpeg = image.jpegData(compressionQuality: 0.95) else { throw NSError(domain: "Billiam", code: 5) }
            let target = folder.appendingPathComponent("page-\(index).jpg")
            try jpeg.write(to: target, options: .atomic)
            result.append(["uri": target.absoluteString])
          }
        }
      }
      return result
    }
  }
}
