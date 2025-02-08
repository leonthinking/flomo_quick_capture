// 获取 DOM 元素
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const settingsLink = document.getElementById('settingsLink');
const status = document.getElementById('status');

// 存储当前页面的内容和对话历史
let pageContent = '';
let conversationHistory = [];

// 打开设置页面
settingsLink.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  messageDiv.textContent = content;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 获取当前页面内容
async function getCurrentPageContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const result = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
  pageContent = result.content;
  return pageContent;
}

// 发送消息到 DeepSeek API
async function sendToDeepSeek(message) {
  try {
    // 获取配置信息
    const { baseUrl, apiKey } = await chrome.storage.sync.get(['baseUrl', 'apiKey']);
    if (!baseUrl || !apiKey) {
      throw new Error('请先在设置中配置 DeepSeek API 信息');
    }

    // 准备对话历史
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // 如果是第一条消息，添加页面内容作为上下文
    if (conversationHistory.length === 0) {
      messages.unshift({
        role: 'system',
        content: `以下是当前网页的内容，请基于这些内容回答用户的问题：\n${pageContent}`
      });
    }

    // 发送请求到 DeepSeek API
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error('API 请求失败');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // 更新对话历史
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: reply }
    );

    return reply;
  } catch (error) {
    throw new Error(`请求失败：${error.message}`);
  }
}

// 处理发送消息
async function handleSend() {
  const message = userInput.value.trim();
  if (!message) return;

  // 禁用输入和发送按钮
  userInput.disabled = true;
  sendButton.disabled = true;
  status.textContent = '正在处理...';

  try {
    // 如果是第一条消息，先获取页面内容
    if (conversationHistory.length === 0) {
      await getCurrentPageContent();
    }

    // 显示用户消息
    addMessage(message, true);
    userInput.value = '';

    // 发送到 DeepSeek API 并显示回复
    const reply = await sendToDeepSeek(message);
    addMessage(reply);
  } catch (error) {
    status.textContent = error.message;
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  } finally {
    // 恢复输入和发送按钮
    userInput.disabled = false;
    sendButton.disabled = false;
    status.textContent = '';
    userInput.focus();
  }
}

// 绑定事件监听器
sendButton.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// 初始化时清空状态
status.textContent = '';