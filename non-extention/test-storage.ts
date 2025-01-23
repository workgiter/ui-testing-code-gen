
let elementText = [{
    name: "elementText",
    type: "String",
    value: "Sports"
}]


let steps = [
    {
        page: "main",
        name: "login",
        xpath: "[@id='login']",
        index: {
            xpath: "[.=$text]",
            atributes:[
                {
                    name: "elementText",
                    type: "String",
                    value: "Sports"
                }
            ]
        },

        action: {
            name: "click",
            code: ".perform(WebClick)",
            atributes: []
        }
    },

    {
        page: "main",
        name: "submitLogin",
        xpath: "[@id='submit']",
        index: {
            xpath: "[.=$elementText]",
            atributes:[
                {
                    name: "elementText",
                    type: "String",
                    value: "Sports"
                }
            ]
        },

        action: {
            name: "verify",
            code: ".checkText(elementText)",
            atributes:[
                {
                    name: "elementText",
                    type: "String",
                    value: "Submit"
                }
            ]
        }
    },

    {
        page: "main",
        name: "submitLogin",
        xpath: "[@id='submit']",
        index: {
            xpath: "[.=$elementText]",
            atributes:[
                {
                    name: "elementText",
                    type: "String",
                    value: "Sports"
                }
            ]
        },

        action: {
            name: "click",
            code: ".perform(WebClick)",
            atributes: []
        }
    },

    {
        page: "main",
        name: "allSports",
        xpath: "[@class='all-sports']",
        index: {
            xpath: "",
            atributes:[]
        },

        action: {
            name: "click",
            code: ".perform(WebClick)",
            atributes: []
        }
    }

]



function atributeNames(atributes) {
    return atributes.map(x => {return x.name}).join(", ") 
}

function atributeValues(atributes) {
    return atributes.map(x => {return x.value}).join(", ") 
}

function atributeNamesAndTypes(atributes) {
    return atributes.map(x => {return x.name + ": " + x.type}).join(", ") 
}


function genGet(step) {
    
    let defAtributes = atributeNamesAndTypes(step.index.atributes)
    return `get${step.name}(${defAtributes}): Web.WebInteraction<Void> {
        return getWebElement(Sports, XPath, "${step.xpath}${step.index.xpath}")
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
    return `${step.action.name}${step.name}()`
}



function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

function genCode() {
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
    
    
    console.log(locatorCode + "\n\n\n"+ pageObjectCode + "\n\n\n" + stepClassCode)
}