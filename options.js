document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('save');
  const toast = document.getElementById('toast');

  // 添加回车键监听
  apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止默认的回车行为
      saveBtn.click(); // 触发保存按钮的点击事件
    }
  });

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

  // 显示 Toast 提示
  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      toast.className = 'toast';
    }, 3000);
  }

  // 加载已保存的 API Key
  try {
    const { apiKey = '' } = await chrome.storage.sync.get('apiKey');
    if (apiKey) {
      apiKeyInput.value = apiKey;
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }

  // 保存 API Key
  saveBtn.addEventListener('click', async () => {
    const inputKey = apiKeyInput.value.trim();

    if (!inputKey) {
      showToast('请输入 API Key', 'error');
      return;
    }

    const validation = validateApiKey(inputKey);
    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }

    try {
      // 保存清理后的 API Key
      await chrome.storage.sync.set({ apiKey: validation.cleanKey });
      showToast('保存成功！');
      
      // 更新输入框显示清理后的格式
      apiKeyInput.value = validation.cleanKey;
    } catch (error) {
      console.error('保存设置失败:', error);
      showToast('保存失败，请重试', 'error');
    }
  });

  // 添加输入提示
  const helpText = document.createElement('div');
  helpText.className = 'help-text';
  helpText.innerHTML = `
    <p>API Key 输入说明：</p>
    <p>1. 可直接粘贴完整的 flomo API 链接，例如：</p>
    <p>https://flomoapp.com/iwh/MzA3MTI5/7e6d87d5fb065ae2b7078235d262f3e1/</p>
    <p>2. 路径：</p>
    <p>- App：账号设置 -->> API Key （复制链接）</p>
    <p>- Web：点击昵称 -->> 扩展中心 & API -->> API Key （复制链接）</p>
    <p>注意：该功能需开通 flomo PRO 会员。</p>
  `;
  apiKeyInput.parentNode.insertBefore(helpText, apiKeyInput.nextSibling);
});