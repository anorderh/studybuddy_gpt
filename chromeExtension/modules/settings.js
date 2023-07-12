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
    let options = {
        orientation: "portrait",
        unit: "in",
        format: [8.5, 11]
    } // A4, W = 8.5, H = 11
    let doc = new jsPDF(options);
    doc.setTextColor(0); // black
    doc.setLineWidth(1 / 72); // ppi
    doc.setFont('Times');
    console.log(doc.getFontList());
    let docInfo = {
        width: 8.5, height: 11,
        vOffset: 1, hOffset: 1,
        pages: 1,
        heightLeft: 9,
        imgLoc: "left", imgHeight: 1.687, imgWidth: 3,
        hPadding: 0.15,
    }

    // Getting snapshots for each section
    let URIs = await grabDataURIs(data);
    console.log(URIs);

    // Rendering PDF sections
    writeTitle(data.info.title, doc, docInfo);
    for (let i = 0; i < data.content.length; i++) {
        writeHeading(data.content[i].heading, doc, docInfo);
        if (i%3 === 0) {
            writeBodyWithImage(data.content[i].body, URIs[i], doc, docInfo)
        } else {
            writeBody(data.content[i].body, doc, docInfo);
        }
    }
    // for (let section of data.content) {
    //     writeHeading(section.heading, doc, docInfo);
    //     writeBody(section.body, doc, docInfo);
    // }

    doc.save(`${data.info.title} StudyBuddyGPT Notes.pdf`);
}

function writeTitle(title, doc, info) {
    let titleFS = 24;
    let PPI = 72; // pixels per inch
    let textlines = doc.setFontSize(titleFS)
        .setFont(undefined, 'bold')
        .splitTextToSize(title, info.width - (2*info.hOffset));
    let size = (textlines.length + 0.5) * titleFS / PPI;
    checkPageWrapping(size, doc, info);

    doc.text(info.width/2, info.vOffset + titleFS / PPI, textlines, 'center')
    info.vOffset += size;
}

function writeHeading(heading, doc, info) {
    let headingFS = 16;
    let PPI = 72; // pixels per inch
    let textlines = doc.setFontSize(headingFS)
        .setFont(undefined, 'normal')
        .splitTextToSize(heading, info.width - (2*info.hOffset));
    let size = (textlines.length + 0.5) * headingFS / PPI;
    checkPageWrapping(size, doc, info);

    doc.text(info.hOffset, info.vOffset + headingFS / PPI, textlines)
    info.vOffset += size;
}

function writeBody(body, doc, info) {
    let bodyFS = 12;
    let PPI = 72; // pixels per inch
    let textlines = doc.setFontSize(bodyFS)
        .setFont(undefined, 'normal')
        .splitTextToSize(body, info.width - (2*info.hOffset));
    let size = (textlines.length + 0.5) * bodyFS / PPI;
    checkPageWrapping(size, doc, info);

    doc.text(info.hOffset, info.vOffset + bodyFS / PPI, textlines)
    info.vOffset += size;
}

function writeBodyWithImage(body, URI, doc, info) {
    let bodyFS = 12;
    let PPI = 72; // pixels per inch
    let textlines = doc.setFontSize(bodyFS)
        .setFont(undefined, 'normal')
        .splitTextToSize(body, info.width - (2*info.hOffset) - info.imgWidth - info.hPadding);
    let size = (textlines.length + 0.5) * bodyFS / PPI;
    let imgSize = info.imgHeight + (2 * bodyFS / PPI)
    checkPageWrapping(size, doc, info, true, imgSize);

    // Determining text & img horizontal offset
    let textHoriOffset; let imgHoriOffset;
    if (info.imgLoc === "right") {
        textHoriOffset = info.hOffset;
        imgHoriOffset = info.width - info.hOffset - info.imgWidth;
        info.imgLoc = "left";
    } else {
        textHoriOffset = info.hOffset + info.imgWidth + info.hPadding;
        imgHoriOffset = info.hOffset
        info.imgLoc = "right";
    }

    // Adding section img
    doc.addImage(URI,
        'JPEG',
        imgHoriOffset,
        info.vOffset + bodyFS / PPI,
        info.imgWidth,
        info.imgHeight);

    doc.text(textHoriOffset, info.vOffset + bodyFS / PPI, textlines)
    info.vOffset += size > imgSize ? size : imgSize;
}

function checkPageWrapping(size, doc, info, img=false, imgSize=null) {
    // Check for overflow from text (AND img, if present)
    if (size > info.heightLeft || (img && info.imgHeight > info.heightLeft)) { // Overflow found -> new page!
        doc.addPage();

        // reset vOffset & repopulate heightLeft
        info.vOffset = 1;
        info.heightLeft = info.height - (info.vOffset*2);
    }

    // Reduce height - if img present, factor imgHeight
    info.heightLeft -= (img ? Math.max(size, imgSize) : size);
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