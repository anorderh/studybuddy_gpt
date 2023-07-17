import {getActiveTab} from "../modules/utils.js";
import {addToStorageDict, readLocalStorage, removeFromStorage, setLocalStorage} from "../modules/storage.js";
import {sendHTTP} from "../modules/http.js";
import {showDialog} from "../modules/dialog.js";
import {deriveSettings} from "../modules/settings.js";

// Creating sections for sidepanel's content
let activeTab;

/**
 * Info related to original token size, shortening cycles, and video
 * @param info
 * @returns {HTMLDivElement}
 */
function createInfoSection(info) {
    let container = document.createElement("div");
    container.id = "info"

    let thumbnail = document.createElement("img");
    thumbnail.className = "thumbnail";
    thumbnail.src = info.thumbnailURL;
    container.appendChild(thumbnail);

    // let stats = document.createElement("ul");
    // stats.className = "stats";
    // let infoTexts = [
    //     `Generated in ${info.timeElapsed} s`,
    //     `Original transcript length: ${info.wordCount[0]} words`,
    //     `Shortened ${info.shorteningCycles} times to ${info.wordCount[1]} words`
    // ];
    // infoTexts.forEach((text) => {
    //     let info = document.createElement("li");
    //     info.className = "info";
    //     info.textContent = text;
    //     stats.appendChild(info);
    // });
    // container.appendChild(stats);

    return container
}

/**
 * List of blocks for each section w/ heading, timestamp, and body
 * @param tabID
 * @param content
 * @returns {HTMLDivElement}
 */
function createContentSection(tabID, content) {
    let result = document.createElement('div');

    // Creating blocks for each section
    content.forEach((section) => {
        let container = document.createElement('div');
        container.className = "headingContainer";

        // timestamp
        let div = document.createElement("div");
        let timestamp = document.createElement('p');
        timestamp.className = "timestamp";
        timestamp.textContent = new Date(parseInt(section.timestamp) * 1000).toISOString().slice(14, 19);
        timestamp.addEventListener("click", async function() {
            chrome.tabs.sendMessage(tabID, {
                type: "PLAY",
                timestamp: section.timestamp
            });
        });
        div.appendChild(timestamp)
        container.appendChild(div);

        // heading
        let collapsible = document.createElement('button');
        collapsible.className = "collapsible";
        collapsible.textContent = section.heading
        container.appendChild(collapsible);

        // body
        let body = document.createElement('div');
        body.className = "body";
        let p = document.createElement('md-block');
        p.textContent = section.body;
        body.appendChild(p)
        container.appendChild(body);

        collapsible.addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });

        result.appendChild(container);
    })
    return result;
}

function initTaskbar(data) {
    let dialog = document.getElementById("popout");

    let cancelButton = document.getElementById("close")
    cancelButton.addEventListener("click", async function() {
        chrome.tabs.sendMessage(activeTab.id, {
            type: "CLOSE"
        });
    });

    let regenButton = document.getElementById("regen")
    regenButton.addEventListener("click", async function() {
        await setLocalStorage("running", true);
        chrome.tabs.sendMessage(activeTab.id, {
            type: "CLOSE"
        });
        let data = await sendHTTP(activeTab.url, activeTab.id);
        initContent(data);
    });

    let saveButton = document.getElementById("save")
    saveButton.addEventListener("click", async function() {
        console.log("save button pressed!");
        showDialog(dialog, "Saved!");
        await addToStorageDict("transcripts", activeTab.url, data);
    });

    // settingsButton placeholder -- implement later.
    let settingsButton = document.getElementById("settings");
    settingsButton.addEventListener("click", async function() {
        console.log("settings button pressed!");
        showDialog(dialog, "Settings", deriveSettings(data))
    })
}

/**
 * Initialize sidepanel and unfocus external apps
 * @param data                  data to be outputted
 */
function initContent(data) {
    let thumbnailCover = document.getElementById("tbCover");
    let output = document.getElementById("output");
    thumbnailCover.innerHTML = ""; output.innerHTML = "";

    // Adding new content to sidepanel
    thumbnailCover.appendChild(createInfoSection(data.info));
    output.appendChild(createContentSection(activeTab.id, data.content));

    initTaskbar(data);

    chrome.extension.getViews({type: 'popup'}).forEach(v => v.close());
    chrome.tabs.sendMessage(activeTab.id, { // Open sidepanel
        type: "OPEN",
    });
}

// Fires when script loaded
document.addEventListener('DOMContentLoaded', async () => {
    activeTab = await getActiveTab();

    // Grab data -- if undefined, request server for processing
    let data = await readLocalStorage("saved");
    if (data === undefined) {
        data = await sendHTTP(activeTab.url, activeTab.id);
        console.log("Initiating new data request...")
    }
    initContent(data);

    await removeFromStorage("saved"); // Clear for subsequent tasks
});