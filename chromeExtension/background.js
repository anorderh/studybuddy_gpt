/**
 * Sends "LOAD" when valid Youtube video page detected
 */
import {getActiveTab} from "/modules/utils.js";
import {readLocalStorage, removeFromStorage} from "/modules/storage.js";

chrome.tabs.onActivated.addListener(async (tabId) => {
    console.log(tabId);
    console.log("activated!")
    console.log(`active tabID: ${(await getActiveTab()).id}`)
})

chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
    if (tab.url) { // Ignoring non-URL events
        console.log(tab);
        console.log("updated!")
        // Closing sidepanel if open
        // -close chrome api call
        if (tab.url.includes("youtube.com/watch")) { // Valid YT video page
            chrome.tabs.sendMessage(tabId, {
                type: "GRAB"
            });
        }
        // } else { // Invalid YT video page - reset running status.
        //     // await removeFromStorage("running")
        // }
    }
});

chrome.tabs.onRemoved.addListener( async (tabID, removed) => {
    let processing = await readLocalStorage("processing");
    console.log(processing);
    console.log(`remove invoked for ID ${tabID}`);

    // Clearing temp data.
    if (processing && tabID === processing) {
        console.log("cleared tab data!")
        await removeFromStorage("processing");
        await removeFromStorage("running");
    }
});