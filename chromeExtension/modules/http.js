import {readLocalStorage, setLocalStorage} from "./utils.js";

export async function sendHTTP(url){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');

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

    await saveTranscript(url, output); // Save transcript
    await setLocalStorage("running", false); // Return state to normal
    return output;
}

async function saveTranscript(url, output) {
    let transcripts = await readLocalStorage("transcripts");

    if (transcripts === undefined) { // No saved transcripts -- create new ict
        transcripts = {};
    }

    transcripts[url] = output;
    await setLocalStorage("transcripts", transcripts)
}