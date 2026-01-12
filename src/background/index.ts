// TheCyberX Background Service Worker
// Handles extension lifecycle and messaging

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('TheCyberX extension installed');
    } else if (details.reason === 'update') {
        console.log('TheCyberX extension updated');
    }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_CURRENT_TAB') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            sendResponse({ tab: tabs[0] });
        });
        return true; // Keep channel open for async response
    }

    if (message.type === 'GET_COOKIES') {
        chrome.cookies.getAll({ url: message.url }, (cookies) => {
            sendResponse({ cookies });
        });
        return true;
    }
});

export { };
