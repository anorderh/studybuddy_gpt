import {jsPDF} from "./jspdf.es.js"

export function deriveSettings(data) {
    let settings = document.createElement("div");

    // Create Export button
    let exportButton = document.createElement("div");
    exportButton.id = "export"; exportButton.className = "icon-wrap";
    let exportIcon = document.createElement("img");
    exportIcon.className = "icon"; exportIcon.src = "../assets/download-solid.svg";
    let exportLabel = document.createElement("p");
    exportLabel.textContent = "Export";

    exportButton.appendChild(exportIcon);
    exportButton.appendChild(exportLabel);
    exportButton.addEventListener("click", function() {
        console.log("export button pressed!");
        exportToPDF(data);
    });

    // Create black box with all information pulled from backend
    let infoContainer = document.createElement("div");
    infoContainer.id = "infoContainer";
    infoContainer.innerHTML = formatVideoInfo(data.info)

    settings.appendChild(exportButton);
    settings.appendChild(infoContainer);

    return settings;

    // Have Chrome extension license & Github & Twitter pages
}

function formatVideoInfo(info) {
    let output = "";
    try {
        console.log(info);
        output += `title: ${info['title']}<br/>`;
        output += `Time Elapsed: : ${info['timeElapsed']}s<br/>`;
        output += `Shortening Cycles: ${info['shorteningCycles']}<br/>`;
        output += `Original Word Count: ${info['origWordCount']}<br/>`;
        output += `Final Word Count: ${info['finalWordCount']}<br/>`;
        output += `Thumbnail URL: ${info['thumbnailURL']}<br/>`;
        output += '<br/>';

    } catch(e) {
        console.log("settings failed");
        for (const prop in info) {
            if (prop === 'timeElapsed') {
                output += 'timeElapsed: ${info[prop]}s';
            }
            output += `${prop}hello: ${info[prop]}<br/>`;
        }
    }

    return output;
}

function exportToPDF(data) {
    // Currently deciding between base jsPDF implementation or HTML-PDF using html2canvas

    let options = {
        orientation: "portaiot",
        unit: "pt",
        format: "a4"
    }
    let doc = new jsPDF(options);
    doc.setTextColor(0); // black

    writeTitle(doc, data.info.title);
    for (let section of data.content) {
        writeHeading(doc, section.heading);
        writeBody(doc, section.body);
    }

    doc.save(`${data.info.title} StudyBuddyGPT Notes.pdf`);
}

function writeTitle(doc, title) {
    doc.setLineWidth(3);
    doc.setFontSize(30);
    doc.text(title, 15, 15, {maxWidth: "400"})
}
function writeHeading(doc, heading) {
    doc.setLineWidth(3);
    doc.setFontSize(24);
    doc.text(heading, 15, 15, {maxWidth: "400"});
}

function writeBody(doc, body) {
    doc.setLineWidth(1);
    doc.setFontSize(12);
    doc.text(body, 15, 15, {maxWidth: "400"});
}