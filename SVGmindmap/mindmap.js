/*
  __  __ _____ _   _ _____  __  __          _____  
 |  \/  |_   _| \ | |  __ \|  \/  |   /\   |  __ \ 
 | \  / | | | |  \| | |  | | \  / |  /  \  | |__) |
 | |\/| | | | | . ` | |  | | |\/| | / /\ \ |  ___/ 
 | |  | |_| |_| |\  | |__| | |  | |/ ____ \| |     
 |_|  |_|_____|_| \_|_____/|_|  |_/_/    \_\_|     

create awesome mindmaps, only with svg
*/

if(typeof BF.svg == "undefined") BF.svg = {}

BF.svg.mindmap = function(){
    let T = this

    //internal functions
    let I = {
        calcPositionsCompress: function(){
            //calculate the positions of the single nodes
            let positions = []
            let positionsXY = []
            let maxHeight = 0
            let maxHeightLinesPx = 0
            {
                let positionsLeft = []
                let positionsRight = []

                //calculate positions of nodes
                let calcPositions;calcPositions = function(id, positionArray, depth){
                    if(!positionArray[depth]) positionArray[depth] = []
                    let textLines = I.calcTextLines(I.data[id].title, I.data[id].size?I.data[id].size:I.conf.boxTextPx)
                    positionArray[depth][positionArray[depth].length] = [id, textLines, textLines.length*(I.data[id].size?I.data[id].size:I.conf.boxTextPx)]  //insert actual node
                    
                    if(I.data[id].sub && I.data[id].sub.length != 0){
                        for(let i=0; i < I.data[id].sub.length; i++){
                            calcPositions(I.data[id].sub[i], positionArray, depth+1)
                        }
                    }
                }
                //left and right arm calculation
                for(let i=0; i < I.data[0].sub.length; i++){
                    if(I.data[0].pos[i] == "right"){
                        calcPositions(I.data[0].sub[i], positionsRight, 0)
                    }
                    if(I.data[0].pos[i] == "left"){
                        calcPositions(I.data[0].sub[i], positionsLeft, 0)
                    }
                }

                let textLines = this.calcTextLines(I.data[0].title, I.data[0].size?I.data[0].size:conf.boxTextPx)
                positions = [...(positionsLeft.reverse()), [[0, textLines, textLines.length*(I.data[0].size?I.data[0].size:I.conf.boxTextPx)]], ...positionsRight]
                maxHeight = Math.max(...positions.map(e=>e.length), 0)
                maxHeightLinesPx = Math.max(...positions.map(e=>{return e.map(ee=>ee[2]).reduce((a,b)=>a+b)}))

                
                positions.forEach((columE,colum)=>{    //foreach column
                    let x = colum*(I.conf.boxLength+I.conf.boxDistance[0])+I.conf.boxDistance[0]/2
                    let linesSum = columE.map(ee=>ee[2]).reduce((a,b)=>a+b)
                    let y = (maxHeightLinesPx-linesSum)/2+(maxHeight-columE.length)/2*I.conf.boxDistance[1]
                    
                    columE.forEach((nodeE, row)=>{     //foreach node
                        let lines = nodeE[1].length
                        positionsXY[nodeE[0]] = {x:x, y:y, width:I.conf.boxLength, height:nodeE[2]+2, text:nodeE[1]}
                        y += I.conf.boxTextPx*lines+I.conf.boxDistance[1]
                    })
                })
            }
            //console.log(positions, positions.length, maxHeight, maxHeightLinesPx)
            return [positions.length, maxHeight, maxHeightLinesPx, positionsXY]
        },
        calcedTextLength: function(str, size=16){
            let length = 0
            for (var i = 0; i < str.length; i++) {
                let index = I.conf.charNumber16px.indexOf(str.charAt(i))
                if(index == -1){
                    console.log("Character '"+str.charAt(i)+"' not found")
                    index = I.conf.charNumber16px.indexOf('_')
                }
                length += I.conf.charLength16px[index]*size/16
            }
            return length
        },
        calcTextLines: function(str, size){
            let text = []
            let textI = -1
            let emptySize = I.calcedTextLength(" ", size)
            str.split("\n").forEach(s=>{
                textI++
                text[textI] = ""
                let lineLength = 0

                s.split(" ").forEach(word=>{
                    lineLength += I.calcedTextLength(word, size) + emptySize
                    if(lineLength <= I.conf.boxLength){
                        text[textI] += word + " "
                    }else{
                        textI++
                        lineLength = I.calcedTextLength(word, size) + emptySize
                        text[textI] = word + " "
                    }
                })
            })
            return text
        },
        drawLines: function(svg, positionsXY){
            //draw lines
            let drawLine = function(p1, p2, color="black", strokeWidth=1.5){
                return '<path d="M '+p1[0]+' '+p1[1]+' C '+p2[0]+' '+p1[1]+', '+p1[0]+' '+p2[1]+', '+p2[0]+' '+p2[1]+'" fill="none" stroke-width="'+strokeWidth+'" stroke="'+color+'"/>'
            }
            for(let id = 0; id < I.nrData; id++){
                for(let s = 0; I.data[id].sub && s < I.data[id].sub.length; s++){
                    //check positions
                    if(positionsXY[id].x < positionsXY[I.data[id].sub[s]].x)    //right arm
                        svg[svg.length] = drawLine([positionsXY[id].x+positionsXY[id].width, positionsXY[id].y+positionsXY[id].height/2], [positionsXY[I.data[id].sub[s]].x, positionsXY[I.data[id].sub[s]].y+positionsXY[I.data[id].sub[s]].height/2], I.conf.colorLine)
                    if(positionsXY[id].x > positionsXY[I.data[id].sub[s]].x)    //left arm
                        svg[svg.length] = drawLine([positionsXY[id].x, positionsXY[id].y+positionsXY[id].height/2], [positionsXY[I.data[id].sub[s]].x+positionsXY[I.data[id].sub[s]].width, positionsXY[I.data[id].sub[s]].y+positionsXY[I.data[id].sub[s]].height/2], I.conf.colorLine)
                }
            }
        },
        dynamic_change2Textbox: function(GroupElement){
            //set nodes to opacity 0
            GroupElement.children[0].style.opacity = 0  //rect
            GroupElement.children[1].style.opacity = 0  //text group

            let text = ""
            for(let i=0; i < GroupElement.children[1].children.length; i++){
                text += '<div>' + GroupElement.children[1].children[i].textContent + '</div>'
            }

            let foreign = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject')
            foreign.setAttribute("width", GroupElement.children[0].getAttribute("width")+"px")
            foreign.setAttribute("height", "1000px")
            
            foreign.requiredExtensions = "http://www.w3.org/1999/xhtml"
            let html = '<body xmlns="http://www.w3.org/1999/xhtml">'
            html += '<div width="100%" style="height:auto;border: 2px solid red;font-size:'+GroupElement.children[1].children[0].getAttribute('font-size')+'px;font-family:'+I.conf.font+'" contenteditable="true">'
            html += text
            html += '</div>'
            html += '</body>'
            foreign.innerHTML = html
            GroupElement.appendChild(foreign)
        },
        dynamic_change2node: function(GroupElement){
            //set nodes to opacity 1
            GroupElement.children[0].style.removeProperty('opacity')    //rect
            GroupElement.children[1].style.removeProperty('opacity')    //text

            //get text
            let text = GroupElement.children[2].children[0].innerHTML
            text = text.replaceAll('<br>','').replaceAll('<div>','').replaceAll('</div>','<br>').replaceAll('&nbsp;','')
            text = text.split('<br>').map(e=>e.replace(/\s+$/g, '')).join('\n')
            text = text.replace(/\s+$/g, '') //replace all newlines at end of string

            GroupElement.removeChild(GroupElement.children[2])

            //update the I.data object
            let id = GroupElement.getAttribute("nodeid")
            I.data[id].title = text

            //redraw the whole svg
            I.dynamic_svgRedraw()
        },
        dynamic_svgRedraw: async function(){
            T.dyn_svg.outerHTML = T.svgDynamic()
            T.dyn_svg = null
        },
        dynamic_calcPos: function(event){
            if(!T.pt)
                T.pt = T.dyn_svg.createSVGPoint()

            T.pt.x = event.clientX
            T.pt.y = event.clientY
            
            T.pt = T.pt.matrixTransform(T.dyn_svg.getScreenCTM().inverse())
            return [Math.floor(T.pt.x), Math.floor(T.pt.y)]
        },
        dynamic_checkIfSubOfNode: function(id, searchNodeID){
            if(I.data[id].sub){
                if(I.data[id].sub.includes(searchNodeID)){
                    return true
                }else{
                    let ret = false
                    for(let i=0; i < I.data[id].sub.length; i++){
                        ret |= I.dynamic_checkIfSubOfNode(I.data[id].sub[i], searchNodeID)
                    }
                    return ret
                }
            }
            return false
        },

    }

    T.setData = function(config, data){
        I.conf = Object.assign({
            size: [400, 400],   //width, height  this is the display size   [-1,-1] for the original size
            boxLength: 100,
            boxDistance: [30,16],
            boxTextPx: 16,

            //TODO
            display: 'compress',    //the mode for display. 'compress': for most smallest image, 'normal' for most nice display
    
            colorText:"black",
            colorBorder:"black",
            colorBack:"transparent",
            colorLine:"black",
    
            font: 'New Times Roman,serif',  //default svg font
            charNumber16px: BF.svg.mindmapDefaultCharArray,
            charLength16px: [11.55,10.67,10.67,11.55,9.77,8.90,11.55,11.55,5.33,6.23,11.55,9.77,14.23,11.55,11.55,8.90,11.55,10.67,8.90,9.77,11.55,11.55,15.10,11.55,11.55,9.77,7.10,8.00,7.10,8.00,7.10,5.33,8.00,8.00,4.45,4.45,8.00,4.45,12.45,8.00,8.00,8.00,8.00,5.33,6.23,4.45,8.00,8.00,11.55,8.00,8.00,7.10,11.55,7.10,11.55,8.00,11.55,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,4.00,4.00,4.45,4.45,7.10,5.33,8.00,8.00,4.45,4.00,8.00]
        }, config);
    
        I.nrData = data.length
        if(I.nrData == 0){
            return ""
        }
        I.data = data
    }
    T.getData = function(){
        return I.data
    }

    T.svg = function(){
        let calc = I.calcPositionsCompress()    //TODO: display mode: normal
        let positionsLength = calc[0]
        let maxHeight = calc[1]
        let maxHeightLinesPx = calc[2]
        let positionsXY = calc[3]

        let svg = [ '<svg xmlns="http://www.w3.org/2000/svg" font-family="'+I.conf.font+'" ',
                    'width="'+(I.conf.size[0]==-1?positionsLength*(I.conf.boxLength+I.conf.boxDistance[0]):I.conf.size[0])+'" height="'+(I.conf.size[1]==-1?(maxHeightLinesPx+maxHeight*I.conf.boxDistance[1]):I.conf.size[1])+'" ',
                    'viewBox="0 0 '+positionsLength*(I.conf.boxLength+I.conf.boxDistance[0])+' '+(maxHeightLinesPx+maxHeight*I.conf.boxDistance[1])+'" ',
                    '>']

        //draw nodes
        positionsXY.forEach((N,id) => {
            svg[svg.length] = '<g transform="translate('+N.x+','+N.y+')">'
            //draw rectangle around
            svg[svg.length] = '<rect width="'+N.width+'" height="'+N.height+'" style="fill:'+(I.data[id].colorBack?I.data[id].colorBack:I.conf.colorBack)+';stroke-width:1px;stroke:'+(I.data[id].colorBorder?I.data[id].colorBorder:I.conf.colorBorder)+';"></rect>'
            //draw text inside the rectangle
            let size = (I.data[id].size?I.data[id].size:I.conf.boxTextPx)
            N.text.forEach((t,line)=>{
                svg[svg.length] = '<text y="'+(size*(line+1)-1)+'" font-size="'+(I.data[id].size?I.data[id].size:I.conf.boxTextPx)+'" style="fill:'+(I.data[id].colorText?I.data[id].colorText:I.conf.colorText)+'">'+t+'</text>'
            })
            svg[svg.length] = '</g>'
        })
        
        I.drawLines(svg, positionsXY)
        
        return svg.join("")+'</svg>'
    }

    T.lastID = null
    T.lastGroup = null
    T.firstClick = false
    T.isDown = false
    T.newParent = null
    let ID = performance.now()
    T.svgDynamic = function(){
        if(!BF.svg.mindmap.func) BF.svg.mindmap.func = {}
        BF.svg.mindmap.func[ID+"_c"] = function(event){
            if(!T.dyn_svg){
                T.dyn_svg = event.target
                while(true){
                    if(T.dyn_svg.tagName != "svg")
                        T.dyn_svg = T.dyn_svg.parentElement
                    else
                        break
                }
            }

            T.isDown = true
            if(["text", "rect", "div", "g"].includes(event.target.tagName.toLowerCase())){
                let g = event.target
                let id = null
                while(true){
                    id = g.getAttribute("nodeid")   //get nodeID
                    if(id == null)
                        g = g.parentElement
                    else
                        break
                }
                id = parseInt(id)

                if(T.lastID != id){
                    if(T.lastGroup && T.lastGroup.children.length == 3) I.dynamic_change2node(T.lastGroup)      //set textbox back
                    T.firstClick = true     //first click
                    T.lastID = id
                    T.lastGroup = g

                    T.pos = I.dynamic_calcPos(event)
                }else{
                    T.firstClick = false    //second click
                    if(g.children.length == 2) I.dynamic_change2Textbox(g)  //change texts into textbox
                }
            }else{
                if(T.lastGroup && T.lastGroup.children.length == 3) I.dynamic_change2node(T.lastGroup)  //set textbox back
                T.firstClick = false
                T.lastID = null
                T.lastGroup = null
            }
        }
        BF.svg.mindmap.func[ID+"_u"] = function(event){
            if(event.type == "pointerout" && event.target.tagName != "svg")
                return
            if(event.type == "pointerout" && ["text", "g", "rect"].includes(event.relatedTarget.tagName))
                return
            
            T.isDown = false

            //if move was done (new parent Node) redraw SVG
            if(T.newParent != null){
                let oldParent = null
                let index = null
                for(let i=0; i < I.data.length; i++){
                    if(I.data[i].sub && I.data[i].sub.includes(T.lastID)){
                        oldParent = i
                        index = I.data[i].sub.indexOf(T.lastID)
                    }
                }

                //check if you does not drag a parent node to its own sub node
                
                if(!I.dynamic_checkIfSubOfNode(T.lastID, T.newParent)){
                    //delete Reference
                    I.data[oldParent].sub.splice(index, 1)
                    if(oldParent == 0)  //root, position
                        I.data[oldParent].pos.splice(index, 1)
                    
                    //new reference
                    if(!I.data[T.newParent].sub)
                        I.data[T.newParent].sub = []
                    I.data[T.newParent].sub[I.data[T.newParent].sub.length] = T.lastID
                    if(T.newParent == 0)  //root, position
                        I.data[T.newParent].pos[I.data[T.newParent].pos.length] = T.LeftRight
                }

                T.newParent = null
                T.lastID = null
                T.lastGroup = null
                T.firstClick = false

                I.dynamic_svgRedraw()
            }
        }
        BF.svg.mindmap.func[ID+"_m"] = function(event){
            //check if pointer is down and then move a node
            if(T.firstClick && T.isDown){
                let id = parseInt(T.lastGroup.getAttribute("nodeid"))
                if(id == 0)
                    return      //ROOT node
                //move node
                let pos = I.dynamic_calcPos(event)
                let transform = T.lastGroup.getAttribute("transform").match(/-?\d+/g)
                let x = parseInt(transform[0]) + pos[0] - T.pos[0]
                let y = parseInt(transform[1]) + pos[1] - T.pos[1]
                T.lastGroup.setAttribute("transform", "translate("+x+","+y+")")
                T.pos = pos

                //get new parent group
                let groupPos = Math.floor(x / (I.conf.boxLength+I.conf.boxDistance[0]))
                T.LeftRight = false   //if false, node is at root Element
                if(Math.floor(T.calc[3][0].x / (I.conf.boxLength+I.conf.boxDistance[0])) < groupPos)
                    T.LeftRight = 'right'
                else if(Math.floor(T.calc[3][0].x / (I.conf.boxLength+I.conf.boxDistance[0])) > groupPos)
                    T.LeftRight = 'left'

                T.newParent = null
                let line = document.getElementById(ID+"_direct")
                line.style.setProperty("opacity", "0")
                if(T.LeftRight == 'left'){
                    //get new parent node
                    let x1 = x + I.conf.boxLength
                    let a = T.calc[3].map((e,i)=>{
                        if(i == id)
                            return Number.POSITIVE_INFINITY
                        return Math.sqrt((x1-e.x)**2+(y-e.y)**2)
                    })
                    T.newParent = a.indexOf(Math.min(...a))

                    if(!I.dynamic_checkIfSubOfNode(T.lastID, T.newParent)){
                        //display direct line
                        line.style.setProperty("opacity", "1")
                        line.setAttribute("x1", x1)
                        line.setAttribute("y1", y+T.calc[3][id].height/2)
                        line.setAttribute("x2", T.calc[3][T.newParent].x)
                        line.setAttribute("y2", T.calc[3][T.newParent].y+T.calc[3][T.newParent].height/2)
                    }else{
                        T.newParent = null
                    }
                }else if(T.LeftRight == 'right'){
                    //get new parent node
                    let a = T.calc[3].map((e,i)=>{
                        if(i == id)
                            return Number.POSITIVE_INFINITY
                        return Math.sqrt((x-e.x-I.conf.boxLength)**2+(y-e.y)**2)
                    })
                    T.newParent = a.indexOf(Math.min(...a))
                    
                    if(!I.dynamic_checkIfSubOfNode(T.lastID, T.newParent)){
                        //display direct line
                        line.style.setProperty("opacity", "1")
                        line.setAttribute("x1", x)
                        line.setAttribute("y1", y+T.calc[3][id].height/2)
                        line.setAttribute("x2", T.calc[3][T.newParent].x+I.conf.boxLength)
                        line.setAttribute("y2", T.calc[3][T.newParent].y+T.calc[3][T.newParent].height/2)
                    }else{
                        T.newParent = null
                    }
                }
            }
        }

        T.calc = I.calcPositionsCompress()    //TODO: display mode: normal
        let positionsLength = T.calc[0]+2
        let maxHeight = T.calc[1]
        let maxHeightLinesPx = T.calc[2]
        let positionsXY = T.calc[3]

        let w = I.conf.size[0]==-1?positionsLength*(I.conf.boxLength+I.conf.boxDistance[0]):I.conf.size[0]
        let h = I.conf.size[1]==-1?(maxHeightLinesPx+maxHeight*I.conf.boxDistance[1]):I.conf.size[1]
        T.scale = Math.max(
            (I.conf.boxLength + positionsLength*(I.conf.boxLength+I.conf.boxDistance[0]))/w,
            (0 + maxHeightLinesPx+maxHeight*I.conf.boxDistance[1]) / h
        )

        let svg = [ '<svg xmlns="http://www.w3.org/2000/svg" font-family="'+I.conf.font+'" ',
                    'width="'+w+'" height="'+h+'" ',
                    'viewBox="-'+I.conf.boxLength+' 0 '+positionsLength*(I.conf.boxLength+I.conf.boxDistance[0])+' '+(maxHeightLinesPx+maxHeight*I.conf.boxDistance[1])+'" ',
                    'onpointermove="BF.svg.mindmap.func[\''+ID+'_m\'](event)" ',
                    'onpointerdown="BF.svg.mindmap.func[\''+ID+'_c\'](event)" ',
                    'onpointerup="BF.svg.mindmap.func[\''+ID+'_u\'](event)" ',
                    'onpointerleave="BF.svg.mindmap.func[\''+ID+'_u\'](event)" ',
                    'onpointerout="BF.svg.mindmap.func[\''+ID+'_u\'](event)" ',
                    'onpointercancel="BF.svg.mindmap.func[\''+ID+'_u\'](event)" ',
                    'onlostpointercapture="BF.svg.mindmap.func[\''+ID+'_u\'](event)" ',
                    'style="-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;-ms-touch-action: manipulation;touch-action:manipulation;"',
                    '>']
        svg[svg.length] = '<line id="'+ID+'_direct" style="opacity:0" stroke="black" stroke-width="3"/>'

        I.drawLines(svg, positionsXY)

        //draw nodes
        positionsXY.forEach((N,id) => {
            svg[svg.length] = '<g transform="translate('+N.x+','+N.y+')" nodeid="'+id+'">'
            //draw rectangle around
            svg[svg.length] = '<rect width="'+N.width+'" height="'+N.height+'" style="fill:'+(I.data[id].colorBack?I.data[id].colorBack:I.conf.colorBack)+';stroke-width:1px;stroke:'+(I.data[id].colorBorder?I.data[id].colorBorder:I.conf.colorBorder)+';"></rect>'
            //draw text inside the rectangle
            let size = (I.data[id].size?I.data[id].size:I.conf.boxTextPx)
            svg[svg.length] = '<g>'
            N.text.forEach((t,line)=>{
                svg[svg.length] = '<text y="'+(size*(line+1)-1)+'" font-size="'+(I.data[id].size?I.data[id].size:I.conf.boxTextPx)+'" style="fill:'+(I.data[id].colorText?I.data[id].colorText:I.conf.colorText)+'">'+t+'</text>'
            })
            svg[svg.length] = '</g></g>'
            svg[svg.length] = '</g>'

        })
        
        return svg.join("")+'</svg>'
    }

    return this
}

BF.svg.mindmapDefaultCharArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','Ä','ä','Ö','ö','Ü','ü','ß','0','1','2','3','4','5','6','7','8','9','.',',',';',':','?','!','#','*','/',' ', '_']
BF.svg.mindmapCalcCharLength = function(charArray, font="New Times Roman,serif", fontSize="16px"){
    let result = []
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.style.opacity = 0
	document.body.append(svg)
	
	let t = document.createElementNS('http://www.w3.org/2000/svg', 'text')
	svg.appendChild(t)
    t.setAttribute('y', 20)
	t.setAttribute('font-family', font)
    t.setAttribute('font-size', fontSize)

    charArray.forEach((e,i)=>{
        if(e == ' '){
            t.textContent = "_ _"
            let BBox = t.getBBox()
            t.textContent = "__"
            result[i] = (BBox.width-t.getBBox().width).toFixed(2)
        }else{
            t.textContent = e
            let BBox = t.getBBox()
            result[i] = BBox.width.toFixed(2)
        }
    })

    document.body.removeChild(svg)  //remove svg
    return result
}