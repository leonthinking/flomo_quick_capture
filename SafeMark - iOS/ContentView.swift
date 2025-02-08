import SwiftUI
import PhotosUI

struct ContentView: View {
    @State private var selectedItem: PhotosPickerItem?
    @State private var selectedImage: UIImage?
    @State private var recentImages: [UIImage] = []
    @AppStorage("lastUsedDate") private var lastUsedDate: Double = Date().timeIntervalSince1970
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // 应用介绍部分
                    VStack(alignment: .leading, spacing: 12) {
                        Label("欢迎使用 SafeMark", systemImage: "checkmark.shield.fill")
                            .font(.title2)
                            .foregroundColor(.primary)
                        
                        Text("SafeMark 是一款专业的图片水印工具，帮助您轻松为图片添加防伪水印，保护您的图片安全。")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 2)
                    
                    // 功能说明部分
                    VStack(alignment: .leading, spacing: 15) {
                        Text("使用说明")
                            .font(.headline)
                        
                        ForEach(["选择需要添加水印的图片", "自定义水印文字和样式", "一键保存处理后的图片"], id: \.self) { step in
                            Label(step, systemImage: "arrow.right.circle")
                                .font(.subheadline)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 2)
                    
                    if let image = selectedImage {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFit()
                            .padding()
                        
                        NavigationLink(destination: WatermarkEditorView(image: image)) {
                            Text("添加水印")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.blue)
                                .cornerRadius(10)
                                .padding(.horizontal)
                        }
                    } else {
                        // 选择图片提示
                        VStack(spacing: 12) {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 50))
                                .foregroundColor(.blue)
                            Text("请选择一张图片")
                                .font(.title2)
                                .foregroundColor(.primary)
                            Text("支持 JPG、PNG 等常见图片格式")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .shadow(radius: 2)
                    }
                    
                    // 最近处理记录
                    if !recentImages.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("最近处理")
                                .font(.headline)
                                .padding(.horizontal)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 15) {
                                    ForEach(recentImages.indices, id: \.self) { index in
                                        Image(uiImage: recentImages[index])
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: 100, height: 100)
                                            .clipShape(RoundedRectangle(cornerRadius: 8))
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                        .padding(.vertical)
                    }
                    
                    PhotosPicker(
                        selection: $selectedItem,
                        matching: .images
                    ) {
                        Label("选择图片", systemImage: "photo")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(10)
                            .padding(.horizontal)
                    }
                }
                .navigationTitle("SafeMark")
            }
            .onChange(of: selectedItem) { newItem in
                Task {
                    if let data = try? await newItem?.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        selectedImage = image
                        // 更新最近处理记录
                        recentImages.insert(image, at: 0)
                        if recentImages.count > 5 {
                            recentImages.removeLast()
                        }
                        lastUsedDate = Date().timeIntervalSince1970
                    }
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
