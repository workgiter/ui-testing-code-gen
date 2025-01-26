
function getElementsByXPath(xpath) {
    return Array.from((function*(){ let iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null); let current = iterator.iterateNext(); while(current){ yield current; current = iterator.iterateNext(); }  })());
}

function numberOfXpathMatchers(xpath, el) {
    getElementsByXPath2 = (xpath) => {
        return Array.from((function*(){ let iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null); let current = iterator.iterateNext(); while(current){ yield current; current = iterator.iterateNext(); }  })());
    }
    console.log(xpath)
    let elements = getElementsByXPath2(xpath)

    return {number: elements.length, match: el.isSameNode(elements[0])}

}

function enumValuesFind(xpath) {
    getElementsByXPath2 = (xpath) => {
        return Array.from((function*(){ let iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null); let current = iterator.iterateNext(); while(current){ yield current; current = iterator.iterateNext(); }  })());
    }

    return getElementsByXPath2(xpath).map(x => x.textContent)

}

function genLocator(el) {

    getElementsByXPath2 = (xpath) => {
        return Array.from((function*(){ let iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null); let current = iterator.iterateNext(); while(current){ yield current; current = iterator.iterateNext(); }  })());
    }

    let xpath = ""
    let name = ""
    let text = el.textContent
	if (el.id != '') {
        xpath = `//${el.tagName}[@id='${el.id}']`
        name = el.id
	} else if(el.getAttribute("class")) {
		let CSSclass = el.getAttribute("class")
        xpath = `//${el.tagName}[contains(concat('_', @class, '_'), '_${CSSclass}_')]`
        name = CSSclass
        if (getElementsByXPath2(xpath).length > 1) {
            xpath = xpath
            name = el.textContent + name
        }
	} else {
        xpath = `//${el.tagName}[.='${el.textContent}']`
        name = el.textContent
    }

    let elementsFromXpath = getElementsByXPath2(xpath)
    let index = elementsFromXpath.findIndex(element => element.isSameNode(el))
    
    // console.log(name)
    // console.log(xpath)
    // console.log(text)
    return {
        name,
        xpath,
        text,
        index
    }
}


function clickGenLocator() {
    console.log("func start")
    
        chrome.devtools.inspectedWindow.eval(
            genLocator.toString() + "; \n" +
            "genLocator($0)", function(result) {
                console.log(result);
                document.getElementById("input-name").value = nameFilter(result.name);
                document.getElementById("input-xpath").value = result.xpath;
                document.getElementById("input-text").value = result.text;
                document.getElementById("input-index").value = result.index;
            }
        )
}

function getLocatorData() {
    return {
    name: document.getElementById("input-name").value,
    xpath: document.getElementById("input-xpath").value,
    text: document.getElementById("input-text").value,
    index: document.getElementById("input-index").value,
    indexType: document.querySelector('input[name="index"]:checked').value
    }
}

function enumFilter(text) {
    return text
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
        .replace("\n", "")
        .replace("\t", "")
        .replace(" ", "_")
        .toUpperCase()
}

function nameFilter(text) {
    return text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    .replace("\n", "")
    .replace("\t", "")
    .replace(" ", "_")
}

function enumNameGen(locatorData) {
    return locatorData.name + "Enum"
}

let actionTemplates = {
    click: function(locatorData) {
        return {
            name: "click",
            code: ".perform(WebClick)",
            atributes: []
        }
    },
    isDisplayed: function(locatorData) {
        return {
            name: "verify",
            code: ".assert(isDisplayed)",
            atributes:[]
        }
    },
    verifyText: function(locatorData) {
        return {
            name: "verify",
            code: ".checkText(elementText)",
            atributes:[
                {
                    name: "elementText",
                    type: "String",
                    value: `"${locatorData.text}"`
                }
            ]
        }
    }
}

let indexTemplates = {
    noIndex: function(locatorData) {
        return {
            xpath: "",
            realXpath: "",
            atributes:[]
        }
    },
    string: function(locatorData) {
        return {
            xpath: "[.='${elementText}']",
            realXpath: `[.='${locatorData.text}']`,
            atributes:[
                {
                    name: "elementText",
                    type: "String",
                    value: `"${locatorData.text}"`
                }
            ]
        }
    },
    index: function(locatorData) {
        return {
            xpath: "({REP})[${(index+1).toString()}]",
            realXpath: `({REP})[${Number(locatorData.index)+1}]`,
            atributes:[
                {
                    name: "index",
                    type: "Int",
                    value: locatorData.index
                }
            ]
        }
    },
    enum: function(locatorData) {
        return {
            xpath: "[.='${elementText.value}']",
            realXpath: `[.='${locatorData.text}']`,
            atributes:[
                {
                    name: "elementText",
                    type: `${enumNameGen(locatorData)}`,
                    value: `${enumNameGen(locatorData)}.${enumFilter(locatorData.text)}`
                }
            ]
        }
    },
}

function genStepTemplate(locatorData, indexType, actionType) {
    return {
            page: "",
            name: locatorData.name,
            xpath: locatorData.xpath,
            index: indexTemplates[indexType](locatorData),
    
            action: actionTemplates[actionType](locatorData)
        }
    
}




async function addStep(actionType) {
    let locatorData = getLocatorData()
    console.log(`locatorData`)
    console.log(locatorData)
    let step = genStepTemplate(locatorData, locatorData.indexType, actionType)

    console.log(`Step: ${step}`)
    console.log(step)
    let data = await chrome.storage.local.get(["steps"])

    if (Object.keys(data).length === 0 || !Array.isArray(data.steps)) {
        data.steps = []
    }
    
    console.log(`Steps: ${data}`)
    console.log(data)

    data.steps = data.steps.concat([step])
    console.log(`Steps:`)
    console.log(data)
    chrome.storage.local.set({ steps:data.steps })

}

function saveTestJson() {
    let testJson = JSON.stringify(document.getElementById("story").value)
    chrome.storage.local.set({ steps:testJson })
}


async function genTestJson() {
    let steps = await chrome.storage.local.get(["steps"])
    document.getElementById("story").value = JSON.stringify(steps)
}








//=================GEN_CODE=================


function atributeNames(atributes) {
    return atributes.map(x => {return x.name}).join(", ") 
}

function atributeValues(atributes) {
    return atributes.map(x => {return x.value}).join(", ") 
}

function atributeNamesAndTypes(atributes) {
    return atributes.map(x => {return x.name + ": " + x.type}).join(", ") 
}

function genXpathString(step){
    let xpathString = ""
    if (step.index.xpath.includes("{REP}")) {
        xpathString = step.index.xpath.replace("{REP}", step.xpath)
    } else {
        xpathString = `${step.xpath}${step.index.xpath}`
    }
    return xpathString
}


function genGet(step) {
    let defAtributes = atributeNamesAndTypes(step.index.atributes)

    let xpathString = genXpathString(step)

    return `get${step.name}(${defAtributes}): Web.WebInteraction<Void> {
        return getWebElement(Sports, XPath, "${xpathString}")
    }`
}

function genFunc(step) {

    let funcAtributes = atributeNames(step.index.atributes)
    let defAtributes = atributeNamesAndTypes(step.index.atributes.concat(step.action.atributes))
    return `${step.action.name}${step.name}(${defAtributes}) {
        get${step.name}(${funcAtributes})${step.action.code}
    }`
}

function getCall(step) {

    let funcAtributes = atributeValues(step.index.atributes.concat(step.action.atributes))
    return `${step.action.name}${step.name}(${funcAtributes})`
}



function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

function genCode(steps) {
    let locatorCode = 
    steps
        .map(genGet)
        .filter(onlyUnique)
        .join("\n")
    
    let pageObjectCode =
    steps
        .map(genFunc)
        .filter(onlyUnique)
        .join("\n")

    let stepClassCode =
    steps
        .map(getCall)
        .join("\n")
    
    
    return locatorCode + "\n\n\n"+ pageObjectCode + "\n\n\n" + stepClassCode
}

async function printTestCode() {
    let data = await chrome.storage.local.get(["steps"])
    
    document.getElementById("code").value = genCode(data.steps)
}

function genRealXpathString(step){
    let xpathString = ""
    if (step.index.xpath.includes("{REP}")) {
        xpathString = step.index.realXpath.replace("{REP}", step.xpath)
    } else {
        xpathString = `${step.xpath}${step.index.realXpath}`
    }
    return xpathString
}


function checkLocator() {
    let locatorData = getLocatorData()
    let step = genStepTemplate(locatorData, locatorData.indexType, "click")

    let xpathString = genRealXpathString(step)
    // document.getElementById("check-locator-text").innerText = `${xpathString}`
        

    chrome.devtools.inspectedWindow.eval(
        numberOfXpathMatchers.toString() + "; \n" +
        `numberOfXpathMatchers("${xpathString}", $0)`, function(result) {
            console.log(result);
            document.getElementById("check-locator-text").innerText = 
            `${result.match} ${result.number}: ${xpathString}`
        }
    )



}




document.getElementById("genLocator").addEventListener("click", clickGenLocator);

for (const [key, value] of Object.entries(actionTemplates)) {
    document.getElementById(key).addEventListener("click", () => addStep(key));
}

document.getElementById("check-locator").addEventListener("click", checkLocator)

document.getElementById("genJson").addEventListener("click", genTestJson);
document.getElementById("saveJson").addEventListener("click", saveTestJson);

document.getElementById("genTestCode").addEventListener("click", printTestCode)
