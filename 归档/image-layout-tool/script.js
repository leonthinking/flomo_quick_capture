// 全局变量
let uploadedImages = [];
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// 文件上传处理
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

// 画布尺寸选择
document.getElementById('canvasSize').addEventListener('change', handleCanvasSizeChange);

// 间距调整
const spacingInput = document.getElementById('spacing');
spacingInput.addEventListener('input', updateSpacingValue);

// 生成按钮
document.getElementById('generateBtn').addEventListener('click', generateCanvas);

// 导出按钮
document.getElementById('exportBtn').addEventListener('click', exportImage);

// 处理文件上传
async function handleFileUpload(event) {
    const files = event.target.files;
    const previewSection = document.getElementById('previewSection');
    previewSection.innerHTML = '';
    uploadedImages = [];

    for (let file of files) {
        // 验证文件类型
        if (!file.type.match('image/(jpeg|png)')) {
            alert('只支持 JPG 和 PNG 格式的图片');
            continue;
        }

        // 验证文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过 5MB');
            continue;
        }

        try {
            const image = await loadImage(file);
            uploadedImages.push(image);

            // 创建预览
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            const img = document.createElement('img');
            img.src = image.src;
            previewItem.appendChild(img);
            previewSection.appendChild(previewItem);
        } catch (error) {
            console.error('加载图片失败:', error);
        }
    }
}

// 加载图片
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 处理画布尺寸变化
function handleCanvasSizeChange() {
    const sizeSelect = document.getElementById('canvasSize');
    const customSize = document.getElementById('customSize');
    
    if (sizeSelect.value === 'custom') {
        customSize.style.display = 'block';
    } else {
        customSize.style.display = 'none';
    }
}

// 更新间距值显示
function updateSpacingValue() {
    const value = document.getElementById('spacing').value;
    document.getElementById('spacingValue').textContent = `${value}px`;
}

// 生成画布
function generateCanvas() {
    if (uploadedImages.length === 0) {
        alert('请先上传图片');
        return;
    }

    // 设置画布尺寸
    const sizeSelect = document.getElementById('canvasSize');
    let canvasWidth, canvasHeight;

    switch (sizeSelect.value) {
        case 'a4':
            canvasWidth = 2480;
            canvasHeight = 3508;
            break;
        case 'hd':
            canvasWidth = 1920;
            canvasHeight = 1080;
            break;
        case 'custom':
            canvasWidth = parseInt(document.getElementById('canvasWidth').value) || 1920;
            canvasHeight = parseInt(document.getElementById('canvasHeight').value) || 1080;
            break;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 清空画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 获取布局参数
    const layoutType = document.getElementById('layoutType').value;
    const spacing = parseInt(document.getElementById('spacing').value);

    // 根据布局类型排列图片
    switch (layoutType) {
        case 'horizontal':
            arrangeHorizontal(spacing);
            break;
        case 'vertical':
            arrangeVertical(spacing);
            break;
        case 'grid':
            arrangeGrid(spacing);
            break;
    }
}

// 水平排列
function arrangeHorizontal(spacing) {
    const totalWidth = uploadedImages.reduce((sum, img) => {
        const ratio = img.height / (canvas.height * 0.8);
        return sum + (img.width / ratio);
    }, 0) + (spacing * (uploadedImages.length - 1));

    let x = (canvas.width - totalWidth) / 2;
    const y = (canvas.height - canvas.height * 0.8) / 2;

    uploadedImages.forEach(img => {
        const ratio = img.height / (canvas.height * 0.8);
        const width = img.width / ratio;
        const height = canvas.height * 0.8;

        ctx.drawImage(img, x, y, width, height);
        x += width + spacing;
    });
}

// 垂直排列
function arrangeVertical(spacing) {
    const totalHeight = uploadedImages.reduce((sum, img) => {
        const ratio = img.width / (canvas.width * 0.8);
        return sum + (img.height / ratio);
    }, 0) + (spacing * (uploadedImages.length - 1));

    const x = (canvas.width - canvas.width * 0.8) / 2;
    let y = (canvas.height - totalHeight) / 2;

    uploadedImages.forEach(img => {
        const ratio = img.width / (canvas.width * 0.8);
        const width = canvas.width * 0.8;
        const height = img.height / ratio;

        ctx.drawImage(img, x, y, width, height);
        y += height + spacing;
    });
}

// 网格排列
function arrangeGrid(spacing) {
    const cols = Math.ceil(Math.sqrt(uploadedImages.length));
    const rows = Math.ceil(uploadedImages.length / cols);

    const cellWidth = (canvas.width - spacing * (cols + 1)) / cols;
    const cellHeight = (canvas.height - spacing * (rows + 1)) / rows;

    let index = 0;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (index >= uploadedImages.length) break;

            const img = uploadedImages[index];
            const x = spacing + col * (cellWidth + spacing);
            const y = spacing + row * (cellHeight + spacing);

            // 计算图片缩放比例
            const imgRatio = img.width / img.height;
            const cellRatio = cellWidth / cellHeight;

            let width, height;
            if (imgRatio > cellRatio) {
                width = cellWidth;
                height = width / imgRatio;
            } else {
                height = cellHeight;
                width = height * imgRatio;
            }

            // 居中绘制
            const xOffset = x + (cellWidth - width) / 2;
            const yOffset = y + (cellHeight - height) / 2;

            ctx.drawImage(img, xOffset, yOffset, width, height);
            index++;
        }
    }
}

// 导出图片
function exportImage() {
    if (!canvas.toDataURL) {
        alert('您的浏览器不支持图片导出功能');
        return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const link = document.createElement('a');
    link.download = `output_${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}