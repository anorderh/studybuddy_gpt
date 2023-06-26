/**
 * Sends "LOAD" when valid Youtube video page detected
 */
chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        console.log("bg fired!");
        chrome.tabs.sendMessage(tabId, {
            type: "LOAD",
        });
    }
});
