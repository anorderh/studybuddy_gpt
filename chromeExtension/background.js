/**
 * Sends "LOAD" when valid Youtube video page detected
 */
import {readLocalStorage, removeFromStorage} from "/modules/storage.js";

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