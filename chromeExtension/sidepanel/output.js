import {getActiveTab} from "../modules/utils.js";
import {addToStorageDict, readLocalStorage, removeFromStorage, setLocalStorage} from "../modules/storage.js";
import {sendHTTP} from "../modules/http.js";
import {showDialog} from "../modules/dialog.js";
import {deriveSettings} from "../modules/settings.js";
import {getButton} from "./toolbar.js";

// Creating sections for sidepanel's content
let activeTab;

async function initSidepanel(data) {
    initToolbar(data);
    initContent(data);

    chrome.extension.getViews({type: 'popup'}).forEach(v => v.close());
    chrome.tabs.sendMessage(activeTab.id, { // Open sidepanel
        type: "OPEN",
    });

    await removeFromStorage("saved"); // Clear for subsequent tasks
}

function initToolbar(data) {
    let toolbar = document.getElementById("toolbar");
    toolbar.innerHTML = "";
    let dialog = document.getElementById("popout");

    let close = getButton("close", true, async function() {
        chrome.tabs.sendMessage(activeTab.id, {
            type: "CLOSE"
        });
    });
    let minimize = getButton("mini", true, async function() {
        // to be implemented
    });
    let openAll = getButton("openAll", false, async function() {
        let state = openAll.classList.toggle("active");

        for (let collapsible of document.getElementsByClassName("collapsible")){
            let content = collapsible.nextElementSibling;
            collapsible.classList.toggle("active", state);
            if (state) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null
            }
        }
    });
    let regen = getButton("regen", false, async function() {
        await setLocalStorage("running", true);
        chrome.tabs.sendMessage(activeTab.id, {
            type: "CLOSE"
        });
        let data = await sendHTTP(activeTab.url, activeTab.id);
        await initSidepanel(data);
    });
    let save = getButton("save", false, async function() {
        console.log("save button pressed!");
        showDialog(dialog, "Saved!");
        await addToStorageDict("transcripts", activeTab.url, data);
    });
    let settings = getButton("settings", false, async function() {
        console.log("settings button pressed!");
        showDialog(dialog, "Settings", deriveSettings(data))
    });
    let logo = getButton("logo", false);

    // left side
    toolbar.appendChild(close);
    toolbar.appendChild(minimize);

    // right side
    toolbar.appendChild(logo);
    toolbar.appendChild(settings);
    toolbar.appendChild(save);
    toolbar.appendChild(regen);
    toolbar.appendChild(openAll);
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
    thumbnailCover.appendChild(createHeader(data.info));
    output.appendChild(createBody(activeTab.id, data.content));
}

/**
 * Info related to original token size, shortening cycles, and video
 * @param info
 * @returns {HTMLDivElement}
 */
function createHeader(info) {
    let container = document.createElement("div");
    container.id = "info"

    let thumbnail = document.createElement("img");
    thumbnail.className = "thumbnail";
    thumbnail.src = info.thumbnailURL;
    container.appendChild(thumbnail);

    return container
}

/**
 * List of blocks for each section w/ heading, timestamp, and body
 * @param tabID
 * @param content
 * @returns {HTMLDivElement}
 */
function createBody(tabID, content) {
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

// Fires when script loaded
document.addEventListener('DOMContentLoaded', async () => {
    activeTab = await getActiveTab();

    // Grab data -- if undefined, request server for processing
    let data = await readLocalStorage("saved");
    if (data === undefined) {
        data = await sendHTTP(activeTab.url, activeTab.id);
        console.log("Initiating new data request...")
    }

    await initSidepanel(data);
});
