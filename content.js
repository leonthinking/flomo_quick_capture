/**
 * flomo Quick Capture 侧边栏类
 * 提供侧边栏界面和交互功能
 */

// 确保类只声明一次
if (!window.flomoSidebar) {
  class FlomoSidebar {
    constructor() {
      if (window.flomoHelper) {
        return window.flomoHelper;
      }
      
      this.isVisible = false;
      this.createSidebar();
      this.loadTags();
      this.initResizeHandle();
      this.setupMessageListener();
      
      // 保存实例
      window.flomoHelper = this;
    }

    /**
     * 设置消息监听器，接收来自 background 的消息
     */
    setupMessageListener() {
      // 移除之前的监听器（如果存在）
      if (this.messageHandler) {
        chrome.runtime.onMessage.removeListener(this.messageHandler);
      }
      
      // 创建新的消息处理函数
      this.messageHandler = (message, sender, sendResponse) => {
        if (message.action === 'toggleSidebar') {
          this.toggleSidebar();
          sendResponse({ success: true });
          return true;
        }
      };
      
      // 添加监听器
      chrome.runtime.onMessage.addListener(this.messageHandler);
    }

    /**
     * 创建侧边栏 DOM 结构
     */
    createSidebar() {
      const sidebar = document.createElement('div');
      sidebar.id = 'flomo-sidebar';
      sidebar.className = 'hidden';
      
      sidebar.innerHTML = `
        <div class="flomo-header">
          <h1>flomo Quick Capture</h1>
          <button class="flomo-settings-btn" id="flomo-settings" title="设置 API Key">⚙️</button>
          <button class="flomo-close-btn" id="flomo-close"></button>
        </div>
        <div class="flomo-resize-handle" id="flomo-resize"></div>
        
        <div class="flomo-input-group">
          <label class="flomo-label">标签：</label>
          <input type="text" id="flomo-tags" placeholder="如 #读书 ；多标签用空格分隔，如：#读书 #写作">
          <div class="flomo-tags-history" id="flomo-tags-history"></div>
        </div>
        
        <div class="flomo-input-group">
          <label class="flomo-label">个人想法：<span class="flomo-label-hint">支持 Markdown</span></label>
          <textarea id="flomo-thoughts" placeholder="现在的想法是..."></textarea>
        </div>
        
        <div class="flomo-input-group">
          <label class="flomo-label">原文摘要：<span class="flomo-label-hint">支持 Markdown</span></label>
          <textarea id="flomo-summary" placeholder="摘要原文金句，下次回顾时帮你启发新的思考。"></textarea>
        </div>
        
        <div class="flomo-input-group">
          <label class="flomo-label">原文标题及地址：</label>
          <textarea id="flomo-source"></textarea>
        </div>
        
        <button class="flomo-submit-btn" id="flomo-submit">同步到 flomo</button>
        <div id="flomo-error" class="flomo-error"></div>
        <div class="flomo-register-tip">
          还没有 flomo 账号？去<a href="https://flomoapp.com/register2/?MzA3MTI5" target="_blank">注册</a>
        </div>
      `;
      
      document.body.appendChild(sidebar);
      this.bindEvents();
    }

    /**
     * 初始化拖动调整侧边栏宽度的功能
     * 支持拖动左侧边缘调整宽度（300px - 800px）
     */
    initResizeHandle() {
      const handle = document.getElementById('flomo-resize');
      const sidebar = document.getElementById('flomo-sidebar');
      let startX, startWidth;

      handle.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startWidth = parseInt(getComputedStyle(sidebar).width, 10);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
      });

      const resize = (e) => {
        const width = startWidth - (e.clientX - startX);
        if (width > 300 && width < 800) {
          sidebar.style.width = `${width}px`;
          document.body.style.marginRight = `${width}px`;
        }
      };

      const stopResize = () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
      };
    }

    /**
     * 加载历史标签并显示在界面上
     */
    async loadTags() {
      const tags = await chrome.storage.sync.get(['tags']);
      const tagsHistory = document.getElementById('flomo-tags-history');
      tagsHistory.innerHTML = '';
      
      if (tags.tags) {
        const lastUsedTags = JSON.parse(tags.tags);
        lastUsedTags.forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.className = 'flomo-tag-item';
          tagElement.textContent = tag;
          tagElement.onclick = () => {
            const tagsInput = document.getElementById('flomo-tags');
            const currentTags = new Set(tagsInput.value.split(/\s+/).filter(Boolean));
            currentTags.add(tag);
            tagsInput.value = Array.from(currentTags).join(' ');
          };
          tagsHistory.appendChild(tagElement);
        });
      }
    }

    /**
     * 绑定所有事件监听器
     * 包括按钮点击、键盘快捷键、Markdown 编辑增强等
     */
    async bindEvents() {
      // 获取所有需要的元素
      const closeBtn = document.getElementById('flomo-close');
      const submitBtn = document.getElementById('flomo-submit');
      const settingsBtn = document.getElementById('flomo-settings');
      const sourceTextarea = document.getElementById('flomo-source');
      const registerTip = document.querySelector('.flomo-register-tip');

      // 检查 API Key 并显示/隐藏注册提示
      try {
        const result = await chrome.storage.sync.get(['apiKey']);
        if (registerTip) {
          registerTip.style.display = result.apiKey ? 'none' : 'block';
        }
      } catch (error) {
        // 忽略错误
      }

      // 添加事件监听器
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.toggleSidebar());
      }

      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitToFlomo());
      }

      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          chrome.runtime.sendMessage({ action: 'openOptions' });
        });
      }
      
      // 自动填充当前页面标题和URL
      if (sourceTextarea) {
        const pageTitle = document.querySelector('meta[property="og:title"]')?.content || 
                         document.querySelector('meta[name="twitter:title"]')?.content || 
                         document.title || '';
        sourceTextarea.value = `《${pageTitle}》: ${window.location.href}`;
        
        // 设置初始高度
        sourceTextarea.style.height = 'auto';
        sourceTextarea.style.height = (sourceTextarea.scrollHeight) + 'px';
      }

      // 监听快捷键
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isVisible) {
          this.toggleSidebar();
        }
      });

      // 添加 Markdown 编辑增强功能
      ['flomo-thoughts', 'flomo-summary'].forEach(id => {
        const textarea = document.getElementById(id);
        if (!textarea) {
          return;
        }
        
        // 自动调整高度
        const autoResize = () => {
          textarea.style.height = 'auto';
          textarea.style.height = (textarea.scrollHeight) + 'px';
        };

        // 处理按键事件
        textarea.addEventListener('keydown', (e) => {
          // 处理 Enter 键
          if (e.key === 'Enter') {
            const text = textarea.value;
            const pos = textarea.selectionStart;
            const lastNewLine = text.lastIndexOf('\n', pos - 1);
            const currentLine = text.slice(lastNewLine + 1, pos);
            
            // 获取当前行的缩进级别
            const indentMatch = currentLine.match(/^(\s*)/);
            const currentIndent = indentMatch ? indentMatch[1] : '';
            
            // 匹配有序列表
            const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
            if (orderedMatch) {
              e.preventDefault();
              const [, indent, num] = orderedMatch;
              const nextNumber = parseInt(num) + 1;
              const insertion = `\n${indent}${nextNumber}. `;
              const newText = text.slice(0, pos) + insertion + text.slice(pos);
              textarea.value = newText;
              textarea.selectionStart = textarea.selectionEnd = pos + insertion.length;
              autoResize();
              return;
            }

            // 匹配无序列表
            const unorderedMatch = currentLine.match(/^(\s*)[-*+]\s/);
            if (unorderedMatch) {
              e.preventDefault();
              const [, indent] = unorderedMatch;
              const insertion = `\n${indent}${currentLine.match(/[-*+]/)[0]} `;
              const newText = text.slice(0, pos) + insertion + text.slice(pos);
              textarea.value = newText;
              textarea.selectionStart = textarea.selectionEnd = pos + insertion.length;
              autoResize();
              return;
            }
          }

          // 处理 Tab 键
          if (e.key === 'Tab') {
            e.preventDefault();
            const text = textarea.value;
            const pos = textarea.selectionStart;
            const lastNewLine = text.lastIndexOf('\n', pos - 1);
            const currentLine = text.slice(lastNewLine + 1, pos);
            
            // 检查当前行是否是列表项
            const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/);
            if (listMatch) {
              // 在列表符号前添加两个空格作为缩进
              const [, indent, marker] = listMatch;
              const newIndent = e.shiftKey ? 
                indent.slice(2) : // 减少缩进
                indent + '  ';    // 增加缩进
              
              if (e.shiftKey && indent.length < 2) return; // 已经是最左边，不能再减少缩进
              
              const lineStart = lastNewLine + 1;
              const lineEnd = text.indexOf('\n', pos);
              const restOfLine = text.slice(lineStart + listMatch[0].length, lineEnd === -1 ? text.length : lineEnd);
              
              const newLine = `${newIndent}${marker} ${restOfLine}`;
              const newText = text.slice(0, lineStart) + newLine + text.slice(lineEnd === -1 ? text.length : lineEnd);
              
              textarea.value = newText;
              textarea.selectionStart = textarea.selectionEnd = lineStart + newLine.length;
              autoResize();
            } else {
              // 不是列表项，插入普通缩进
              const insertion = '  ';
              textarea.value = text.slice(0, pos) + insertion + text.slice(pos);
              textarea.selectionStart = textarea.selectionEnd = pos + insertion.length;
            }
          }
        });

        // 处理粘贴事件，保持列表格式
        textarea.addEventListener('paste', (e) => {
          const text = textarea.value;
          const pos = textarea.selectionStart;
          const lastNewLine = text.lastIndexOf('\n', pos - 1);
          const currentLine = text.slice(lastNewLine + 1, pos);
          
          // 如果在列表项中粘贴，确保粘贴的内容也保持列表格式
          const listMatch = currentLine.match(/^(\d+\.|[-*+])\s/);
          if (listMatch) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const listPrefix = listMatch[0];
            const formattedText = pastedText.split('\n')
              .map((line, index) => {
                if (index === 0) return line;
                if (listPrefix.match(/^\d+\./)) {
                  const num = parseInt(listPrefix) + index;
                  return `${num}. ${line.trim()}`;
                }
                return `${listPrefix}${line.trim()}`;
              })
              .join('\n');
            
            const newText = text.slice(0, pos) + formattedText + text.slice(pos);
            textarea.value = newText;
            textarea.selectionStart = textarea.selectionEnd = pos + formattedText.length;
            autoResize();
          }
        });

        // 监听输入事件，自动调整高度
        textarea.addEventListener('input', autoResize);
        
        // 初始化高度
        autoResize();
      });
    }

    /**
     * 显示提示消息
     * @param {string} message - 提示消息内容
     * @param {string} type - 消息类型（'success' 或 'error'）
     */
    showToast(message, type = 'success') {
      // 创建或获取 toast 容器
      let container = document.querySelector('.flomo-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'flomo-toast-container';
        document.body.appendChild(container);
      }

      // 创建新的 toast
      const toast = document.createElement('div');
      toast.className = `flomo-toast ${type}`;
      toast.textContent = message;
      
      // 添加到容器
      container.appendChild(toast);
      
      // 2秒后自动消失
      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
          toast.remove();
          // 如果容器为空，移除容器
          if (!container.children.length) {
            container.remove();
          }
        }, 300);
      }, 2000);
    }

    /**
     * 格式化 Markdown 内容
     * 统一列表格式、加粗和斜体语法
     * @param {string} content - 原始内容
     * @returns {string} - 格式化后的内容
     */
    formatMarkdown(content) {
      // 处理有序列表：确保数字后面有点和空格
      content = content.replace(/^(\d+)([.。])\s*/gm, '$1. ');
      
      // 处理无序列表：统一转换为减号
      content = content.replace(/^[*•+]\s*/gm, '- ');
      
      // 处理加粗：确保使用双星号
      content = content.replace(/\*\*(.+?)\*\*/g, '**$1**')
                      .replace(/__(.+?)__/g, '**$1**');
      
      // 处理斜体：统一使用单星号
      content = content.replace(/_(.+?)_/g, '*$1*');
      
      return content;
    }

    /**
     * 提交内容到 flomo
     * 包括标签、个人想法、原文摘要和原文地址
     */
    async submitToFlomo() {
      const tags = document.getElementById('flomo-tags').value.trim();
      const thoughts = this.formatMarkdown(document.getElementById('flomo-thoughts').value.trim());
      const summary = this.formatMarkdown(document.getElementById('flomo-summary').value.trim());
      const source = document.getElementById('flomo-source').value;

      // 保存使用的标签
      if (tags) {
        const savedTags = await chrome.storage.sync.get(['tags']);
        const newTags = tags.split(/\s+/).filter(Boolean);
        const lastUsedTags = savedTags.tags ? JSON.parse(savedTags.tags) : [];
        const uniqueTags = [...new Set([...newTags, ...lastUsedTags])].slice(0, 10);
        await chrome.storage.sync.set({
          tags: JSON.stringify(uniqueTags)
        });
        this.loadTags();
      }

      // 构建发送到flomo的内容
      const content = `${tags}\n\n${thoughts}\n\n### 原文摘要\n\n${summary.split('\n').map(line => {
        line = line.trim();
        // 如果行已经是列表项，直接返回
        if (line.startsWith('- ') || /^\d+\.\s/.test(line)) {
          return line;
        }
        // 否则添加无序列表符号
        return line ? `- ${line}` : '';
      }).filter(Boolean).join('\n')}\n\n### 原文地址\n\n${source}`;

      try {
        const result = await chrome.storage.sync.get(['apiKey']);
        if (!result.apiKey) {
          this.showToast('请先设置 flomo API Key', 'error');
          return;
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

        // 显示成功提示
        this.showToast('发送成功！');

        // 清空内容
        document.getElementById('flomo-thoughts').value = '';
        document.getElementById('flomo-summary').value = '';
        // 保留标签，方便连续记录相关内容
      } catch (error) {
        this.showToast(error.message, 'error');
      }
    }

    /**
     * 切换侧边栏显示/隐藏状态
     */
    toggleSidebar() {
      const sidebar = document.getElementById('flomo-sidebar');
      this.isVisible = !this.isVisible;
      
      if (this.isVisible) {
        sidebar.classList.remove('hidden');
        document.body.classList.add('flomo-sidebar-active');
      } else {
        sidebar.classList.add('hidden');
        document.body.classList.remove('flomo-sidebar-active');
      }
    }
  }
  
  // 将类绑定到 window 对象
  window.flomoSidebar = FlomoSidebar;
}

/**
 * 初始化侧边栏
 * 如果已经存在实例则直接返回，否则创建新实例
 */
function initializeSidebar() {
  try {
    // 如果已经存在实例，直接返回
    if (window.flomoHelper) {
      return window.flomoHelper;
    }

    // 创建新实例
    const sidebarInstance = new window.flomoSidebar();
    window.flomoHelper = sidebarInstance;
    return sidebarInstance;
  } catch (error) {
    // 初始化失败，静默处理
    return null;
  }
}

// 确保 DOM 加载完成后再初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
  });
} else {
  initializeSidebar();
}