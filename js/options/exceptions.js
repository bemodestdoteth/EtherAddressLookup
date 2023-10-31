window.addEventListener('load', () => {
    const exceptionLinks = new ExceptionLinks();
    exceptionLinks.setupAddButtonHandler();
    exceptionLinks.setupDeleteButtonHandler();
    exceptionLinks.setupModifyButtonHandler();
});