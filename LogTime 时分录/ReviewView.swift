import SwiftUI

struct ReviewView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // 热力图卡片
                    VStack(alignment: .leading, spacing: 10) {
                        Text("热力图")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        HeatMapView()
                            .frame(height: 200)
                            .padding(.horizontal)
                    }
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 2)
                    .padding(.horizontal)
                    
                    // 时间统计卡片
                    HStack(spacing: 15) {
                        TimeStatCard(title: "工作", minutes: 19)
                        TimeStatCard(title: "学习", minutes: 19)
                    }
                    .padding(.horizontal)
                    
                    TimeStatCard(title: "读书", minutes: 19)
                        .padding(.horizontal)
                    
                    // 心情记录
                    VStack(alignment: .leading, spacing: 10) {
                        Text("心情记录")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        Rectangle()
                            .fill(Color(.systemGray6))
                            .frame(height: 100)
                            .cornerRadius(12)
                            .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("回顾")
            .background(Color(.systemGroupedBackground))
        }
    }
}

// 热力图视图
struct HeatMapView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("10月")
                Text("11月")
                Text("12月")
                Text("1月")
            }
            .font(.caption)
            .foregroundColor(.secondary)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 4), count: 7), spacing: 4) {
                ForEach(0..<70) { _ in
                    Rectangle()
                        .fill(Color.green.opacity(Double.random(in: 0...1)))
                        .frame(height: 20)
                        .cornerRadius(4)
                }
            }
        }
    }
}

// 时间统计卡片
struct TimeStatCard: View {
    let title: String
    let minutes: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.headline)
            
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text("\(minutes)")
                    .font(.system(size: 32, weight: .medium))
                Text("分钟")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Text("今天")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct ReviewView_Previews: PreviewProvider {
    static var previews: some View {
        ReviewView()
    }
}