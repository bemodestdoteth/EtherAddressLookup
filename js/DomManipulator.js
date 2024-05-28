let objBrowser = chrome ? chrome : browser;

const EXT_PREFIX = 'ext-etheraddresslookup';
const HOVER_POPUP_CLASS_NAME = `${EXT_PREFIX}-address_stats_hover`;
const ADDRESS_DISPLAY_POPUP_CLASS_NAME = `${EXT_PREFIX}-display-popup`;
const ATTRIBUTE_ADDRESS_UNIQUE_ID = `data-${EXT_PREFIX}-address-unique-id`;
const LABEL_LOADED_ATTRIBUTE = `data-${EXT_PREFIX}-label-loaded`;
const DOM_LABELLED_ADDRESSES_KEY = "labelledAddresses";

class EtherAddressLookup {
    constructor(objWeb3, scope = chrome.storage.local)
    {
        this.objWeb3 = objWeb3;
        this.scope = scope;

        this.strRpcDetails = "";

        this.setDefaultExtensionSettings();
        this.init();
    }

    /**
     * @name get
     * @desc Gets one or more items from storage.
     * @param {String | Array} key
     * @return {Promise}
     */
    get(key) {
        return new Promise((resolve, reject) => {
            this.scope.get(key, (items) => {
                if (chrome.runtime.lastError){
                    return reject(chrome.runtime.lastError);
                }
                resolve(items);
            });
        });
    }

    async retrieve() {
        const labels = await this.get(DOM_LABELLED_ADDRESSES_KEY);
        if (labels[DOM_LABELLED_ADDRESSES_KEY] === undefined) {
            return [];
        } else {
            return Object.keys(labels[DOM_LABELLED_ADDRESSES_KEY]).map((address) => {
                return [address, ...Object.values(labels[DOM_LABELLED_ADDRESSES_KEY][address])];
            });
        }
    }

    setDefaultExtensionSettings() {
        this.blHighlight = false;
        this.blPerformAddressLookups = true;

        this.intSettingsCount = 0;
        this.intSettingsTotalCount = 2;
    }

    /**
     * @name init
     * @desc Gets extension settings and applies DOM manipulation
     */
    init()
    {
        // let objBrowser = chrome ? chrome : browser;
        // //Get the highlight option for the user
        // objBrowser.runtime.sendMessage({func: "highlight_option"}, function(objResponse) {
        //     if(objResponse && objResponse.hasOwnProperty("resp")) {
        //         this.blHighlight = (objResponse.resp == 1);
        //     }
        //     ++this.intSettingsCount;
        // }.bind(this));

        // //Get the blockchain explorer for the user
        // objBrowser.runtime.sendMessage({func: "blockchain_explorer"}, function(objResponse) {
        //     this.strBlockchainExplorer = objResponse.resp;
        //     ++this.intSettingsCount;
        // }.bind(this));

        // //Get the perform address lookup option
        // objBrowser.runtime.sendMessage({func: "perform_address_lookups"}, function(objResponse) {
        //     this.blPerformAddressLookups = objResponse.resp;
        //     ++this.intSettingsCount;
        // }.bind(this));

        // //Get the RPC network details
        // objBrowser.runtime.sendMessage({ func: "rpc_details" }, function(objResponse) {
        //     let objDetails = JSON.parse(objResponse.resp);
        //     this.strRpcDetails = `${objDetails.name} (${objDetails.type})`;
        // }.bind(this));

        //Update the DOM once all settings have been received...
        setTimeout(function() {
            // Needs to happen after user settings have been collected
            // and in the context of init();
            this.manipulateDOM();
        }.bind(this), 10);
    }

    manipulateDOM()
    {
        const convertSync = (async() => {            
            await this.convertAddressToLink()
        })();
    }

    /**
     * @name Convert Address To Link
     * @desc Finds Ethereum addresses and converts to a link to a block explorer
     */
    async convertAddressToLink()
    {
        const arrWhitelistedTags = ["div", "code", "span", "p", "td", "li", "em", "i", "b", "strong", "small", "a", "h1", "h2", "h3"];
        
        // Preprocessing to deal with iframes
        let websiteHasIframe = false;
        const iframeWebsiteExceptions = [
            "https://etherscan.io",
            "https://goerli.etherscan.org",            
            "https://sepolia.etherscan.io",
            "https://bscscan.com",
            "https://polygonscan.com",
            "https://snowscan.xyz",
            "https://arbiscan.io",
            "https://nova.arbiscan.io",
            "https://optimistic.etherscan.io",
            "https://ftmscan.com",
            "https://gnosisscan.io",
            "https://basescan.org",
            "https://goerli.basescan.org",
            "https://zkevm.polygonscan.com",
            "https://celoscan.io",
            "https://lineascan.build",
            "https://wemixscan.com",
            "https://cronoscan.com",
            "https://scrollscan.com",
            "https://kromascan.com",
            "https://era.zksync.network",
            "https://opbnb.bscscan.com",
            "https://explorer.zora.energy",
            "https://blastscan.io",
            "https://mantlescan.xyz",
            "https://explorer.zora.energy",
        ];
        // const blockExplorers = window.getValueForEachChainsProxy("blockExplorer");
        // const blockExplorerHasIframe = window.getValueForEachChains("blockExplorerHasIframe");
        // const blockExplorersWithIframe = blockExplorers.filter((blockExplorer, index) => blockExplorerHasIframe[index]);
        // iframeWebsiteExceptions.concat(blockExplorersWithIframe); 

        // Site-specific exceptions
        for (const iframeWebsiteException of iframeWebsiteExceptions) {
            if(window.location.href.includes(iframeWebsiteException)) {
                websiteHasIframe = true;
            }
        }
        // if(window.location.href.includes("https://solana.fm")) {
        //     // Delete auto-refresing div and replace with non-changing one
        //     const solElementOld = document.querySelector("div.text-sm.inline-block.overflow-text");
        //     if (solElementOld !== null) {
        //         const solElementHTML = solElementOld.innerHTML;
        //         const solElementNew = document.createElement("div");
        //         solElementOld.parentElement.replaceChild(solElementNew, solElementOld);
        //         solElementNew.innerHTML = solElementHTML;
        //     }
        // }

        // Get the addresses from storage
        const retrievedAddresses = await this.retrieve();

        // Now deal with iframes
        if (websiteHasIframe) {
            const iframe = document.getElementsByTagName("iframe");
            for (let i = 0; i < iframe.length; i++) {
                //Get the whitelisted nodes
                for (let j = 0; j < arrWhitelistedTags.length; j++) {
                    const objNodes = iframe[i].contentWindow.document.getElementsByTagName(arrWhitelistedTags[j]);
                    //Loop through the whitelisted content
                    for (let x=0; x < objNodes.length; x++) {
                        // if( this.hasIgnoreAttributes(objNodes[x]) ){ continue; }
                        this.convertAddresses(objNodes[x], retrievedAddresses);
                    }
                }
            }
        }

        // Get the whitelisted nodes
        for(let i = 0; i < arrWhitelistedTags.length; i++) {
            const objNodes = document.getElementsByTagName(arrWhitelistedTags[i]);
            // console.log(arrWhitelistedTags[i], "||", objNodes.length);
            //Loop through the whitelisted content
            for(let x = 0; x < objNodes.length; x++) {
                // if( this.hasIgnoreAttributes(objNodes[x]) ){ continue; }
                this.convertAddresses(objNodes[x], retrievedAddresses);
            }
        }
        // this.addHighlightStyle();
    }

    /**
     * @name Convert Addresses
     * @desc Takes a Node and checks if any of its children are textNodes. On success replace textNode with slot node
     * @desc slot node contains regex replaced content; see generateReplacementContent()
     * @param {Node} objNode
     */
    async convertAddresses(objNode, retrievedAddresses)
    {
        // Some nodes have non-textNode children
        const nodeTypeExceptions = [
            "https://tronscan.org/",
        ]
        let nodeType;
        if(window.location.href.includes(nodeTypeExceptions)) {
            nodeType = 1;
        } else {
            nodeType = 3;
        }

        // we need to ensure regex is applied only to text otherwise we will mess the html up
        for(let i = 0; i < objNode.childNodes.length; i++){
            if(objNode.childNodes[i].nodeType == nodeType){ // nodeType 3 = a text node
                const child = objNode.childNodes[i];
                const childContent = child.textContent.trim();
                
                // Skip if the textNode is empty or too long
                if((childContent.length < 5 && !(childContent.includes(".") || childContent.includes("-") || childContent.includes("–"))) || childContent.length > 70) { continue; }

                const label = await this.isLabelMatched(childContent, retrievedAddresses);
                // Only start replacing stuff if the we get a RegEx match.
                if(label !== undefined) {
                    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot
                    const replacement = document.createElement('div');
                    replacement.setAttribute('class', 'ext-etheraddresslookup-temporary');
                    replacement.innerHTML = this.generateReplacementContent(label);
                    objNode.replaceChild(replacement, child);
                }
            }
        }
    }

    async isLabelMatched(childContent, retrievedAddresses) {
        let sliceAtBeginning = 4;
        if (childContent.slice(0, 2).toLowerCase() === "0x") { // EVM address case
            sliceAtBeginning = 5 // match string excluding "0x"
        }
        const sliceAtEnd = -4;

        // Only check textNodes to prevent applying RegEx against element attributes
        // retrievedAddresses[i][0] = addresses
        for (let i = 0; i < retrievedAddresses.length; i++) {
            if ((retrievedAddresses[i][0].slice(0, sliceAtBeginning).toLowerCase() === childContent.slice(0, sliceAtBeginning).toLowerCase()) && (retrievedAddresses[i][0].slice(sliceAtEnd).toLowerCase() === childContent.slice(sliceAtEnd).toLowerCase())) {
                // Partial match also searches for full match
                return {
                    address: retrievedAddresses[i][0],
                    chain: retrievedAddresses[i][1],
                    code: retrievedAddresses[i][2],
                    comment: retrievedAddresses[i][3],
                    entity: retrievedAddresses[i][4],
                    entityImage: retrievedAddresses[i][5],
                    label: retrievedAddresses[i][6],
                    tracking: retrievedAddresses[i][7],
                };
            }
        }
    }

    /**
     * @name Generate Replacement Content
     * @desc Takes string and replaces any regex pattern matches with the associated replace patterns
     * @param {string} content
     * @returns {string}
     */
    generateReplacementContent(label)
    {
        const imgTag = label.entityImage === "" ? "" : `<img class="ext-etheraddresslookup-label-img" src=${label.entityImage} style="width:1.2em;height:auto;">`;
        return  imgTag +
                `<a title="See this address on the blockchain explorer" ` +
                `href="${label.chain.blockExplorerPrefix}${label.address}${label.chain.blockExplorerPostfix}" ` +
                `class="ext-etheraddresslookup-link" ` +
                `style="padding: 2px; background: ${label.chain.bgColor}; color: ${label.chain.fontColor}!important; border: 1px solid; border-radius: 0.25rem;"` + 
                `target="_blank">${label.label}</a>`;
    }

    /**
     * @name Has Ignore Attributes
     * @desc Checks if a node contains any attribute that we want to avoid manipulating
     * @param {Element} node
     * @returns {boolean}
     */
    hasIgnoreAttributes(node)
    {
        var ignoreAttributes = {
            "class": ["ng-binding"]
        };

        // Loop through all attributes we want to test for ignoring
        for(var attributeName in ignoreAttributes){
            // Filter out the object's default properties
            if (ignoreAttributes.hasOwnProperty(attributeName)) {

                // Check this node has the attribute we are currently checking for
                if(node.hasAttribute(attributeName)){

                    // This node's value for the attribute we are checking
                    var nodeAttributeValue = node.getAttribute(attributeName);
                    // The values we want to ignore for this attribute
                    var badAttributeValueList = ignoreAttributes[attributeName];

                    // Loop through the attribute values we want to ignore
                    for(var i=0; i < badAttributeValueList.length; i++){
                        // If we find an indexOf, this value is present in the attribute
                        if(nodeAttributeValue.indexOf(badAttributeValueList[i]) !== -1){
                            return true;
                        }
                    }

                }

            }
        }

        return false;
    }
}

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.executeScript({
        "func": convertAddressToLink,
        "allFrames" : true
    });
});