/*
   ____   _____  _____ _    _ _____ 
  / __ \ / ____|/ ____| |  | |_   _|
 | |  | | (___ | |  __| |  | | | |  
 | |  | |\___ \| | |_ | |  | | | |  
 | |__| |____) | |__| | |__| |_| |_ 
  \____/|_____/ \_____|\____/|_____|

create a os like gui with a desktop and windows
*/

BF.osgui = function(config){
    //definitions
    this.config = Object.assign({
        htmlObject: document.createElement("div"),
        width: "100vw",
        height: "80vh",
        heightTaskbar: "40px",

        border: {desktop: "1px solid black", taskbar: "2px solid red"},
        desktop: true,
    }, config);
    this.windows = []

    this.init = function(){
        this.mainDiv = document.createElement("div")
        this.mainDiv.style.width = this.config.width
        this.mainDiv.style.height = this.config.height
        this.mainDiv.style.border = this.config.border.desktop
        this.mainDiv.style["box-sizing"] = "border-box"

        if(this.config.desktop){
            let taskbar = document.createElement("div")
            taskbar.style.width = "100%"
            taskbar.style["box-sizing"] = "border-box"
            taskbar.style.height = this.config.heightTaskbar
            taskbar.style.border = this.config.border.taskbar
            taskbar.style.position = "relative"
            taskbar.style.top = "0px"
            taskbar.style.left = "0px"

            this.mainDiv.appendChild(taskbar)
        }

        this.config.htmlElement.appendChild(this.mainDiv)
    }

    this.createWindow = function(c){

    }

    return this
}