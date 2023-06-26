import {getActiveTab} from "../modules/utils.js";
import {sendHTTP} from "../modules/http.js";

// Creating sections for sidepanel's content

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
 * Buttons for saving, exporting, and regenerating output
 * @returns {HTMLDivElement}
 */
function createOptions() {
    let options = document.createElement("div");
    options.className = "optionsBar";

    let buttons = {
        'Open All': "../assets/box-open.svg",
        'Save': "../assets/floppy-disk.svg",
        'Export': "../assets/download.svg",
        'Settings': "../assets/gear.svg"
    }

    for (const [key, value] of Object.entries(buttons)) {
        let button = document.createElement('button');
        button.className = "option";
        button.textContent = key;

        let img = document.createElement('img');
        img.src = value;
        button.prepend(img);
        options.appendChild(button);
    }

    return options
}

/**
 * List of blocks for each section w/ heading, timestamp, and body
 * @param tabID
 * @param content
 * @returns {HTMLDivElement}
 */
function createContentSection(tabID, content) {
    let res = document.createElement('div');

    content.forEach((section) => {
        res.appendChild(createHeadingBlock(tabID, section));
    })
    return res;
}

function createHeadingBlock(tabID, section) {
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
    let p = document.createElement('p');
    p.textContent = section.body;
    body.appendChild(p)
    container.appendChild(body);

    linkHeader(collapsible); // Adding collapsible heading functionality

    return container;
}

/**
 * Adding functionality to buttons (timestamps, close)
 */
function linkHeader(collapsible) {
    collapsible.addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

function linkClose(tabId) {
    let cancelButton = document.getElementById("close")

    cancelButton.addEventListener("click", async function() {
        chrome.tabs.sendMessage(tabId, {
            type: "CLOSE"
        });
    });
}

/**
 * Initialize sidepanel and unfocus external apps
 * @param tab                   current tab
 */
async function initData(tab, senderID) {
    let data = await sendHTTP(tab.url);
    linkClose(tab.id);

    let mainContainer = document.getElementById("output");
    mainContainer.innerHTML = "";

    // Adding new content to sidepanel
    mainContainer.appendChild(createInfoSection(data.info));
    mainContainer.appendChild(createOptions());
    mainContainer.appendChild(createContentSection(tab.id, data.content));

    // Close chrome extension extensionPopup
    chrome.extension.getViews({type: 'popup'}).forEach(v => v.close());

    // Open sidepanel
    chrome.tabs.sendMessage(tab.id, {
        type: "OPEN",
    });
}

// Begin initialization when script loaded
document.addEventListener('DOMContentLoaded', async () => {
    let activeTab = await getActiveTab();
    initData(activeTab);
});