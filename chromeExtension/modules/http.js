import {addToStorageDict, addToStorageList, removeFromStorage, setLocalStorage} from "./storage.js";

export async function sendHTTP(url, tabID){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');

    await setLocalStorage("processing", tabID); // Flag tabID as processing

    let response = await fetch('http://127.0.0.1:5000/process', {
        signal: AbortSignal.timeout(60000), // 60s timeout
        method: "POST",
        mode: "cors",
        body: JSON.stringify({
            url: url
        }),
        headers: headers,
    });
    let output = await response.text();
    output = JSON.parse(output)

    await removeFromStorage("processing"); // Remove processing flag
    await setLocalStorage("running", false); // Return state to normal
    return output;
}