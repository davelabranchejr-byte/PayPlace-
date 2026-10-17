Pod::Spec.new do |s|
  s.name = 'PayPlaceBillDocuments'
  s.version = '1.0.0'
  s.summary = 'On-device PDF bill reading'
  s.description = 'Reads local bill PDFs without uploading their contents.'
  s.license = 'MIT'
  s.author = 'PayPlace'
  s.homepage = 'https://github.com/davelabranchejr-byte/PayPlace-'
  s.source = { :git => 'https://github.com/davelabranchejr-byte/PayPlace-.git' }
  s.platform = :ios, '15.5'
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'PDFKit', 'UIKit'
  s.source_files = '**/*.swift'
end
