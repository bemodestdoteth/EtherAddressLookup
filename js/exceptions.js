class ExceptionLinks {
    constructor(fileKey) {
        // this.fileKey = 
        this.fileKey = "iframeException"
        this.exceptionSiteLinksElement = document.getElementById('exceptionSiteLinks');
        this.addButton = document.getElementById('iframeAddButton');
        this.deleteButton = document.getElementById('iframeDeleteButton');
        this.modifyButton = document.getElementById('iframeModifyButton');
        // this.exceptionLinks = await this.fetchDataFromLocalStorage();
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
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(items);
                }
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

    async add(address, name, chain, comment, tracking) {
        this.exceptionSiteLinksElement.value = this.exceptionLinks.join('\n');

        return await this.set({ [this.fileKey]: this.exceptionLinks });
    }

    /**
     * @name remove
     * @desc Removes one or more items from storage.
     * @param {String | Array} key
     * @return {Promise}
     */
    async remove(key) {
        await this.removeLabelledAddress(key);

        return new Promise((resolve) => {
            this.scope.remove(key, () => {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError);
                } else {
                    console.log(key);
                    resolve();
                }
            });
        });
    }

    async fetchDataFromLocalStorage() {
        try {
            const url = chrome.runtime.getURL('./config/data.json');
            const response = await fetch(url);
      
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }

            const data = await response.json();
            return data[this.fileKey];
        } catch (err) {
            console.error(err);
        }
    }

    setupAddButtonHandler() {
        this.addButton.addEventListener('click', () => {
            // Add action
            let link = prompt('Enter the new website link:');
            if (link) {
                this.exceptionLinks.push(link);
                this.updateLinks();
            }
        });
    }

    setupDeleteButtonHandler() {
        this.deleteButton.addEventListener('click', () => {
            // Delete action
            let link = window.getSelection().toString();
            if (link) {
                const index = this.exceptionLinks.indexOf(link);
                if (index > -1) {
                    this.exceptionLinks.splice(index, 1);
                    this.updateLinks();
                } else {
                    alert("Link not found in the list.");
                }
            } else {
                alert("Select a link in the list to delete.");
            }
        });    
    }
    
    setupModifyButtonHandler() {
        this.modifyButton.addEventListener('click', () => {
            let oldLink = window.getSelection().toString();
            if (oldLink) {
                let newLink = prompt("Enter the new link to replace the old one:");
                if (newLink) {
                    const index = this.exceptionLinks.indexOf(oldLink);
                    if (index > -1) {
                        this.exceptionLinks[index] = newLink;
                        this.updateLinks();
                    } else {
                        alert("Link not found in the list.");
                    }
                }
            } else {
                alert("Select a link in the list to modify.");
            }    
        })
    }
}