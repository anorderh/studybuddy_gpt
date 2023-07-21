import {exportPDF} from "./pdfExport.js";

export function deriveSettings(data) {
    let settings = document.createElement("div");

    let buttonContainer = document.createElement("div");
    buttonContainer.className = "optionsContainer"
    let exportButton = createOption(
        "export", "Export",
        "../assets/file-pdf-solid.svg",
        async function() {
            await exportPDF(data);
        });
    let twitterButton = createOption(
        "twitter", "Twitter",
        "../assets/twitter.svg",
        async function() {
            window.open("https://twitter.com/home", "_blank")
        }
    )
    let githubButton = createOption(
        "github", "Github",
        "../assets/github-alt.svg",
        async function() {
            window.open("https://github.com/", "_blank")
        }
    )
    buttonContainer.appendChild(exportButton)
    buttonContainer.appendChild(twitterButton)
    buttonContainer.appendChild(githubButton)
    settings.appendChild(buttonContainer);

    let infoContainer = packageConversionInfo(data.info)
    settings.appendChild(infoContainer);
    settings.appendChild(packageLicenseInfo());

    return settings;
}

function createOption(id, labelText, imgPath, action) {
    // Create Export button
    let button = document.createElement("div");
    button.id = id; button.className = "icon-wrap option";
    let icon = document.createElement("img");
    icon.className = "icon"; icon.src = imgPath;
    let label = document.createElement("p");
    label.textContent = labelText;

    button.appendChild(icon);
    button.appendChild(label);
    button.addEventListener("click", async function() {
        console.log(`${id} button pressed!`);

        let buttonID = toggleButtonLoading(button, labelText, null);
        await action();
        toggleButtonLoading(button, labelText, buttonID);
    });

    return button
}

function toggleButtonLoading(button, originalLabel, id=null) {
    let label = button.getElementsByTagName("p")[0]

    if (id != null) { // Disable
        clearInterval(id);

        button.style.pointerEvents = "all";
        button.classList.remove("no-hover")
        label.textContent = originalLabel;
    } else { // Enable
        button.style.pointerEvents = "all";
        button.classList.add("no-hover")
        label.textContent = "Loading";

        return setInterval(function(){
            label.textContent = label.textContent.length >= 10 ?
                "Loading" :
                label.textContent.concat(".");
        },500);
    }
}

function packageConversionInfo(info) {
    let container = document.createElement("div")

    let label = document.createElement("h3");
    label.textContent = "Conversion info";
    let infoBox = document.createElement("div")
    infoBox.id = "infoBox";

    let output = "";
    try {
        console.log(info);
        output += `title: ${info['title']}<br/>`;
        output += `URL: ${info['URL']}<br/>`;
        output += `Time Elapsed: ${info['timeElapsed']}s<br/>`;
        output += `Shortening Cycles: ${info['shorteningCycles']}<br/>`;
        output += `Original Word Count: ${info['origWordCount']}<br/>`;
        output += `Final Word Count: ${info['finalWordCount']}<br/>`;
        output += `Thumbnail URL: ${info['thumbnailURL']}<br/>`;
        output += '<br/>';

    } catch(e) {
        console.log("settings failed");
        for (const prop in info) {
            if (prop === 'timeElapsed') {
                output += `timeElapsed: ${info[prop]}s<br/>`;
            }
            output += `${prop}: ${info[prop]}<br/>`;
        }
        output += '<br/>';
    }

    infoBox.innerHTML = output
    container.appendChild(label)
    container.appendChild(infoBox)

    return container;
}

function packageLicenseInfo() {
    let license = document.createElement("p");
    license.className = "greyed-out";
    license.innerHTML = "Anthony Norderhaug 2023 <br> GNU General Public License v3.0 "

    return license;
}