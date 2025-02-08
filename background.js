// 注入所需的脚本和样式
async function injectDependencies(tab) {
  try {
    console.log('开始注入依赖项到标签页:', tab.id);
    
    // 检查是否可以在当前页面注入脚本
    const url = new URL(tab.url);
    if (!url.protocol.startsWith('http')) {
      console.warn('无法在此页面注入脚本:', url.protocol);
      return false;
    }

    // 先注入样式
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['sidebar.css']
      });
      console.log('CSS 注入成功');
    } catch (cssError) {
      console.error('CSS 注入失败:', cssError);
    }

    // 注入内容脚本
    try {
      console.log('开始注入 content.js');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      console.log('content.js 注入成功');
      
      // 等待脚本初始化
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 检查脚本是否正确初始化
      const checkResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          console.log('检查 flomoHelper 是否存在:', !!window.flomoHelper);
          return !!window.flomoHelper;
        }
      });
      
      console.log('脚本初始化检查结果:', checkResult);
      
      // 发送切换侧边栏的消息
      await chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
      console.log('切换侧边栏消息已发送');
      
      return true;
    } catch (error) {
      console.error('脚本注入或初始化失败:', error);
      return false;
    }
  } catch (error) {
    console.error('依赖项注入过程出错:', error);
    return false;
  }
}

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  console.log('扩展图标被点击，标签页:', tab.id);
  await injectDependencies(tab);
});

// 监听快捷键
chrome.commands.onCommand.addListener(async (command) => {
  console.log('收到快捷键命令:', command);
  if (command === 'toggle-sidebar') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await injectDependencies(tab);
      }
    } catch (error) {
      console.error('处理快捷键命令时出错:', error);
    }
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message);
  if (message.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
  }
});

// 首次安装或更新时的处理
chrome.runtime.onInstalled.addListener((details) => {
  console.log('扩展安装原因:', details.reason);
  if (details.reason === 'install') {
    try {
      chrome.runtime.openOptionsPage();
    } catch (error) {
      console.error('打开选项页面失败:', error);
    }
  }
});