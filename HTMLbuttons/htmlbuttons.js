/*
  _    _ _______ __  __ _      _           _   _                  
 | |  | |__   __|  \/  | |    | |         | | | |                 
 | |__| |  | |  | \  / | |    | |__  _   _| |_| |_ ___  _ __  ___ 
 |  __  |  | |  | |\/| | |    | '_ \| | | | __| __/ _ \| '_ \/ __|
 | |  | |  | |  | |  | | |____| |_) | |_| | |_| || (_) | | | \__ \
 |_|  |_|  |_|  |_|  |_|______|_.__/ \__,_|\__|\__\___/|_| |_|___/

some generell buttons for display in the browser
*/

BF.HTMLbuttons = {}

BF.HTMLbuttons.deleteConfirm = function(id, modalcontent, functionstring, config){
    let conf = Object.assign({
        colorDeleteBG: "red",
        colorDelete: "white",
        colorCancelBG: "#ccc",
        colorCancel: "black",
        colorBG: "orange",
        color: "black",

        position: "middle center",
    }, config);
    
    let html = `<button class="${id}modalOpen" onclick="let stx = document.getElementById('${id}').style; stx.display='block';">Delete</button>`
    html += `<div id="${id}" class="${id}modal">`
    html += `<span onclick="document.getElementById('${id}').style.display='none'" class="${id}modalClose" title="Close Modal">×</span>`
    html += modalcontent
    html += `<div class="${id}modalClearfix"><button type="button" onclick="document.getElementById('${id}').style.display='none'" class="${id}modalCancelbtn">Cancel</button><button type="button" onclick="document.getElementById('${id}').style.display='none';${functionstring}" class="${id}modalDeletebtn">Delete</button></div>`
    html += `</div><br clear="all">`

    //Set a style for all buttons
    let css = `.${id}modalOpen {background-color: ${conf.colorDeleteBG}; color: ${conf.colorDelete}; padding: 14px 20px; margin: 8px 0; border: none; cursor: pointer; opacity: 0.9; width:200px}`
    css += `.${id}modalCancelbtn, .${id}modalDeletebtn{padding: 14px 20px; margin: 8px 0; border: none; cursor: pointer; opacity: 0.9; float: left; width: 50%;}\n` //Float cancel and delete buttons and add an equal width
    css += `.${id}modalCancelbtn:hover, .${id}modalDeletebtn:hover {opacity: 0.5;}`
    css += `.${id}modalCancelbtn {background-color: ${conf.colorCancelBG}; color: ${conf.colorCancel};}` //add color to the cancel Button
    css += `.${id}modalDeletebtn {background-color: ${conf.colorDeleteBG}; color: ${conf.colorDelete};}`  //add color to the delete Button

    css += `.${id}modalClose {float: right; font-size: 40px; font-weight: bold; color: ${conf.color};}` //The Modal Close Button (x)
    css += `.${id}modalClose:hover, .${id}modalClose:focus { color: #f44336; cursor: pointer;}`
    css += `.${id}modalClearfix::after { content: ""; clear: both; display: table;}`

    css += `.${id}modal {display:none; position: fixed; padding: 16px; text-align: center; background-color:${conf.colorBG}; color:${conf.color};}`
    if(conf.position == "middle center")
        css += `.${id}modal {left:50%; top:50%; transform: translate(-50%, -50%);}`

    return [html, css]
}
