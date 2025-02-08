# Flomo Helper Chrome 插件

## 项目简介

Flomo Helper 是一个 Chrome 浏览器插件，旨在帮助 Flomo 用户更高效地记录笔记。它提供了结构化的输入界面，支持标签历史记录，并能自动获取当前页面的标题和地址，让您的笔记记录更加便捷和规范。

## 主要功能

- 🔑 支持配置 Flomo API Key
- 📝 结构化输入界面（标签、个人想法、原文摘要）
- 🏷️ 标签历史记录和快速填充
- 🔄 记住上次使用的标签
- 📌 自动获取当前页面的标题和地址
- 🚀 一键同步到 Flomo

## 安装步骤

1. 下载本项目代码
2. 打开 Chrome 浏览器，进入扩展程序页面（chrome://extensions/）
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择本项目所在文件夹

## 使用说明

1. 首次使用时，点击插件图标 -> 「选项」，设置您的 Flomo API Key
2. 在任意网页点击插件图标，打开记录窗口
3. 输入标签（支持从历史记录中选择）
4. 填写个人想法和原文摘要
5. 点击「同步到 Flomo」按钮完成记录

## API 说明

本插件使用 Flomo 提供的 Webhook API：

```
POST https://flomoapp.com/iwh/[your-api-key]/
Content-Type: application/json

{
    "content": "笔记内容"
}
```

笔记内容格式：
```
#标签

个人想法

### 原文摘要
摘要内容

### 原文地址
《页面标题》: 页面地址
```

## 隐私说明

- API Key 仅保存在浏览器本地，不会上传到任何服务器
- 标签历史记录同样只保存在本地
- 插件仅在您主动使用时才会访问 Flomo API

## 技术栈

- HTML/CSS/JavaScript
- Chrome Extension API
- Flomo Webhook API

## 开发说明

- `manifest.json`: 插件配置文件
- `popup.html/js`: 弹出窗口界面和功能
- `options.html/js`: 选项页面，用于设置 API Key

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！