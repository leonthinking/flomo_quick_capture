let lastUsedTags = [];

// 加载页面时获取当前标签页信息
document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tab = tabs[0];
    const sourceText = `《${tab.title}》: ${tab.url}`;
    document.getElementById('source').value = sourceText;
  });

  // 加载历史标签
  loadTags();

  // 监听快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.close();
    }
  });
});

// 加载标签历史
function loadTags() {
  chrome.storage.sync.get(['tags'], function(result) {
    if (result.tags) {
      lastUsedTags = JSON.parse(result.tags);
      updateTagHistory();
    }
  });
}

// 更新标签历史显示
function updateTagHistory() {
  const tagHistory = document.getElementById('tagHistory');
  tagHistory.innerHTML = '';
  
  lastUsedTags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.className = 'tag-item';
    tagElement.textContent = tag;
    tagElement.addEventListener('click', () => {
      const tagsInput = document.getElementById('tags');
      const currentTags = new Set(tagsInput.value.split(/\s+/).filter(Boolean));
      currentTags.add(tag);
      tagsInput.value = Array.from(currentTags).join(' ');
    });
    tagHistory.appendChild(tagElement);
  });
}

// 保存新标签到历史记录
function saveTags(tagsString) {
  const newTags = tagsString.split(/\s+/).filter(Boolean);
  const uniqueTags = [...new Set([...newTags, ...lastUsedTags])];
  lastUsedTags = uniqueTags.slice(0, 10);
  chrome.storage.sync.set({
    tags: JSON.stringify(lastUsedTags)
  });
  updateTagHistory();
}

// 提交到Flomo
document.getElementById('submit').addEventListener('click', async function() {
  const tags = document.getElementById('tags').value.trim();
  const thoughts = document.getElementById('thoughts').value.trim();
  const summary = document.getElementById('summary').value.trim();
  const source = document.getElementById('source').value;

  if (!tags && !thoughts && !summary) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = '请至少填写一项内容';
    errorElement.style.display = 'block';
    return;
  }

  // 保存使用的标签
  if (tags) {
    saveTags(tags);
  }

  // 构建发送到Flomo的内容
  const content = `${tags}\n\n${thoughts}\n\n### 原文摘要\n\n${summary.split('\n').map(line => line.trim() ? `- ${line}` : '').filter(Boolean).join('\n')}\n\n### 原文地址\n\n${source}`;

  try {
    const result = await chrome.storage.sync.get(['apiKey']);
    if (!result.apiKey) {
      throw new Error('请先设置 flomo API Key');
    }

    const response = await fetch(`https://flomoapp.com/iwh/${result.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content
      })
    });

    if (!response.ok) {
      throw new Error('发送失败，请检查 API Key 是否正确');
    }

    // 清空内容
    document.getElementById('thoughts').value = '';
    document.getElementById('summary').value = '';
    // 保留标签，方便连续记录相关内容

    const errorElement = document.getElementById('error');
    errorElement.style.display = 'none';
  } catch (error) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = error.message;
    errorElement.style.display = 'block';
  }
});