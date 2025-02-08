// 保存设置到 Chrome 存储
function saveOptions() {
  const baseUrl = document.getElementById('baseUrl').value;
  const apiKey = document.getElementById('apiKey').value;

  chrome.storage.sync.set(
    {
      baseUrl: baseUrl,
      apiKey: apiKey,
    },
    () => {
      const status = document.getElementById('status');
      status.textContent = '设置已保存';
      status.className = 'status success';
      status.style.display = 'block';

      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    }
  );
}

// 从 Chrome 存储中恢复设置
function restoreOptions() {
  chrome.storage.sync.get(
    {
      baseUrl: '',
      apiKey: '',
    },
    (items) => {
      document.getElementById('baseUrl').value = items.baseUrl;
      document.getElementById('apiKey').value = items.apiKey;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);