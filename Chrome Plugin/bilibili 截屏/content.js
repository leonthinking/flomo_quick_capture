// 创建悬浮按钮
function createFloatingButton() {
    console.log('开始创建悬浮按钮');
    try {
        // 检查是否已存在按钮
        if (document.getElementById('bilibiliScreenshotBtn')) {
            console.log('按钮已存在，跳过创建');
            return;
        }

        const button = document.createElement('button');
        button.id = 'bilibiliScreenshotBtn';
        button.innerHTML = '截图';
        button.style.cssText = 'position: fixed; right: 20px; top: 50%; transform: translateY(-50%); z-index: 9999;';
        document.body.appendChild(button);
        console.log('悬浮按钮创建成功');

        // 添加点击事件
        button.addEventListener('click', captureScreenshot);
    } catch (error) {
        console.error('创建悬浮按钮时发生错误:', error);
    }
}

// 截取视频画面
async function captureScreenshot() {
    const video = document.querySelector('.bpx-player-video-wrap video');
    if (!video) {
        alert('未找到视频元素');
        return;
    }

    // 创建 canvas 并绘制视频当前帧
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
        // 将 canvas 转换为图片数据
        const imageData = canvas.toDataURL('image/png');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `bilibili-screenshot-${timestamp}.png`;

        // 使用 Chrome 下载 API 保存图片
        chrome.runtime.sendMessage({
            type: 'download',
            data: {
                url: imageData,
                filename: filename
            }
        });

        // 显示成功提示
        showNotification('截图成功！');
    } catch (error) {
        console.error('截图失败:', error);
        showNotification('截图失败，请重试');
    }
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'screenshot-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // 2秒后移除通知
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// 使用MutationObserver监听DOM变化
function init() {
    // 先尝试创建按钮
    const video = document.querySelector('.bpx-player-video-wrap video');
    if (video) {
        createFloatingButton();
        return;
    }

    // 如果没有找到视频元素，则开始观察DOM变化
    const observer = new MutationObserver((mutations, obs) => {
        const video = document.querySelector('.bpx-player-video-wrap video');
        if (video) {
            createFloatingButton();
            obs.disconnect();
            console.log('找到视频元素，创建截图按钮');
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    console.log('开始监听DOM变化');
}

// 确保DOM加载完成后执行初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}