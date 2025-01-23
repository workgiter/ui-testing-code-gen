
function getElementsByXPath(xpath) {
    return Array.from((function*(){ let iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null); let current = iterator.iterateNext(); while(current){ yield current; current = iterator.iterateNext(); }  })());
}

function genLocator(el) {

    getElementsByXPath2 = (xpath) => {
        return Array.from((function*(){ let iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null); let current = iterator.iterateNext(); while(current){ yield current; current = iterator.iterateNext(); }  })());
    }

    let xpath = ""
    let name = ""
	if (el.id != '') {
        xpath = `//${el.tagName}[@id='${el.id}']`
        name = el.id
	} else if(el.getAttribute("class")) {
		let CSSclass = el.getAttribute("class")
        xpath = `//${el.tagName}[contains(concat('⦿', @class, '⦿'), '⦿${CSSclass}⦿')]`
        name = CSSclass
        if (getElementsByXPath2(xpath).length > 1) {
            xpath = xpath + `[.='${el.textContent}']`
            name = el.textContent + name
        }
	} else {
        xpath = `//${el.tagName}[.='${el.textContent}']`
        name = el.textContent
    }
    console.log(name)
    console.log(xpath)
    return {
        name,
        xpath
    }
}


function test() {
    console.log("func start")
    
        chrome.devtools.inspectedWindow.eval(
            genLocator.toString() + "; \n" +
            "genLocator($0)", function(result) {
                console.log(result);
                document.getElementById("input-name").value = result.name;
                document.getElementById("input-xpath").value = result.xpath;
            }
        )
}




let click = () => {
    let name = document.getElementById("input-name").value
    let xpath = document.getElementById("input-xpath").value
}


console.log("loaded")


document.getElementById("genLocator").addEventListener("click", test);