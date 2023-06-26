import {getActiveTab} from "../modules/utils.js";

async function readLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function(res) {
      resolve(res[key]);
    });
  });
}

function getLoader() {
  let loader = document.createElement("div");
  loader.className = "loader";

  return loader;
}

function getErrorStatus() {
  let errorStatus = document.createElement("b");
  errorStatus.textContent = "Not a valid Youtube video page.";
  errorStatus.className = "status";

  return errorStatus
}

/**
 * Action button
 * @param tab
 * @param container
 * @returns {Promise<HTMLElement>}
 */
async function initAction(tab, container) {
  let button = document.createElement("button");
  button.className = "button"; button.textContent = "Generate notes.";

  // Checking if http request is processing
  let state = await readLocalStorage("running");
  console.log(state);
  if (state != null && state) {
    alert("inside if statement");
    return getLoader();
  }

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
 * Checking URL and rendering available action (generate vs. 'invalid page')
 */
document.addEventListener('DOMContentLoaded', async () => {
  let activeTab = await getActiveTab();
  let activeURL = activeTab.url

  let queryParams = activeURL.split("?")[1];
  let URLparams = new URLSearchParams(queryParams);
  let videoID = URLparams.get("v");

  let container = document.getElementById("action");

  // Rendering dynamic HTML depending on YT link
  container.innerHTML = "";
  if (activeURL.includes("youtube.com/watch") && videoID) {
    container.appendChild(await initAction(activeTab, container));
  } else {
    container.appendChild(getErrorStatus());
  }
});