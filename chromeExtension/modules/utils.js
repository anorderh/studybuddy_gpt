export async function getActiveTab() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });

    return tabs[0];
}

export async function readLocalStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function(res) {
            resolve(res[key]);
        });
    });
}

// function testHeaders(){
//     var coll = document.getElementsByClassName("collapsible");
//     var i;
//
//     for (i = 0; i < coll.length; i++) {
//         coll[i].addEventListener("click", function() {
//             this.classList.toggle("active");
//             var content = this.nextElementSibling;
//             if (content.style.maxHeight){
//                 content.style.maxHeight = null;
//             } else {
//                 content.style.maxHeight = content.scrollHeight + "px";
//             }
//         });
//     }
// }
// testHeaders();