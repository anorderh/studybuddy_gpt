import {jsPDF} from "./jspdf.es.js"
import {getActiveTab} from "./utils.js";

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
    exportButton.addEventListener("click", async function() {
        console.log("export button pressed!");
        exportPDF(data);
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

async function exportPDF(data) {
    // Currently deciding between base jsPDF implementation or HTML-PDF using html2canvas
    let options = {
        orientation: "portrait",
        unit: "in",
        format: "a4"
    } // A4, W = 8.25, H = 11.75
    let doc = new jsPDF(options);
    doc.setTextColor(0); // black
    doc.setLineWidth(1 / 72); // ppi
    doc.setFont('arial');
    console.log(doc.getFontList());
    let docInfo = {
        width: 8.25,
        height: 11.75,
        vOffset: 0.5,
        hOffset: 0.5,
        pages: 1,
        heightLeft: 10.75
    }
    // let URIs = await grabDataURIs(data);
    // console.log(URIs);
    // URIs.forEach((URI) => {
    //     doc.addImage(URI, 'JPEG', 0, 0, 1.78, 1);
    // });

    writeTitle(data.info.title, doc, docInfo);
    for (let section of data.content) {
        writeHeading(section.heading, doc, docInfo);
        writeBody(section.body, doc, docInfo);
    }

    doc.save(`${data.info.title} StudyBuddyGPT Notes.pdf`);
}

function writeTitle(title, doc, info) {
    let titleFS = 30;
    let textlines = doc.setFontSize(titleFS)
        .setFont(undefined, 'bold')
        .splitTextToSize(title, 7.25);
    let size = (textlines.length + 0.5) * titleFS / 72;
    checkPageWrapping(size, doc, info);

    doc.text(info.width/2, info.vOffset + titleFS / 72, textlines, 'center')
    info.vOffset += size;
}

function writeHeading(heading, doc, info) {
    let headingFS = 24;
    let textlines = doc.setFontSize(headingFS)
        .setFont(undefined, 'normal')
        .splitTextToSize(heading, 7.25);
    let size = (textlines.length + 0.5) * headingFS / 72;
    checkPageWrapping(size, doc, info);

    doc.text(info.hOffset, info.vOffset + headingFS / 72, textlines)
    info.vOffset += size;
}

function writeBody(body, doc, info) {
    let bodyFS = 12;
    let textlines = doc.setFontSize(bodyFS)
        .setFont(undefined, 'normal')
        .splitTextToSize(body, 7.25);
    let size = (textlines.length + 0.5) * bodyFS / 72;
    checkPageWrapping(size, doc, info);

    doc.text(info.hOffset, info.vOffset + bodyFS / 72, textlines)
    info.vOffset += size;
}

function checkPageWrapping(size, doc, info) {
    if (size >= info.heightLeft) { // Overflow found -> new page!
        doc.addPage();

        // reset vOffset & repopulate heightLeft
        info.vOffset = 0.5;
        info.heightLeft = info.height - (info.vOffset*2);
    }
    info.heightLeft -= size;
}

async function grabDataURIs(data) {
    let activeTab = await getActiveTab();

    // Grabbing URIs
    let timestamps = data.content.map(section => section.timestamp)
    let URIs = await chrome.tabs.sendMessage(activeTab.id, {
        type: "SNAPSHOTS",
        timestamps: timestamps
    });

    return URIs;
}