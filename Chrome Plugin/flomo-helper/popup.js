document.addEventListener('DOMContentLoaded', async () => {
  // 获取页面元素
  const tagsInput = document.getElementById('tags');
  const tagHistory = document.getElementById('tagHistory');
  const thoughtsInput = document.getElementById('thoughts');
  const summaryInput = document.getElementById('summary');
  const titleInput = document.getElementById('title');
  const urlInput = document.getElementById('url');
  const submitBtn = document.getElementById('submit');
  const errorDiv = document.getElementById('error');
  const openOptionsBtn = document.getElementById('openOptions');
  const thoughtsSaveStatus = document.getElementById('thoughtsSaveStatus');
  const summarySaveStatus = document.getElementById('summarySaveStatus');

  // 从 storage 获取 API Key
  const { apiKey = '' } = await chrome.storage.sync.get('apiKey');
  console.log('当前保存的 API Key:', apiKey); // 添加调试日志
  
  if (!apiKey) {
    errorDiv.textContent = '请先在选项页面设置 API Key';
    submitBtn.disabled = true;
  }

  // 获取并显示标签历史
  const { tagHistory: tags = [] } = await chrome.storage.sync.get('tagHistory');
  renderTagHistory(tags);

  // 获取上次使用的标签和缓存的内容
  const { lastTag = '', cachedThoughts = '', cachedSummary = '' } = await chrome.storage.sync.get(['lastTag', 'cachedThoughts', 'cachedSummary']);
  tagsInput.value = lastTag;
  thoughtsInput.value = cachedThoughts;
  summaryInput.value = cachedSummary;

  // 获取当前页面信息
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      titleInput.value = tab.title || '';
      urlInput.value = tab.url || '';
    }
  } catch (error) {
    console.error('获取页面信息失败:', error);
    errorDiv.textContent = '获取页面信息失败';
  }

  // 渲染标签历史
  function renderTagHistory(tags) {
    tagHistory.innerHTML = tags
      .map(tag => `<div class="tag-item">${tag}</div>`)
      .join('');

    // 点击标签时填充到输入框
    document.querySelectorAll('.tag-item').forEach(item => {
      item.addEventListener('click', () => {
        tagsInput.value = item.textContent;
      });
    });
  }

  // 自动保存功能
  let thoughtsSaveTimeout;
  let summarySaveTimeout;
  let tagsSaveTimeout;

  tagsInput.addEventListener('input', () => {
    clearTimeout(tagsSaveTimeout);
    tagsSaveTimeout = setTimeout(async () => {
      try {
        await chrome.storage.sync.set({ lastTag: tagsInput.value });
      } catch (error) {
        console.error('保存标签失败:', error);
      }
    }, 1000);
  });

  thoughtsInput.addEventListener('input', () => {
    clearTimeout(thoughtsSaveTimeout);
    thoughtsSaveStatus.textContent = '正在保存...';
    thoughtsSaveTimeout = setTimeout(async () => {
      try {
        await chrome.storage.sync.set({ cachedThoughts: thoughtsInput.value });
        thoughtsSaveStatus.textContent = '已保存';
        setTimeout(() => {
          thoughtsSaveStatus.textContent = '';
        }, 2000);
      } catch (error) {
        console.error('保存想法失败:', error);
        thoughtsSaveStatus.textContent = '保存失败';
      }
    }, 1000);
  });

  summaryInput.addEventListener('input', () => {
    clearTimeout(summarySaveTimeout);
    summarySaveStatus.textContent = '正在保存...';
    summarySaveTimeout = setTimeout(async () => {
      try {
        await chrome.storage.sync.set({ cachedSummary: summaryInput.value });
        summarySaveStatus.textContent = '已保存';
        setTimeout(() => {
          summarySaveStatus.textContent = '';
        }, 2000);
      } catch (error) {
        console.error('保存摘要失败:', error);
        summarySaveStatus.textContent = '保存失败';
      }
    }, 1000);
  });

  // 保存标签到历史记录
  async function saveTag(tag) {
    const { tagHistory: tags = [] } = await chrome.storage.sync.get('tagHistory');
    const newTags = Array.from(new Set([tag, ...tags])).slice(0, 10);
    await chrome.storage.sync.set({ tagHistory: newTags, lastTag: tag });
  }

  // 格式化笔记内容
  function formatNote() {
    const tags = tagsInput.value.trim();
    const thoughts = thoughtsInput.value.trim();
    const summary = summaryInput.value.trim();
    const title = titleInput.value;
    const url = urlInput.value;

    return `${tags}\n\n${thoughts}\n\n### 原文摘要\n${summary}\n\n### 原文地址\n《${title}》: ${url}`;
  }

  // 打开设置页面
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // 验证 API Key 格式
  function validateApiKey(key) {
    // 尝试从 URL 中提取 API Key
    const urlMatch = key.match(/flomoapp\.com\/iwh\/([\w-]+\/[\w-]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }

    // 如果不是 URL，清理并验证格式
    const cleanKey = key.trim().replace(/^\/+|\/+$/g, '');
    const parts = cleanKey.split('/');
    
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return null;
    }
    
    return cleanKey;
  }

  // 提交笔记到 Flomo
  submitBtn.addEventListener('click', async () => {
    try {
      errorDiv.textContent = '';
      submitBtn.disabled = true;

      // 验证必填字段
      if (!tagsInput.value.trim()) {
        throw new Error('请输入标签');
      }

      if (!apiKey) {
        throw new Error('请先在选项页面设置 API Key');
      }

      // 验证 API Key 格式
      const validApiKey = validateApiKey(apiKey);
      if (!validApiKey) {
        throw new Error('API Key 格式错误，请在选项页面重新设置正确的 API Key');
      }

      // 保存标签到历史记录
      await saveTag(tagsInput.value.trim());

      // 发送请求到 Flomo API
      const content = formatNote();
      const webhookUrl = `https://flomoapp.com/iwh/${validApiKey}`;
      
      console.log('请求 URL:', webhookUrl);
      console.log('发送内容:', content);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content
        })
      });
      
      console.log('响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 405) {
          throw new Error('同步失败：请确保在选项页面输入了正确的 API Key');
        } else if (response.status === 404) {
          throw new Error('同步失败：API Key 无效，请检查是否正确');
        } else {
          throw new Error(`同步失败：HTTP ${response.status}`);
        }
      }
      
      // 只读取一次响应文本
      const responseText = await response.text();
      console.log('Flomo API 响应:', responseText);
      
      // 检查是否成功的逻辑
      let isSuccess = false;
      try {
        if (responseText.trim() === '') {
          isSuccess = true;  // 空响应视为成功
        } else {
          const responseData = JSON.parse(responseText);
          isSuccess = responseData.code === 0;
        }
      } catch (e) {
        // 如果不是 JSON 格式，检查是否包含 success 字符串
        isSuccess = responseText.includes('success');
      }
      
      console.log('响应内容检查结果:', {
        responseText,
        isSuccess
      });
      
      if (!isSuccess) {
        throw new Error(`同步失败：${responseText || '未知错误'}`);
      }

      // 清空输入框和缓存
      thoughtsInput.value = '';
      summaryInput.value = '';
      await chrome.storage.sync.remove(['cachedThoughts', 'cachedSummary']);

      errorDiv.textContent = '同步成功！';
      errorDiv.style.color = '#27ae60';
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.style.color = '#e74c3c';
    } finally {
      submitBtn.disabled = false;
    }
  });
});