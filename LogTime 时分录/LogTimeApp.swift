import SwiftUI

@main
struct LogTimeApp: App {
    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            RecordView()
                .tabItem {
                    Label("记录", systemImage: "pencil.circle.fill")
                }
            
            ReviewView()
                .tabItem {
                    Label("回顾", systemImage: "chart.bar.fill")
                }
        }
    }
}

struct RecordView: View {
    var body: some View {
        NavigationView {
            Text("记录页面")
                .navigationTitle("记录")
        }
    }
}

struct MainTabView_Previews: PreviewProvider {
    static var previews: some View {
        MainTabView()
    }
}