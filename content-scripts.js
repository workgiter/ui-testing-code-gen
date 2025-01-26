console.log("In content script");

function getElementsByXPath(xpath) {
    return Array.from((function*(){ let iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null); let current = iterator.iterateNext(); while(current){ yield current; current = iterator.iterateNext(); }  })());
}



chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(msg)
    sendResponse(getElementsByXPath(msg.xpathString).length);
});