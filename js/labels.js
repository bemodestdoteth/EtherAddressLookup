const BEGINNING_AND_END_CHARS_IN_ADDR_TO_SHOW = 5;
const FORM_ADDRESS_SELECTOR = '#ext-etheraddresslookup-label-address';
const FORM_NAME_SELECTOR = '#ext-etheraddresslookup-label-name';
const FORM_COLOR_SELECTOR = '#ext-etheraddresslookup-label-color';
const FORM_CHAIN_SELECTOR = '#ext-etheraddresslookup-dropdown-value';
const FORM_COMMENT_SELECTOR = '#ext-etheraddresslookup-label-comment';
const FORM_TRACK_SELECTOR = '#ext-etheraddresslookup-label-track';
const LABELLED_ADDRESSES_KEY = "labelledAddresses";

class Labels {
    constructor(scope = chrome.storage.local) {
        this.scope = scope;
        this.fetchDataFromServer();
    }

    async retrieve() {
        const labels = await this.get(LABELLED_ADDRESSES_KEY);
        if (labels[LABELLED_ADDRESSES_KEY] === undefined) {
            return [];
        } else {
            return Object.keys(labels[LABELLED_ADDRESSES_KEY]).map((address) => {
                const { label, chain, comment, tracking } = labels[LABELLED_ADDRESSES_KEY][address];
                return [address, label, chain, comment, tracking];
            });
        }
    }

    initialise(object) {
        object[LABELLED_ADDRESSES_KEY] = [];
        return object;
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

    /**
     * @name set
     * @desc Sets multiple items.
     * @param {Object} dataObject
     * @return {Promise}
     */
    async set(dataObject) {
        return new Promise((resolve, reject) => {
            this.scope.set(dataObject, () => {
                if (chrome.runtime.lastError){
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * @name add
     * @desc Adds one or more items to local storage.
     * @param {string} address - Address to label
     * @param {string} name - Label name
     * @param {string} chain - Chain name
     * @param {string} comment - Comment
     * @param {*boolean} tracking - Tracking
     */
    async add (address, name, chain, comment, tracking) {
        const result = await this.get(LABELLED_ADDRESSES_KEY);
        result[LABELLED_ADDRESSES_KEY][address] = {"chain": chain, "comment": comment, "label": name, "tracking": tracking};
        await this.set(result);
    };

    /**
     * @name remove
     * @desc Removes one or more items from local storage.
     * @param {String | Array} key
     * @return {Promise}
     */
    async remove(address) {
        const result = await this.get(LABELLED_ADDRESSES_KEY);
        delete result[LABELLED_ADDRESSES_KEY][address];
        await this.set(result);
    }

    /**
     * @name clear
     * @desc Clears local storage.
     * @returns {Promise}
     */
    clear() {
        return new Promise((resolve) => {
            this.scope.clear(() => {
                if (chrome.runtime.lastError){
                    console.log(chrome.runtime.lastError);
                }
                else {
                    resolve();
                }
            });
        });
    }

    /**
     * @name getTemplate
     * @desc Get the HTML template for a label
     * @param {string} address - Address to label
     * @param {string} name - Label name
     * @param {string} chain - Chain name
     * @param {string} comment - Comment
     * @param {boolean} tracking - Tracking
     * @returns 
     */
    getExtendedTemplate(address, name, chain, comment, tracking) {
        // Tracking Checkbox
        if (tracking) {
            tracking = "checked";
        } else {
            tracking = "";
        }

        const shortenText = (text, maxLength) => {
            if (text) {
                return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
            } else {
                return ''
            }
        }

        return `<span
        class='ext-etheraddresslookup-label'
        data-fill-label-input="${address}"
        title="${name}&#013;${address}&#013;${comment}"
        style="color:${chain.fontColor};background:${chain.bgColor};font-size:11px">
        ${shortenText(name, 18)} ${chain.name}
        </span>
        &nbsp;
        <div style="float:right;">
            <input type="checkbox" class="track-this-wallet" value="${address}" style="line-height:1.1" ${tracking} disabled>
            <span style="cursor:pointer;" class="ext-etheraddresslookup-label-delete" data-ext-etheraddresslookup-label-id="${address}">x</span>
        </div>
        <br/>`;
    }

    /**
     * @name hashString
     * @desc Hash a string using SHA-256
     * @param {string} input - String to hash
     * @returns {string} Hashed string
     */
    async hashString(input) {
        const textBuffer = new TextEncoder().encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * @name compareKeys
     * @desc Compare key between two objects
     * @param {object} obj1 - Object 1 to compare
     * @param {object} obj2 - Object 2 to compare
     * @returns {boolean} True if keys of two objests match
     */
    compareKeys(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) {
            return false; // They have different number of keys
        }
        
        for (let key of keys1) {
            if (!obj2.hasOwnProperty(key)) {
                return false; // Key in obj1 is not present in obj2
            }
        }
        
        return true;
    }

    /**
     * @name fetchDataFromServer
     * @desc Send data to my server and fetch label data from AWS S3 with signed URL
     * @returns {void}
     */
    async fetchDataFromServer() {
        try {
            // Read the secret key from "hash.txt" (assuming you have a way to read it, e.g., via a fetch request)
            const response = await fetch('./hash.txt');
            const text = await response.text();
            const lines = text.split('\n');
            const secretKey = lines[0].trim();
            const downloadURL = lines[1].trim();

            // Generate a signature using the secret key and the current Unix timestamp
            const currentTimestamp = Math.floor(Date.now() / 1000).toString();
            const signature = await this.hashString(secretKey + currentTimestamp);

            // Send the request to the server along with the signature and timestamp
            const serverConfig = {method: 'GET', headers: {
                    'X-Signature': signature,
                    'X-Timestamp': currentTimestamp
                }
            };
            const serverResponse = await fetch(downloadURL, serverConfig);

            if (serverResponse.status !== 200) {
            console.log('Looks like there was a problem when downloading data from the server. Status Code: ' + serverResponse.status);
            return;
            }

            const result = await serverResponse.json();

            // Access the signed URL
            const signedURLresponse = await fetch(result.url);
            if (signedURLresponse.status !== 200) {
                console.log('Looks like there was a problem when accessing signed url. Status Code: ' + response.status);
                return;
            }

            // Compare fetched data key with local data key
            const data = await JSON.parse(await signedURLresponse.text());
            const localData = await this.get(LABELLED_ADDRESSES_KEY);

            // No data on local storage
            if (localData[LABELLED_ADDRESSES_KEY] === undefined) {
                Object.keys(data[LABELLED_ADDRESSES_KEY]).map((address) => {
                    data[LABELLED_ADDRESSES_KEY][address]['chain'] = window.createInstance(data[LABELLED_ADDRESSES_KEY][address]['chain'])
                });
                await this.set(data);
            } else if (this.compareKeys(data[LABELLED_ADDRESSES_KEY], localData[LABELLED_ADDRESSES_KEY])) {
                console.log("Data is up to date.");
            } else {
                console.log("Data is not up to date.");
                // Convert chain string to chain class
                Object.keys(data[LABELLED_ADDRESSES_KEY]).map((address) => {
                    data[LABELLED_ADDRESSES_KEY][address]['chain'] = window.createInstance(data[LABELLED_ADDRESSES_KEY][address]['chain'])
                });
                await this.set(data);
            }
        }
      catch(err) {
          console.error('Error: ', err);
      }
    }

    /**
     * @name sendDeleteDataToServer
     * @desc Send delete data to my server and save label data to AWS S3 with signed URL
     * @returns {void}
     */
    async sendDeleteDataToServer(address) {
        try {
            // Only if the data exists in local storage
            const localData = await this.get(LABELLED_ADDRESSES_KEY);
            if (localData[LABELLED_ADDRESSES_KEY] === undefined) {
                console.log("Data does not exist in local storage.");
                return;
            }

            // Read the secret key from "hash.txt" (assuming you have a way to read it, e.g., via a fetch request)
            const response = await fetch('./hash.txt');
            const text = await response.text();
            const lines = text.split('\n');
            const secretKey = lines[0].trim();
            const deleteURL = lines[3].trim();

            // Generate a signature using the secret key and the current Unix timestamp
            const currentTimestamp = Math.floor(Date.now() / 1000).toString();
            const signature = await this.hashString(secretKey + currentTimestamp);
            const body = JSON.stringify({address: address});
            // Send the request to the server along with the signature and timestamp
            const serverConfig = {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'X-Signature': signature,
                    'X-Timestamp': currentTimestamp
                },
                body: body
            };
            const serverResponse = await fetch(deleteURL, serverConfig);

            if (serverResponse.status !== 200) {
                alert(`${serverResponse.status}: ${serverResponse.statusText}`);
                return;
            }

            const result = await serverResponse.json();
            return result.message;
        } catch(err) {
            console.error('Error: ', err);
        }
    }

    /**
     * @name sendAddDataToServer
     * @desc Send data to my server and save label data to AWS S3 with signed URL
     * @returns {void}
     */
    async sendAddDataToServer(address, name, chain, comment, tracking) {
        try {
            // Only if the data exists in local storage
            const localData = await this.get(LABELLED_ADDRESSES_KEY);
            if (localData[LABELLED_ADDRESSES_KEY] === undefined) {
                console.log("Data does not exist in local storage.");
                return;
            }

            // Read the secret key from "hash.txt" (assuming you have a way to read it, e.g., via a fetch request)
            const response = await fetch('./hash.txt');
            const text = await response.text();
            const lines = text.split('\n');
            const secretKey = lines[0].trim();
            const uploadURL = lines[2].trim();

            // Generate a signature using the secret key and the current Unix timestamp
            const currentTimestamp = Math.floor(Date.now() / 1000).toString();
            const signature = await this.hashString(secretKey + currentTimestamp);
            const body = JSON.stringify({[address]: {
                    "chain": chain,
                    "comment": comment,
                    "label": name,
                    "tracking": tracking
                }
            });
            // Send the request to the server along with the signature and timestamp
            const serverConfig = {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'X-Signature': signature,
                    'X-Timestamp': currentTimestamp
                },
                body: body
            };
            const serverResponse = await fetch(uploadURL, serverConfig);

            if (serverResponse.status !== 200) {
                alert(`${serverResponse.status}: ${serverResponse.statusText
                }`);
                return;
            }

            const result = await serverResponse.json();
            return result.message;
        } catch(err) {
            console.error('Error: ', err);
        }
    }

    /**
     * @name sendDataToServer
     * @desc Send data to my server and save label data to AWS S3 with signed URL
     * @returns {void}
     */
    // async sendDataToServer() {
    //     try {
    //         // Only if the data exists in local storage
    //         const localData = await this.get(LABELLED_ADDRESSES_KEY);
    //         if (localData[LABELLED_ADDRESSES_KEY] === undefined) {
    //             console.log("Data does not exist in local storage.");
    //             return;
    //         }

    //         // Read the secret key from "hash.txt" (assuming you have a way to read it, e.g., via a fetch request)
    //         const response = await fetch('./hash.txt');
    //         const text = await response.text();
    //         const lines = text.split('\n');
    //         const secretKey = lines[0].trim();
    //         const uploadURL = lines[2].trim();

    //         // Generate a signature using the secret key and the current Unix timestamp
    //         const currentTimestamp = Math.floor(Date.now() / 1000).toString();
    //         const signature = await this.hashString(secretKey + currentTimestamp);

    //         // Send the request to the server along with the signature and timestamp
    //         const serverConfig = {
    //             method: 'GET', 
    //             headers: {
    //                 'X-Signature': signature,
    //                 'X-Timestamp': currentTimestamp
    //             }
    //         };
    //         const serverResponse = await fetch(uploadURL, serverConfig);

    //         if (serverResponse.status !== 200) {
    //             console.log('Looks like there was a problem when downloading data from the server. Status Code: ' + serverResponse.status);
    //             return;
    //         }

    //         const result = await serverResponse.json();

    //         // Convert chain class to chain string
    //         for (let value of Object.values(localData[LABELLED_ADDRESSES_KEY])) {
    //             console.log(value);
    //             if ("chain" in value) {
    //                 value.chain = value.chain.name;
    //             }
    //         }
    //         console.log(localData);

    //         const signedURLresponse = await fetch(result.url, {
    //             method: 'PUT',
    //             body: JSON.stringify(localData),
    //         });
    //         if (signedURLresponse.status !== 200) {
    //             console.log('Looks like there was a problem when accessing signed url. Status Code: ' + s3Response.status);
    //             return;
    //         }

    //         console.log('Successfully uploaded data to server.');
    //     } catch(err) {
    //         console.error('Error: ', err);
    //     }
    // }

    /**
     * @name addLabelsListEvents
     * @desc Add HTML elements and events to the labels list
     * @return {void}
     */
    addLabelsListEvents() {
        const labelsDeleteElements = document.getElementsByClassName("ext-etheraddresslookup-label-delete");

        Array.from(labelsDeleteElements).forEach((element) => {
            element.addEventListener('click', async (event) => {
                const address = event.target.getAttribute('data-ext-etheraddresslookup-label-id');

                // await this.clear();
                const response = await this.sendDeleteDataToServer(address);
                if (response !== undefined) {
                    await this.remove(address);
                    alert(`Address ${address} successfully deleted.`);
                }
            });
        });

        const FILL_LABEL_INPUT_ATTRIBUTE = 'data-fill-label-input';

        document.querySelectorAll(`[${FILL_LABEL_INPUT_ATTRIBUTE}]`).forEach(element => {
            element.addEventListener('click', async (event) => {

                const address = event.target.getAttribute(FILL_LABEL_INPUT_ATTRIBUTE);
                const retrievedObject = await this.get(LABELLED_ADDRESSES_KEY);
                const { chain, label, comment, tracking } = retrievedObject[LABELLED_ADDRESSES_KEY][address];

                document.querySelector(FORM_NAME_SELECTOR).value = label;
                document.querySelector(FORM_ADDRESS_SELECTOR).value = address;

                let chainElement = document.querySelector(FORM_CHAIN_SELECTOR);
                chainElement.textContent = chain.name;
                chainElement.style.background = chain.bgColor;
                chainElement.style.color = chain.fontColor;

                document.querySelector(FORM_COMMENT_SELECTOR).value = comment;
                document.querySelector(FORM_TRACK_SELECTOR).checked = tracking;
            });
        });
    }

    /**
     * @name updateLabelsList
     * @desc Update the labels list
     * @param {string} query - Search query in case of filter
     * @return {void}
     */
    async updateLabelsList(query="") {
        let retrievedLabels = await this.retrieve();

        // Sort labels in ascending order
        retrievedLabels.sort((a, b) => {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
        });

        const filterLabels = (labels, query) => {
            return labels.filter(([_, label]) => label.includes(query));
        }    
        if(query !== "") {
            retrievedLabels = filterLabels(retrievedLabels, query);
        }
        
        let HTMLLabels = '';
        for (const [address, label, chain, comment, tracking] of retrievedLabels){
            HTMLLabels += this.getExtendedTemplate(address, label, chain, comment, tracking);
        }

        document.getElementById('ext-etheraddresslookup-current-labels').innerHTML = HTMLLabels;
        this.addLabelsListEvents();
    }

    /**
     * @name setupDownloadHandler
     * @desc (Deprecated)Setup the download button handler
     * @return {void}
     */
    setupDownloadHandler() {
        // To download chrome storage data
        document.getElementById('download-json').addEventListener('click', async (event) => {
            chrome.storage.local.get(null, (data) => {
                // Change chain class to chain string
                for (let value of Object.values(data)) {
                    if ("chain" in value) {
                        value.chain = value.chain.name;
                    }
                }

                // Convert data to JSON string
                const jsonString = JSON.stringify(data, null, 2);
    
                // Create a Blob from the JSON string
                const blob = new Blob([jsonString], { type: 'application/json' });
    
                // Create a download link
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = 'data.json';
    
                // Append the link to the DOM, trigger the download, and remove the link
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            });
        });
    }

    /**
     * @name setupFilterHandler
     * @desc Setup the filter handler
     * @return {void}
     */
    setupFilterHandler() {
        // Set up the search bar event handler
        document.getElementById('form-label-search').addEventListener('submit', async (event) => {
            event.preventDefault();
            const query = document.getElementById('ext-etheraddresslookup-search-label').value;
            if (query === "") {
                alert("Please enter a search query.");
            } else {
                await this.updateLabelsList(query);
            }
        });
    }

    /**
     * @name setupFormSubmitHandler
     * @desc Setup the form submit button handler
     * @return {void}
     */
    setupFormSubmitHandler() {
        document.getElementById('ext-etheraddresslookup-new-label-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.querySelector(FORM_NAME_SELECTOR).value;
            const chain = window.createInstance(document.querySelector(FORM_CHAIN_SELECTOR).textContent);
            // Chains where addresses are case-sensitive
            let address;
            if (chain.addrCaseSensitive) {
                address = document.querySelector(FORM_ADDRESS_SELECTOR).value;
            } else {
                address = document.querySelector(FORM_ADDRESS_SELECTOR).value.toLowerCase();
            }
            const comment = document.querySelector(FORM_COMMENT_SELECTOR).value;
            const tracking = document.querySelector(FORM_TRACK_SELECTOR).checked;

            // Check if the address is in the correct format
            const matchAnyRegex = (string, patterns) => {
                return patterns.some(pattern => pattern.test(string));
            }
            const isValidAddress = matchAnyRegex(address, chain.addrRegexPatterns);

            if (!isValidAddress) {
                alert('Please make sure that "Address" is in the correct format.');
            } else if (!name || !address || !chain) {
                alert('Please make sure that "Name", "Address", and "Chain" is filled.');
            } else {
                const response = await this.sendAddDataToServer(address, name, chain.name, comment, tracking);
                if (response !== undefined) {
                    await this.add(address, name, chain, comment, tracking);
                    alert(response);
                }
            }
        });
    }

    /**
     * @name setupResetHandler
     * @desc Setup the reset button handler
     * @return {void}
     */
    setupResetHandler() {
        // To download chrome storage data
        document.getElementById('ext-etheraddresslookup-reset').addEventListener('click', async (event) => {
            if (confirm("Are you sure you want to reset? This will clear all saved data.")) {
                await this.clear();
                await this.updateLabelsList();
                alert("Data has been successfully reset.");
              } else {
                // If the user clicks cancel, do nothing
                return;
              }
        });
    }

    /**
     * @name updateChainOption
     * @desc Update the chain option in the form Using custom dropdown
     * @return {void}
     */
    updateChainOption() {
        const generateChainOption = (chain) => {
            let option = document.createElement('div');
            option.className = 'custom-option';
            option.style.background = chain.bgColor;
            option.style.color = chain.fontColor;
            option.setAttribute('data-value', chain.bgColor);
            option.textContent = chain.name;
            
            option.onclick = function() {
                const dropdownValue = document.getElementById('ext-etheraddresslookup-dropdown-value');
                dropdownValue.textContent = chain.name;
                dropdownValue.setAttribute('data-selected-value', chain.bgColor);
                dropdownValue.style.background = chain.bgColor;
                dropdownValue.style.color = chain.fontColor;
                dropdown.classList.remove('open');
            };
            
            return option;
        }
    
        const dropdown = document.getElementById('ext-etheraddresslookup-label-color');
        const chains = window.getValueForEachChains("name");
        
        // Placeholder for selected value
        let dropdownValue = document.createElement('div');
        dropdownValue.id = 'ext-etheraddresslookup-dropdown-value';
        dropdownValue.onclick = function() {
            dropdown.classList.toggle('open');
        };
        dropdown.appendChild(dropdownValue);
    
        let isFirst = true;
        chains.forEach(chain => {
            const chainClass = window.createInstance(chain);
            const option = generateChainOption(chainClass);
            dropdown.appendChild(option);
            if (isFirst) {
                dropdownValue.textContent = chainClass.name;
                dropdownValue.setAttribute('data-selected-value', chainClass.bgColor);
                dropdownValue.style.background = chainClass.bgColor;
                dropdownValue.style.color = chainClass.fontColor;
                isFirst = false;
            }
        });
    }    
}