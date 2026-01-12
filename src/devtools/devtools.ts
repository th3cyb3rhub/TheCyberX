// Create TheCyberX DevTools panel
chrome.devtools.panels.create(
    'TheCyberX',
    'icons/icon32.png',
    'src/devtools/panel.html',
    (panel) => {
        console.log('TheCyberX DevTools panel created');
    }
);

export { };
