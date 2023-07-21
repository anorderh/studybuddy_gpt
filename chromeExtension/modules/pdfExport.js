import {getActiveTab} from "./utils.js";
import {jsPDF} from "./jspdf.es.js"

export async function exportPDF(data) {
    console.log(data);
    let options = {
        orientation: "portrait",
        unit: "in",
        format: [8.5, 11]
    } // A4, W = 8.5, H = 11
    let doc = new jsPDF(options);
    doc.setTextColor(0); // black
    doc.setLineWidth(1 / 72); // ppi
    doc.setFont('Times');
    doc.setFontSize(12);
    let docInfo = {
        width: 8.5, height: 11,
        vOffset: 1, hOffset: 1,
        pages: 1,
        heightLeft: 9,
        imgLoc: "left", imgHeight: 1.687, imgWidth: 3,
        padding: 0.1
    }

    // Rendering StudybuddyGPT stamp
    writeStamp("../assets/logo.jpeg", doc, docInfo)

    // Rendering PDF sections
    writeTitle(data.info.title, doc, docInfo);
    writeLink(data.info['URL'], doc, docInfo);

    // Parsing sections
    for (let i = 0; i < data.content.length; i++) {
        let section = data.content[i];

        writeHeading(section.heading, doc, docInfo);
        let stanzas = section.body.split("\n\n");
        if (i%3 === 0) { // Include image every 3rd section
            let URI = await grabSnapshot(section.timestamp);
            writeWithImage(stanzas[0], URI, doc, docInfo);
            stanzas = stanzas.slice(1);
        }

        for (let stanza of stanzas) {
            write(stanza, doc, docInfo);
        }
    }

    doc.save(`${data.info.title} StudyBuddyGPT Notes.pdf`);
}

function writeStamp(src, doc, info) {
    let img = new Image(); img.src = src;
    let img_w = 0.3; let img_h = 0.3;

    let stamp = "Generated by StudybuddyGPT";
    let stampWidth = doc.getTextWidth(stamp);
    let stampFS = 12; doc.setFontSize(stampFS);
    let stampPadding = 0.15;

    doc.addImage(
        img,
        'JPEG',
        info.width - img_w - stampWidth - (stampPadding), // top right corner
        0.5*stampPadding,
        img_w, // 0.5in x 0.5x
        img_h
    )

    doc.text(info.width - stampWidth - stampPadding, (0.8*stampPadding) + stampFS / 72, stamp);
}

function writeTitle(title, doc, info) {
    let titleFS = 24; let PPI = 72; // pixels per inch
    let textlines = doc.setFontSize(titleFS)
        .setFont(undefined, 'bold')
        .splitTextToSize(title, info.width - (2*info.hOffset));
    let size = (textlines.length + 0.5) * titleFS / PPI;
    checkPageWrapping(size, doc, info);

    doc.text(info.width/2, info.vOffset + titleFS / PPI, textlines, 'center')
    info.vOffset += size;
    info.heightLeft -= size;
}

function writeLink(URL, doc, info) {
    let linkFS = 12; let PPI = 72; // pixels per inch
    let size = (2.0) * linkFS / PPI;
    doc.setFontSize(linkFS)
        .setFont(undefined, 'normal')
    checkPageWrapping(size, doc, info);

    let linkWidth = doc.getTextWidth(`Sourced from <${URL}>`)
    let start_x = info.width/2 - linkWidth/2;
    doc.text(
        start_x,
        info.vOffset + linkFS/PPI,
        'Sourced from '
    );
    let prefixWidth = doc.getTextWidth('Sourced from ');
    doc.setTextColor(62, 165, 255) // hyperlink blue
        .textWithLink(
            `<${URL}>`,
            start_x + prefixWidth,
            info.vOffset + linkFS/PPI,
            { url: URL}
        );
    info.vOffset += size;
    info.heightLeft -= size;

    doc.setTextColor(0); // Reset color
}

function writeHeading(heading, doc, info) {
    let headingFS = 16;
    let PPI = 72; // pixels per inch
    let textlines = doc.setFontSize(headingFS)
        .setFont(undefined, 'normal')
        .splitTextToSize(heading, info.width - (2*info.hOffset));
    let size = (textlines.length + 0.5) * headingFS / PPI + info.padding;
    checkPageWrapping(size, doc, info);

    doc.text(info.hOffset, info.vOffset + headingFS / PPI + info.padding, textlines)
    info.vOffset += size;
    info.heightLeft -= size;
}

function write(stanza, doc, info) {
    let FS = 12;
    let PPI = 72; // pixels per inch
    let textlines = doc.setFontSize(FS)
        .setFont(undefined, 'normal')
        .splitTextToSize(stanza, info.width - (2*info.hOffset));
    let size = (textlines.length+0.5) * FS / PPI + info.padding;
    checkPageWrapping(size, doc, info);

    doc.text(info.hOffset, info.vOffset + FS / PPI, textlines)
    // vOffset bug, apply extra padding if overflow recently occurred
    if (info.vOffset === 1) {
        info.vOffset += 0.15;
    }
    info.vOffset += size;
    info.heightLeft -= size;
}

function writeWithImage(stanza, URI, doc, info) {
    let FS = 12; let PPI = 72; // pixels per inch
    let imgPadding = 0.15;
    let textlines = doc.setFontSize(FS)
        .setFont(undefined, 'normal')
        .splitTextToSize(stanza, info.width - (2*info.hOffset) - info.imgWidth - imgPadding);

    // Comparing img size to text size
    let maxSize = Math.max(
        (textlines.length + 2.5) * FS / PPI,
        info.imgHeight + imgPadding
    );
    checkPageWrapping(maxSize, doc, info);

    // Determining text & img horizontal offset
    let textHoriOffset; let imgHoriOffset;
    if (info.imgLoc === "right") {
        textHoriOffset = info.hOffset;
        imgHoriOffset = info.width - info.hOffset - info.imgWidth;
        info.imgLoc = "left";
    } else {
        textHoriOffset = info.hOffset + info.imgWidth + imgPadding;
        imgHoriOffset = info.hOffset
        info.imgLoc = "right";
    }

    // Adding section img
    doc.addImage(URI,
        'JPEG',
        imgHoriOffset,
        info.vOffset,
        info.imgWidth,
        info.imgHeight);

    doc.text(textHoriOffset, info.vOffset + FS / PPI, textlines)
    info.vOffset += maxSize;
    info.heightLeft -= maxSize;
}

function checkPageWrapping(size, doc, info, img=false) {
    // Check for overflow from text (AND img, if present)
    if (size > info.heightLeft) { // Overflow found -> new page!
        doc.addPage();

        // reset vOffset & repopulate heightLeft
        info.vOffset = 1;
        info.heightLeft = info.height - (info.vOffset*2);
    }
}

async function grabSnapshot(timestamp) {
    let activeTab = await getActiveTab();

    // Grabbing snapshot as data URI
    return await chrome.tabs.sendMessage(activeTab.id, {
        type: "SNAPSHOT",
        timestamp: timestamp
    });
}