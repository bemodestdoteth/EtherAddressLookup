//Send message from the extension to here.
try {
    console.log("Background listening for messages")
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log("Received message:", request);

            if(request.func === "getCompatibilityMode") {
                let mode = localStorage.getItem("ext-etheraddresslookup-compatibility_mode") || "1";
                sendResponse({compatibilityMode: mode});
                console.log("Sent response compatibilityMode: " + mode);
            }
    
            // Handle other message types
            if (typeof request.func !== "undefined") {
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

    // Click handler
    chrome.commands.onCommand.addListener((command) => {
        if (command === "convert_addresses") {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    message: "convertAddresses"
                });
            });
        }
    });

    console.log("Background script loaded successfully");
} catch(e) {
    console.log("Error in background.js: " + e);
}