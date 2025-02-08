chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'download' && request.data) {
        chrome.downloads.download({
            url: request.data.url,
            filename: request.data.filename,
            saveAs: false
        });
    }
});