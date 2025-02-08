import SwiftUI

struct WatermarkEditorView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = WatermarkViewModel()
    let image: UIImage
    
    private let watermarkTemplates = [
        "仅办理银行业务使用，他用无效",
        "仅办理社保业务使用，他用无效",
        "仅办理公积金业务使用，他用无效",
        "仅办理医保业务使用，他用无效"
    ]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("预览")) {
                    if let watermarkedImage = viewModel.applyWatermark() {
                        Image(uiImage: watermarkedImage)
                            .resizable()
                            .scaledToFit()
                            .padding()
                    }
                }
                
                Section(header: Text("水印模板")) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(watermarkTemplates, id: \.self) { template in
                                Button(action: {
                                    viewModel.watermarkText = template
                                }) {
                                    Text(template)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .background(viewModel.watermarkText == template ? Color.blue : Color.gray.opacity(0.2))
                                        .foregroundColor(viewModel.watermarkText == template ? .white : .primary)
                                        .cornerRadius(8)
                                }
                            }
                        }
                        .padding(.vertical, 8)
                    }
                    
                    TextField("自定义水印文字", text: $viewModel.watermarkText)
                }
                
                Section(header: Text("水印设置")) {
                    VStack(alignment: .leading) {
                        Text("字体大小: \(Int(viewModel.watermarkSize))")
                        Slider(value: $viewModel.watermarkSize, in: 20...100)
                    }
                    
                    VStack(alignment: .leading) {
                        Text("不透明度: \(Int(viewModel.watermarkOpacity * 100))%")
                        Slider(value: $viewModel.watermarkOpacity, in: 0.1...1)
                    }
                    
                    VStack(alignment: .leading) {
                        Text("旋转角度: \(Int(viewModel.watermarkAngle))°")
                        Slider(value: $viewModel.watermarkAngle, in: -90...90)
                    }
                    
                    VStack(alignment: .leading) {
                        Text("间距: \(Int(viewModel.watermarkSpacing))")
                        Slider(value: $viewModel.watermarkSpacing, in: 50...200)
                    }
                }
                
                Section {
                    Button(action: {
                        if let watermarkedImage = viewModel.applyWatermark() {
                            UIImageWriteToSavedPhotosAlbum(watermarkedImage, nil, nil, nil)
                            dismiss()
                        }
                    }) {
                        Text("保存到相册")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                    }
                    .listRowBackground(Color.blue)
                }
            }
            .navigationTitle("编辑水印")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                viewModel.selectedImage = image
                if viewModel.watermarkText.isEmpty {
                    viewModel.watermarkText = watermarkTemplates[0]
                }
            }
        }
    }
}