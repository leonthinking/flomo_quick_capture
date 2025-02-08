document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('save');
  const messageDiv = document.getElementById('message');

  // 加载已保存的 API Key
  const { apiKey = '' } = await chrome.storage.sync.get('apiKey');
  apiKeyInput.value = apiKey;

  // 验证并提取 API Key
  function validateApiKey(input) {
    // 尝试从 URL 中提取 API Key
    const urlMatch = input.match(/flomoapp\.com\/iwh\/([\w-]+\/[\w-]+)/);
    if (urlMatch) {
      return {
        isValid: true,
        cleanKey: urlMatch[1]
      };
    }

    // 如果不是 URL，检查是否是直接的 API Key 格式
    const cleanKey = input.trim().replace(/^\/+|\/+$/g, '');
    const parts = cleanKey.split('/');
    
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return {
        isValid: false,
        message: 'API Key 格式错误：请输入完整的 Flomo API 链接或正确格式的 API Key'
      };
    }

    return {
      isValid: true,
      cleanKey
    };
  }

  // 保存 API Key
  saveBtn.addEventListener('click', async () => {
    const inputKey = apiKeyInput.value.trim();

    if (!inputKey) {
      messageDiv.textContent = '请输入 API Key';
      messageDiv.className = 'message error';
      return;
    }

    const validation = validateApiKey(inputKey);
    if (!validation.isValid) {
      messageDiv.textContent = validation.message;
      messageDiv.className = 'message error';
      return;
    }

    try {
      // 保存清理后的 API Key
      await chrome.storage.sync.set({ apiKey: validation.cleanKey });
      messageDiv.textContent = '保存成功！';
      messageDiv.className = 'message success';
      
      // 更新输入框显示清理后的格式
      apiKeyInput.value = validation.cleanKey;
    } catch (error) {
      messageDiv.textContent = '保存失败，请重试';
      messageDiv.className = 'message error';
    }
  });

  // 添加输入提示
  const helpText = document.createElement('div');
  helpText.className = 'help-text';
  helpText.innerHTML = `
    <p>API Key 输入说明：</p>
    <p>1. 可直接粘贴完整的 Flomo API 链接，例如：</p>
    <p>https://flomoapp.com/iwh/MzA3MTI5/7e6d87d5fb065ae2b7078235d262f3e1/</p>
    <p>2. 或输入 API Key 格式：用户ID/密钥</p>
  `;
  apiKeyInput.parentNode.insertBefore(helpText, apiKeyInput.nextSibling);
});