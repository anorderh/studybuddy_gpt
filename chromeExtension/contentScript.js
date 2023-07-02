// let sidepanel; // Extension container
// let iframe; // Content
// let resizer; // Cover tag for resizing
// let youtubePlayer;

/**
 * Adding elements to current webpage and grabbing Youtube player
 */
function init() {
    alert("initailizing");

    // Rendering & adding new DOM elements
    sidepanel = document.createElement("div");
    sidepanel.className = "sidepanel"
    iframe = document.createElement("iframe");
    iframe.className = "iframe";
    resizer = document.createElement("div");
    resizer.className = "resizer";

    sidepanel.appendChild(resizer);
    sidepanel.appendChild(iframe);
    document.body.append(sidepanel);

    // Initializing resizer
    initResizerFn(resizer, sidepanel);

    // Grabbing youtubePlayer
    console.log("Grabbing YT Player inside init");
    youtubePlayer = document.getElementsByClassName('video-stream')[0];
    console.log(youtubePlayer)
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

/**
 * For opening and closing sidepanel
 */
function open() {
    sidepanel.style.width = "433px";
}

function close() {
    sidepanel.style.width = "0px";
}

/**
 * Handling extension states and actions (playing timestamp, firing http)
 */
chrome.runtime.onMessage.addListener(async (obj, response) => {
    try {
        const { type, timestamp} = obj;

        if (type === "START") { // Start processing
            iframe.src = chrome.runtime.getURL("../sidepanel/sidepanel.html");
        } else { // Actions
            if (type === "OPEN") {
                open();
            } else if (type === "CLOSE") {
                close();
            } else if (type === "PLAY") {
                youtubePlayer.currentTime = timestamp;
            }
        }
    } catch (e) {
        console.log(e);
    }
});
init();
