import {getActiveTab, readLocalStorage} from "../modules/utils.js";

function getErrorStatus() {
  let errorStatus = document.createElement("b");
  errorStatus.textContent = "Not a valid Youtube video page.";
  errorStatus.className = "status";

  return errorStatus
}

function getLoader() {
  let loader = document.createElement("div");
  loader.className = "loader";

  return loader;
}

/**
 * Action button
 * @param tab
 * @param container
 * @returns {Promise<HTMLElement>}
 */
async function newTranscriptButton(tab, container) {
  let button = document.createElement("button");
  button.className = "button"; button.textContent = "New transcript.";

  button.addEventListener("click", () => {
    // Add loader
    container.innerHTML = "";
    container.appendChild(getLoader());

    // Set as 'running' & msg content script
    chrome.storage.local.set({"running": true});
    chrome.tabs.sendMessage(tab.id, {
      type: "START",
      tab: tab
    });
  });

  return button;
}

async function savedTranscriptButton() {
  let button = document.createElement("button");
  button.className = "button"; button.textContent = "Use saved transcript.";

  button.addEventListener("click", () => {
    // Add loader
    container.innerHTML = "";
    container.appendChild(getLoader());

    // Set as 'running' & msg content script
    chrome.storage.local.set({"running": true});
    chrome.tabs.sendMessage(tab.id, {
      type: "START",
      url: tab.url,
    });
  });

  return button;
}

/**
 * Checking URL and rendering available action
 */
document.addEventListener('DOMContentLoaded', async () => {
  let activeTab = await getActiveTab();
  let activeURL = activeTab.url

  let queryParams = activeURL.split("?")[1];
  let URLparams = new URLSearchParams(queryParams);
  let videoID = URLparams.get("v");
  let container = document.getElementById("action");
  container.innerHTML = ""; // Clear content

  // Check for valid YT video page
  if (activeURL.includes("youtube.com/watch") && videoID) {
    let state = await readLocalStorage("running");

    // Check ongoing state
    if (state != null && state) {
      container.appendChild(getLoader());
    } else {
      container.appendChild(await newTranscriptButton(activeTab, container));

      // Check for pre-existing transcript
      if (await readLocalStorage("saved") != null) {
        container.appendChild(await savedTranscriptButton());
      }
    }
  } else {
    container.appendChild(getErrorStatus());
  }
});