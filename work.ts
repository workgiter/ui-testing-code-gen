interface Action {
    locator: Locator
    pageObjectCode: String
    stepClassCode: String
}

interface Locator {
    name: String,
    xpath: String,
    callPattern: () => String,
    initPattern: () => String,
    locatorCode: () => String,
    getElement: () => HTMLElement | null
}

interface Data {
    steps: Action[],
}


function ClickAction(locator: Locator): Action {
    locator.getElement()?.click()
    return {
        locator: locator,
        pageObjectCode: `click${locator.initPattern()} {get${locator.callPattern()}.click()}`,
        stepClassCode: `click${locator.callPattern()}`,
    }
}

function IsDisplayedAction(locator: Locator): Action {
    return {
        locator: locator,
        pageObjectCode: `isDisplayed${locator.initPattern()} {get${locator.callPattern()}.isDisplayed()}`,
        stepClassCode: `isDisplayed${locator.callPattern()}`,
    }
}

function Locator(name, xpath): Locator {
    return {
        name: name,
        xpath: xpath,
        callPattern: function() {return `${this.name}()`},
        initPattern: function() {return `${this.name}()`},
        locatorCode: function() {return `get${this.initPattern()} {getElement(sports, XPATH, "${this.xpath}")}`},
        getElement: function() {return getElementsByXPath(this.xpath)[0] as HTMLElement;}
    }
}


// q.g -> q.genXpath() //console.log's xpath locator based of element
// paste into seach bar and trim down to desired locator
// q.l -> q.locator(name: String, xpath: String) // new locator object, overwrites step
// q.s -> q.step.click() // create click action, then performs click action
// q.code() // generates all code for performed actions

function getElementsByXPath(xpath) {
    return Array.from((function*(){ let iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null); let current = iterator.iterateNext(); while(current){ yield current; current = iterator.iterateNext(); }  })());
}


let genLocator = () => {
	let el: HTMLElement = $0
    let xpath = ""
	if (el.id != '') {
        xpath = `//${el.tagName}[@id='${el.id}']`
	} else {
		let CSSclass = el.getAttribute("class")
        xpath = `//${el.tagName}[contains(concat('⦿', @class, '⦿'), '⦿${CSSclass}⦿')]`
        if (getElementsByXPath(xpath).length > 1) {
            xpath = xpath + `[.='${el.textContent}']`
        }
	}
    q.currentLocator = Locator("Name", xpath)
    console.log(xpath)
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

let code = (actions: Action[]) => {
    let locatorCode = 
        actions
            .map(action => {return action.locator.locatorCode()})
            .filter(onlyUnique)
            .join("\n")
    
    let pageObjectCode =
        actions
            .map(action => {return action.pageObjectCode})
            .filter(onlyUnique)
            .join("\n")

    let stepClassCode =
        actions
            .map(action => {return action.stepClassCode})
            .join("\n")

    console.log(locatorCode + "\n\n\n"+ pageObjectCode + "\n\n\n" + stepClassCode)
}




let data: Data = {
    steps: []
}


let q = {
    currentLocator: Locator("name", "xpath"),
    genXpath: genLocator,
    locator: {
        default: (name, xpath) => {q.currentLocator = Locator(name, xpath)}
    },
    action: {
        click: () => {data.steps.push(ClickAction(q.currentLocator))},
        isDisplayed: () => {data.steps.push(IsDisplayedAction(q.currentLocator))}
    },
    code: () => {code(data.steps)}
}