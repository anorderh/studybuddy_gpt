/**
 * Sends "LOAD" when valid Youtube video page detected
 */
import {getActiveTab, readLocalStorage, setLocalStorage} from "/modules/utils.js";

async function updateTab() {
    // Store active tab.
    let activeTab = await getActiveTab();
    await setLocalStorage("tab", activeTab);
}

chrome.tabs.onActivated.addListener(async (tab) => {
    await updateTab();
})

chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
    console.log(tab);
    if (tab.status === 'loading') {
        if (tab.url && tab.url.includes("youtube.com/watch")) { // Valid YT video page
            chrome.tabs.sendMessage(tabId, {
                type: "GRAB"
            });
        } else { // Invalid YT video page - reset running status.
            chrome.storage.local.remove(["running"]);
        }
    } else {
        await updateTab();
    }
});

chrome.tabs.onRemoved.addListener( async (tabID, removed) => {
    let tab = await readLocalStorage("tab");

    // Clearing temp data.
    if (tab.tabId === tabID) {
        await chrome.storage.local.remove(["running"]);
        await chrome.storage.local.remove(["tab"]);
    }
});