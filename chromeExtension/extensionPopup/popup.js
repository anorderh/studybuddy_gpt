import {getActiveTab} from "../modules/utils.js";
import {readLocalStorage, removeFromStorage, setLocalStorage} from "../modules/storage.js";

let versionNum = "0.1"

function getErrorStatus() {
  let container = document.createElement("div")
  container.className = "statusContainer";

  let errorStatus = document.createElement("b");
  errorStatus.textContent = "Navigate to a YouTube video page.";
  errorStatus.className = "status";

  container.appendChild(errorStatus)

  return container
}

function getLoader() {
  let container = document.createElement("div");
  container.className = "loaderContainer"
  let loader = document.createElement("span");
  loader.className = "loader";

  container.appendChild(loader)

  return container;
}

/**
 * Action button
 * @param tab
 * @param container
 * @returns {Promise<HTMLElement>}
 */
async function newTranscriptButton(tab, container) {
  let button = document.createElement("div");
  button.id = "convert"; button.className = "icon-wrap"
  let img = document.createElement("img")
  img.className = "icon"; img.src = "../assets/pen-solid.svg";
  let label = document.createElement("div")
  label.textContent = "New document"

  button.appendChild(img);
  button.appendChild(label);

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
  let button = document.createElement("div");
  button.id = "useSaved"; button.className = "icon-wrap"
  let img = document.createElement("img")
  img.className = "icon"; img.src = "../assets/file-arrow-up-solid.svg";
  let label = document.createElement("div")
  label.textContent = "Use saved document"

  button.appendChild(img);
  button.appendChild(label);

  button.addEventListener("click", async () => {
    // Set as 'saved'' & msg content script
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

  let version = document.getElementById("version")
  version.textContent = `v. ${versionNum}`;

  let queryParams = activeURL.split("?")[1];
  let URLparams = new URLSearchParams(queryParams);
  let videoID = URLparams.get("v");
  let container = document.getElementById("action");
  let errorSymbol = document.getElementById("error")
  container.innerHTML = ""; // Clear content

  // Check for valid YT video page
  if (activeURL.includes("youtube.com/watch") && videoID) {
    errorSymbol.style.display = "none"
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
    errorSymbol.style.display = "block"
    container.appendChild(getErrorStatus());
  }
});