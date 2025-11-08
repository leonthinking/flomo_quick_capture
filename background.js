/**
 * 注入所需的脚本和样式到目标标签页
 * @param {Object} tab - Chrome 标签页对象
 * @returns {Promise<boolean>} - 注入是否成功
 */
async function injectDependencies(tab) {
  try {
    // 检查是否可以在当前页面注入脚本
    const url = new URL(tab.url);
    if (!url.protocol.startsWith('http')) {
      return false;
    }

    // 先注入样式
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['sidebar.css']
      });
    } catch (cssError) {
      // CSS 可能已经注入，继续执行
    }

    // 注入内容脚本
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // 等待脚本初始化
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 检查脚本是否正确初始化
      const checkResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => !!window.flomoHelper
      });
      
      // 发送切换侧边栏的消息
      await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
      
      return true;
    } catch (error) {
      // 脚本可能已经注入，尝试直接发送消息
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
        return true;
      } catch (msgError) {
        return false;
      }
    }
  } catch (error) {
    return false;
  }
}

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  await injectDependencies(tab);
});

// 监听快捷键
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-sidebar') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await injectDependencies(tab);
      }
    } catch (error) {
      // 忽略错误，可能是在不支持的页面
    }
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
  }
});

// 首次安装时打开设置页面
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    try {
      chrome.runtime.openOptionsPage();
    } catch (error) {
      // 忽略错误
    }
  }
});