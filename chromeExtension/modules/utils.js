export async function getActiveTab() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });

    return tabs[0];
}

export function countInstances(string, word) {
    return string.split(word).length - 1;
}