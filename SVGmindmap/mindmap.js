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

BF.svg.mindmap = function(config, data){
    let conf = Object.assign({
        size: [400, 400],   //width, height  this is the display size   [-1,-1] for the original size
        boxLength: 100,
        boxDistance: [30,16],
        boxTextPx: 16,
        color:{
            text:"black",
            border:"black",
            back:"transparent",
            line:"black"
        },

        mode: 'static',     //modes are 'static' and 'dynamic'
        font: 'New Times Roman,serif',  //default svg font
        charNumber16px: BF.svg.mindmapDefaultCharArray,
        charLength16px: [11.55,10.67,10.67,11.55,9.77,8.90,11.55,11.55,5.33,6.23,11.55,9.77,14.23,11.55,11.55,8.90,11.55,10.67,8.90,9.77,11.55,11.55,15.10,11.55,11.55,9.77,7.10,8.00,7.10,8.00,7.10,5.33,8.00,8.00,4.45,4.45,8.00,4.45,12.45,8.00,8.00,8.00,8.00,5.33,6.23,4.45,8.00,8.00,11.55,8.00,8.00,7.10,11.55,7.10,11.55,8.00,11.55,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,8.00,4.00,4.00,4.45,4.45,7.10,5.33,8.00,8.00,4.45,4.00,8.00]
    }, config);

    let nrData = data.length
    if(nrData == 0){
        return ""
    }

    //functions
    let calcedTextLength = function(str, size=16){
        let length = 0
        for (var i = 0; i < str.length; i++) {
            let index = conf.charNumber16px.indexOf(str.charAt(i))
            if(index == -1){
                console.log("Character '"+str.charAt(i)+"' not found")
                index = conf.charNumber16px.indexOf('_')
            }
            length += conf.charLength16px[index]*size/16
        }
        return length
    }
    let calcTextLines = function(str, size){
        let text = []
        let textI = -1
        str.split("\n").forEach(s=>{
            textI++
            text[textI] = ""
            let lineLength = 0

            s.split(" ").forEach(word=>{
                lineLength += calcedTextLength(word, size)
                if(lineLength <= conf.boxLength){
                    text[textI] += word + " "
                }else{
                    textI++
                    lineLength = 0
                    text[textI] = word
                }
            })
        })
        return text
    }
    
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
            let textLines = calcTextLines(data[id].title, data[id].size?data[id].size:conf.boxTextPx)
            positionArray[depth][positionArray[depth].length] = [id, textLines, textLines.length*(data[id].size?data[id].size:conf.boxTextPx)]  //insert actual node
            
            if(data[id].sub && data[id].sub.length != 0){
                for(let i=0; i < data[id].sub.length; i++){
                    calcPositions(data[id].sub[i], positionArray, depth+1)
                }
            }
        }
        for(let i=0; i < data[0].sub.length; i++){
            if(data[0].pos[i] == "right"){
                calcPositions(data[0].sub[i], positionsRight, 0)
            }
            if(data[0].pos[i] == "left"){
                calcPositions(data[0].sub[i], positionsLeft, 0)
            }
        }

        let textLines = calcTextLines(data[0].title, data[0].size?data[0].size:conf.boxTextPx)
        positions = [...positionsLeft, [[0, textLines, textLines.length*(data[0].size?data[0].size:conf.boxTextPx)]], ...positionsRight]
        maxHeight = Math.max(...positions.map(e=>e.length), 0)
        maxHeightLinesPx = Math.max(...positions.map(e=>{return e.map(ee=>ee[2]).reduce((a,b)=>a+b)}))
    }
    //console.log(positions, positions.length, maxHeight, maxHeightLinesPx)
    
    let x = positions.length
    let svg = ['<svg xmlns="http://www.w3.org/2000/svg" font-family="'+conf.font+'" width="'+(conf.size[0]==-1?x*(conf.boxLength+conf.boxDistance[0]):conf.size[0])+'" height="'+(conf.size[1]==-1?(maxHeightLinesPx+maxHeight*conf.boxDistance[1]):conf.size[1])+'" viewBox="0 0 '+x*(conf.boxLength+conf.boxDistance[0])+' '+(maxHeightLinesPx+maxHeight*conf.boxDistance[1])+'">']
    let svgI = 0

    //draw nodes
    positions.forEach((columE,colum)=>{    //foreach column
        let x = colum*(conf.boxLength+conf.boxDistance[0])+conf.boxDistance[0]/2
        let linesSum = columE.map(ee=>ee[2]).reduce((a,b)=>a+b)
        let y = (maxHeightLinesPx-linesSum)/2+(maxHeight-columE.length)/2*conf.boxDistance[1]
        
        columE.forEach((nodeE, row)=>{     //foreach node
            let lines = nodeE[1].length
            positionsXY[nodeE[0]] = [x, y, conf.boxLength, nodeE[2]+2]

            svg[++svgI] = '<rect x="'+x+'" y="'+y+'" width="'+positionsXY[nodeE[0]][2]+'" height="'+positionsXY[nodeE[0]][3]+'" style="fill:'+(data[nodeE[0]].color&&data[nodeE[0]].color.back?data[nodeE[0]].color.back:conf.color.back)+';stroke-width:1px;stroke:'+(data[nodeE[0]].color&&data[nodeE[0]].color.border?data[nodeE[0]].color.border:conf.color.border)+';"></rect>'
            nodeE[1].forEach((t,line)=>{
                svg[++svgI] = '<text x="'+x+'" y="'+(y+(data[nodeE[0]].size?data[nodeE[0]].size:conf.boxTextPx)*(line+1))+'" font-size="'+(data[nodeE[0]].size?data[nodeE[0]].size:conf.boxTextPx)+'" style="fill:'+(data[nodeE[0]].color&&data[nodeE[0]].color.text?data[nodeE[0]].color.text:conf.color.text)+'">'+t+'</text>'
            })
            y += conf.boxTextPx*lines+conf.boxDistance[1]
        })
    })
    
    //draw lines
    let drawLine = function(p1, p2, color="black", strokeWidth=1.5){
        return '<path d="M '+p1[0]+' '+p1[1]+' C '+p2[0]+' '+p1[1]+', '+p1[0]+' '+p2[1]+', '+p2[0]+' '+p2[1]+'" fill="none" stroke-width="'+strokeWidth+'" stroke="'+color+'"/>'
    }
    for(let id = 0; id < nrData; id++){
        if(data[id].sub && data[id].sub.length != 0){
            for(let s = 0; s < data[id].sub.length; s++){
                svg[++svgI] = drawLine([positionsXY[id][0]+positionsXY[id][2], positionsXY[id][1]+positionsXY[id][3]/2], [positionsXY[data[id].sub[s]][0], positionsXY[data[id].sub[s]][1]+positionsXY[data[id].sub[s]][3]/2], conf.color.line)
            }
        }
    }
    
    
    return svg.join("")+'</svg>'
}

BF.svg.mindmapDefaultCharArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','Ä','ä','Ö','ö','Ü','ü','ß','0','1','2','3','4','5','6','7','8','9','.',',',';',':','?','!','#','*','/',' ', '_']

BF.svg.mindmapCalcCharLength = function(charArray, font="", fontSize="16px"){
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