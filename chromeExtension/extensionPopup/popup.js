import {getActiveTab} from "../modules/utils.js";
import {readLocalStorage, removeFromStorage, setLocalStorage} from "../modules/storage.js";

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

  button.addEventListener("click", async () => {
    // Add loader
    container.innerHTML = "";
    container.appendChild(getLoader());

    // Set as 'running' & msg content script
    await setLocalStorage("running", true);
    chrome.tabs.sendMessage(tab.id, {
      type: "START",
    });
  });

  return button;
}

async function savedTranscriptButton(tab, container, savedData) {
  let button = document.createElement("button");
  button.className = "button"; button.textContent = "Use saved transcript.";

  button.addEventListener("click", async () => {
    // Add loader
    container.innerHTML = "";
    container.appendChild(getLoader());

    // Set as 'running' & msg content script
    await setLocalStorage("running", true);
    await setLocalStorage("saved", savedData);
    chrome.tabs.sendMessage(tab.id, {
      type: "START",
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

      // Check if video already has generated transcript
      let transcripts = await readLocalStorage("transcripts");
      console.log(transcripts);
      if (transcripts && activeURL in transcripts) {
        container.appendChild(await savedTranscriptButton(activeTab, container, transcripts[activeURL]));
      }
    }
  } else {
    container.appendChild(getErrorStatus());
  }
});