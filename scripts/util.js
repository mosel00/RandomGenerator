function downloadJson(filename, obj) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, '\t')));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}

function openInternalPopup(element, closeCallback) {
    let popupWrapper = document.createElement("div");
    popupWrapper.classList.add("popupWrapper");

    if (closeCallback === undefined) {
        closeCallback = () => undefined;
    }

    let close = () => {
        let ret = closeCallback();
        if (ret === undefined || ret === true) {
            popupWrapper.remove(); 
        }
    };

    if (element instanceof Function) {
        element = element(close);
    }

    popupWrapper.addEventListener("click", evt => { 
        if (evt.target != element) {
            close();
        }
    });

    popupWrapper.appendChild(element);
    document.body.appendChild(popupWrapper);
}