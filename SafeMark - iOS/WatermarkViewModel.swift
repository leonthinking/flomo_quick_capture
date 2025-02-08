import SwiftUI

class WatermarkViewModel: ObservableObject {
    @Published var selectedImage: UIImage?
    @Published var watermarkText: String = ""
    @Published var watermarkFont: String = "Helvetica"
    @Published var watermarkSize: CGFloat = 80
    @Published var watermarkColor: Color = .black
    @Published var watermarkOpacity: Double = 0.5
    @Published var watermarkAngle: Double = -45
    @Published var watermarkSpacing: CGFloat = 500
    
    func applyWatermark() -> UIImage? {
        guard let image = selectedImage else { return nil }
        
        let renderer = UIGraphicsImageRenderer(size: image.size)
        let watermarkedImage = renderer.image { context in
            // 绘制原始图片
            image.draw(in: CGRect(origin: .zero, size: image.size))
            
            // 设置水印文字属性
            let attributes: [NSAttributedString.Key: Any] = [
                .font: UIFont(name: watermarkFont, size: watermarkSize) ?? .systemFont(ofSize: watermarkSize),
                .foregroundColor: UIColor(watermarkColor).withAlphaComponent(watermarkOpacity)
            ]
            
            let attributedString = NSAttributedString(string: watermarkText, attributes: attributes)
            
            // 计算水印大小和网格
            let watermarkSize = attributedString.size()
            let diagonalLength = sqrt(pow(image.size.width, 2) + pow(image.size.height, 2))
            let rows = Int(diagonalLength / (self.watermarkSpacing * 4.0)) + 1
            let cols = Int(diagonalLength / (self.watermarkSpacing * 4.0)) + 1
            
            // 计算偏移以使水印居中
            let offsetX = -diagonalLength / 2
            let offsetY = -diagonalLength / 2
            
            // 绘制水印
            context.cgContext.saveGState()
            
            // 移动到图片中心并旋转
            context.cgContext.translateBy(x: image.size.width / 2, y: image.size.height / 2)
            context.cgContext.rotate(by: CGFloat(watermarkAngle) * .pi / 180)
            
            for row in 0..<rows {
                for col in 0..<cols {
                    let x = offsetX + CGFloat(col) * self.watermarkSpacing
                    let y = offsetY + CGFloat(row) * self.watermarkSpacing
                    attributedString.draw(at: CGPoint(x: x, y: y))
                }
            }
            
            context.cgContext.restoreGState()
        }
        
        return watermarkedImage
    }
}
