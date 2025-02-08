// 创建并插入样式表
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('sidebar.css');
document.head.appendChild(link);

// 创建侧边栏
const sidebar = document.createElement('div');
sidebar.className = 'deepseek-sidebar collapsed';
sidebar.innerHTML = `
  <div class="deepseek-sidebar-header">
    <h2 style="margin: 0;">DeepSeek Reader</h2>
    <button id="deepseek-settings">设置</button>
  </div>
  <div class="deepseek-chat-container" id="deepseek-chat-container"></div>
  <div class="deepseek-input-container">
    <input type="text" class="deepseek-input" id="deepseek-input" placeholder="输入你的问题...">
    <button class="deepseek-send-button" id="deepseek-send">发送</button>
  </div>
`;

// 创建切换按钮
const toggleButton = document.createElement('button');
toggleButton.className = 'deepseek-sidebar-toggle collapsed';
toggleButton.textContent = '◀';

// 添加到页面
document.body.appendChild(sidebar);
document.body.appendChild(toggleButton);

// 切换侧边栏显示状态
toggleButton.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  toggleButton.classList.toggle('collapsed');
  toggleButton.textContent = sidebar.classList.contains('collapsed') ? '◀' : '▶';
});

// 存储对话历史
let conversationHistory = [];

// 从 storage 加载历史记录
chrome.storage.local.get(['conversationHistory'], (result) => {
  if (result.conversationHistory) {
    conversationHistory = result.conversationHistory;
    displayConversationHistory();
  } else {
    // 如果没有历史记录，显示欢迎消息
    addMessage('欢迎使用 DeepSeek Reader！我可以帮您分析和理解网页内容，请输入您的问题。');
  }
});

// 限制对话历史记录的数量
function limitConversationHistory() {
  const maxMessages = 50; // 最多保存50条消息
  if (conversationHistory.length > maxMessages) {
    conversationHistory = conversationHistory.slice(-maxMessages);
  }
}

// 显示对话历史
function displayConversationHistory() {
  const chatContainer = document.getElementById('deepseek-chat-container');
  chatContainer.innerHTML = '';
  conversationHistory.forEach(message => {
    addMessage(message.content, message.role === 'user');
  });
}

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
  const chatContainer = document.getElementById('deepseek-chat-container');
  const messageDiv = document.createElement('div');
  messageDiv.className = `deepseek-message ${isUser ? 'deepseek-user-message' : 'deepseek-bot-message'}`;
  messageDiv.textContent = content;
  
  const timestamp = document.createElement('div');
  timestamp.className = 'deepseek-timestamp';
  timestamp.textContent = new Date().toLocaleTimeString();
  messageDiv.appendChild(timestamp);
  
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    // 获取页面主要内容
    const content = document.body.innerText;
    
    // 获取页面中的图片信息
    const images = Array.from(document.images).map(img => ({
      src: img.src,
      alt: img.alt || '图片'
    }));

    // 组合文本和图片信息
    const pageContent = {
      title: document.title,
      url: window.location.href,
      content: content,
      images: images
    };

    sendResponse({ content: JSON.stringify(pageContent) });
  }
  return true; // 保持消息通道打开
});

// 发送消息处理
document.getElementById('deepseek-send').addEventListener('click', async () => {
  const input = document.getElementById('deepseek-input');
  const message = input.value.trim();
  if (!message) return;

  // 添加用户消息
  addMessage(message, true);
  input.value = '';

  // 更新对话历史
  conversationHistory.push({ role: 'user', content: message });

  try {
    // 发送消息到 background script 处理
    const response = await chrome.runtime.sendMessage({
      type: 'analyze',
      content: message
    });

    if (response.success) {
      const reply = response.reply;
      addMessage(reply);
      conversationHistory.push({ role: 'assistant', content: reply });

      // 保存对话历史到 storage
      chrome.storage.local.set({ conversationHistory });
    }
  } catch (error) {
    addMessage('抱歉，处理消息时出现错误：' + error.message);
  }
});

// 打开设置页面
document.getElementById('deepseek-settings').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'openOptions' });
});