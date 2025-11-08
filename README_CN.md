# flomo Quick Capture (v1.0.1)

一个简单高效的 Chrome 扩展，帮助你快速将网页内容发送到 flomo。

## 主要功能

### 快捷操作
- 快捷键 `Command+Shift+F`（Windows/Linux 为 `Ctrl+Shift+F`）快速打开侧边栏
- 点击浏览器工具栏的扩展图标打开侧边栏
- 按 `ESC` 键快速关闭侧边栏
- 支持拖拽调整侧边栏宽度

### 内容编辑
- 标签管理
  - 自动记录最近使用的标签（最多10个）
  - 点击历史标签快速添加
  - 支持空格分隔多个标签
- Markdown 支持
  - 支持基础 Markdown 语法
  - 自动补全有序及无序列表序号
  - Tab 键调整列表缩进
- 智能文本框
  - 高度自适应
  - 支持粘贴保持列表格式

### 页面信息
- 自动获取当前页面标题和 URL
- 支持编辑页面信息
- 支持从 Open Graph 和 Twitter 卡片获取标题

## 使用方法

1. 从 Chrome 应用商店安装 flomo Quick Capture
2. 首次使用需要设置 flomo API Key：
   - 点击扩展图标
   - 点击设置按钮（⚙️）
   - 粘贴你的 flomo API Key
3. 在任意网页使用以下方式打开：
   - 使用快捷键 `Command+Shift+F`
   - 或点击工具栏的扩展图标
4. 在侧边栏中：
   - 添加标签（支持历史标签快速选择）
   - 输入个人想法
   - 添加原文摘要
   - 编辑原文信息（如需要）
5. 点击"同步笔记到 flomo"完成保存

## 获取 API Key

1. 确保你已开通 flomo PRO 会员
2. 获取 API Key 的方式：
   - App：账号设置 --> API Key（复制链接）
   - Web：点击昵称 --> 扩展中心 & API --> API Key（复制链接）

## 隐私说明

- 仅获取当前页面的标题和 URL
- 所有数据直接发送到你的 flomo 账户
- API Key 仅保存在本地浏览器中
- 不会收集任何个人信息

## 问题反馈

如果你在使用过程中遇到问题或有建议：
- 即刻：[@iLeon](https://jike.city/leonzhang)
- X：[@leonthinking](https://twitter.com/leonthinking)
- 邮箱：thinkinghunt@163.com

## 更新日志

### v1.0.1
- 优化代码质量和性能
- 改进脚本注入机制，减少不必要的重复注入
- 提升 CSS 兼容性，支持更多浏览器
- 优化错误处理机制
- 添加详细的代码注释
- 移除调试日志，提升运行效率

### v1.0.0
- 首次发布
- 支持侧边栏操作
- 支持基础 Markdown 编辑
- 支持标签管理
- 支持页面信息自动获取
- 支持拖拽调整侧边栏宽度 