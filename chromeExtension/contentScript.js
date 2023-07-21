let sidepanel; // Extension container
let iframe; // Content
let resizer; // Cover tag for resizing
let youtubePlayer;
let canvas; // For drawing 2D images

/**
 * Adding elements to current webpage and grabbing Youtube player
 */
function init() {
    // alert("initailizing");

    // Rendering & adding new DOM elements
    sidepanel = document.createElement("div");
    sidepanel.className = "sidepanel"
    iframe = document.createElement("iframe");
    iframe.className = "iframe";
    resizer = document.createElement("div");
    resizer.className = "resizer";

    // Members for extracting data
    canvas = document.createElement('canvas');

    sidepanel.appendChild(resizer);
    sidepanel.appendChild(iframe);
    document.body.append(sidepanel);

    // Initializing resizer
    initResizerFn(resizer, sidepanel);
}

/**
 * Resize event listeners
 * @param resizer           Cover tag
 * @param sidebar           Draggable element
 */
function initResizerFn( resizer, sidebar ) {
    var xPos, width;

    function rs_mousedownHandler(e) {
        xPos = e.clientX;
        var sbWidth = window.getComputedStyle(sidebar).width;
        width = parseInt( sbWidth, 10 );

        iframe.style.pointerEvents = 'none'; // Disabling iframe mouse events
        document.addEventListener("mousemove", rs_mousemoveHandler);
        document.addEventListener("mouseup", rs_mouseupHandler);
    }

    function rs_mousemoveHandler( e ) {
        var dx = e.clientX - xPos;
        var completeWidth = width - dx; // complete width

        sidebar.style.width = `${ completeWidth }px`;
        // if ( completeWidth < 700 ) { // For width constraints...
        //     sidebar.style.width = `${ completeWidth }px`;
        // }
    }

    function rs_mouseupHandler() {
        iframe.style.pointerEvents = 'auto'; // Re-enabling iframe mouse events
        document.removeEventListener("mouseup", rs_mouseupHandler);
        document.removeEventListener("mousemove", rs_mousemoveHandler);
    }

    resizer.addEventListener("mousedown", rs_mousedownHandler);
}
/*
 * For grabbing screenshot of video, as data URI
 */
async function getSnapshot(timestamp) {
    youtubePlayer.currentTime = timestamp;
    await sleep(1000); // Pause for loading HTML video

    // Render image & save as data uri
    let canvas = document.createElement('canvas');
    canvas.width = 960; canvas.height = 540;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(youtubePlayer, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 1.0);
}

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

/**
 * For opening and closing sidepanel
 */
function open() {
    sidepanel.style.width = "433px";
}

function close() {
    sidepanel.style.width = "0px";
}

// window.addEventListener('locationchange', function () {
//     console.log("location changed!");
// });
//
// window.addEventListener('hashchange', function () {
//     // let url = document.location.href;
//     //
//     // if (tab.url.includes("youtube.com/watch")) { // Valid YT video page
//     //     chrome.tabs.sendMessage(tabId, {
//     //         type: "GRAB"
//     //     });
//     // }
//     console.log("hash changed!");
// });
//
// window.onhashchange = () => {console.log("hashchanged!")};
// window.onpopstate = () => {console.log("state popped!")};
// window.addEventListener("popstate", function () {
//     alert("hehehe");
//     console.log("state popped!");
// });

/**
 * Handling extension states and actions (playing timestamp, firing http)
 */
chrome.runtime.onMessage.addListener((obj, sender, sendResponse) => {
    try {
        const {
            type, // Action identifier
            timestamp,
        } = obj;

        if (type === "GRAB") { // Grabbing youtubePlayer
            youtubePlayer = document.getElementsByClassName('video-stream')[0];
            console.log(youtubePlayer)
        } else if (type === "START") { // Start processing.
            iframe.src = chrome.runtime.getURL("../sidepanel/sidepanel.html");
        } else { // Actions.
            if (type === "OPEN") {
                open();
            } else if (type === "CLOSE") {
                close();
            } else if (type === "PLAY") {
                youtubePlayer.currentTime = timestamp;
                console.log(timestamp);
            } else if (type === "SNAPSHOT") {
                (async () => {
                    sendResponse(await getSnapshot(timestamp));
                })();

                return true; // Asynch response desired
            }
        }
    } catch (e) {
        console.log(e);
    }
});
init();
