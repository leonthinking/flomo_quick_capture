# flomo Quick Capture (v1.0.1)

A simple and efficient Chrome extension that helps you quickly send web content to flomo App.

## Main Features

### Quick Actions
- Shortcut key `Command+Shift+F` (Windows/Linux: `Ctrl+Shift+F`) to quickly open the sidebar
- Click the browser toolbar extension icon to open the sidebar
- Press `ESC` key to quickly close the sidebar
- Support drag to adjust sidebar width

### Content Editing
- Tag Management
  - Automatically record recently used tags (up to 10)
  - Quick add by clicking history tags
  - Support multiple tags separated by spaces
- Markdown Support
  - Support basic Markdown syntax
  - Auto-complete ordered and unordered list numbers
  - Tab key to adjust list indentation
- Smart Text Box
  - Height auto-adjustment
  - Support pasting while maintaining list format

### Page Information
- Automatically get current page title and URL
- Support editing page information
- Support getting title from Open Graph and Twitter cards

## How to Use

1. Install flomo Quick Capture from Chrome Web Store
2. First-time setup requires setting flomo API Key:
   - Click the extension icon
   - Click the settings button (⚙️)
   - Paste your flomo API Key
3. Open in any webpage using:
   - Shortcut key `Command+Shift+F`
   - Or click the toolbar extension icon
4. In the sidebar:
   - Add tags (supports quick selection from history)
   - Input personal thoughts
   - Add original text summary
   - Edit source information (if needed)
5. Click "Sync to flomo" to save

## Get API Key

1. Make sure you have activated flomo PRO membership
2. Ways to get API Key:
   - App: Account Settings --> API Key (copy link)
   - Web: Click nickname --> Extension Center & API --> API Key (copy link)

## Privacy Statement

- Only gets current page title and URL
- All data is sent directly to your flomo account
- API Key is stored only in local browser
- No personal information is collected

## Feedback

If you encounter any issues or have suggestions:
- JiKe: [@iLeon](https://jike.city/leonzhang)
- X: [@leonthinking](https://twitter.com/leonthinking)
- Email: thinkinghunt@163.com

## Changelog

### v1.0.1
- Optimized code quality and performance
- Improved script injection mechanism to reduce unnecessary re-injection
- Enhanced CSS compatibility for more browsers
- Optimized error handling mechanism
- Added detailed code comments
- Removed debug logs for better performance

### v1.0.0
- Initial release
- Support sidebar operations
- Support basic Markdown editing
- Support tag management
- Support automatic page information retrieval
- Support drag to adjust sidebar width