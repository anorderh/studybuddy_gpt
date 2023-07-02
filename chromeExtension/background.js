/**
 * Sends "LOAD" when valid Youtube video page detected
 */

chrome.tabs.onActivated.addListener(async (tab) => {
    // Store active tab.
    await chrome.storage.local.set({["tab"]: tab});
    console.log("active tab stored");
    console.log(tab);
})

chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) { // Valid YT video page found
        // Check for pre-existing content script -- inject if not found.
        let res = await chrome.storage.local.get(["video"]);
        console.log(res.video);
        if (res.video == null) {
            chrome.scripting.executeScript({
                target: {tabId : tabId},
                files: ["contentScript.js"],
            })
        }

        let newVideoID = tab.url.split("=")[1];
        await chrome.storage.local.set({["video"]: newVideoID});
    } else { // Invalid page -- reprime content script.
        chrome.storage.local.remove("videoID");
    }
});

chrome.tabs.onRemoved.addListener( async (tabID, removed) => {
    const { tab } = await chrome.storage.local.get(["tab"]);

    // Clearing temp data.
    if (tab.tabId === tabID) {
        await chrome.storage.local.remove(["tab"]);
        await chrome.storage.local.remove(["video"]);
    }
});