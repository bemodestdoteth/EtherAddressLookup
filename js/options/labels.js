window.addEventListener('load', () => {
    const labels = new Labels();
    labels.setupFormSubmitHandler();
    labels.setupFilterHandler();
    labels.setupDownloadHandler();
    labels.setupResetHandler();
    labels.updateChainOption();
});