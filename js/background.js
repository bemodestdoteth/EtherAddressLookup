//Send message from the extension to here.
try {
    console.log("Background listening for messages")
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log("Received message:", request);

            if(request.func === "getCompatibilityMode") {
                console.log(1)
                let mode = localStorage.getItem("ext-etheraddresslookup-compatibility_mode") || "1";
                sendResponse({compatibilityMode: mode});
                console.log("Sent response compatibilityMode: " + mode);
            }
    
            // Handle other message types
            if (typeof request.func !== "undefined") {
                console.log(2)
                if(typeof objEtherAddressLookup[request.func] == "function") {
                    objEtherAddressLookup[request.func]();
                    sendResponse({status: "ok"});
                }
            }

            console.log(3)
            sendResponse({status: "fail"});
        }
    );
    console.log("Background.js loaded");  
} catch(e) {
    console.log("Error in background.js: " + e);
}

// try {
//     chrome.browserAction.onClicked.addListener((tab) => {
//         objBrowser.tabs.executeScript({
//             "func": convertAddressToLink,
//             "allFrames" : true
//         });
//     });
// } catch(e) {
//     console.log("Error in DomManipulator.js: " + e);
// }