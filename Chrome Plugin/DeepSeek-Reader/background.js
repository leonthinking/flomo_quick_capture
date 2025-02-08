// 监听插件安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('DeepSeek Reader 插件已安装');
});

// 处理来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'analyze') {
    // 在这里处理文本分析请求
    console.log('收到分析请求:', request.content);
    // TODO: 实现与 DeepSeek API 的集成
    sendResponse({ success: true });
  }
  return true;
});