/*
   _____ _    _          _____ _______ 
  / ____| |  | |   /\   |  __ \__   __|
 | |    | |__| |  /  \  | |__) | | |   
 | |    |  __  | / /\ \ |  _  /  | |   
 | |____| |  | |/ ____ \| | \ \  | |   
  \_____|_|  |_/_/    \_\_|  \_\ |_|   

create awesome graphs, only with svg
*/

if(typeof BF.svg == "undefined") BF.svg = {}
BF.svg.chart = {}

BF.svg.chart.bar = function(config, data){
    let conf = Object.assign({
        size: [400, 400],  //width, height
        distance: [2, 8], //[bar distance, additional between groups]
        colors: ["blue", "green", "red", "grey", "orange"],
        maxHeight: false,

        
        axis: false,
        grid: false,
        gridStep: 1,
    }, config);

    let nrData = data.length
    let maxLength = nrData>0?Math.max(...(data.map(d=>d.length))):0
    let maxHeight = conf.maxHeight?conf.maxHeight:(nrData>0?Math.max(...(data.map(d=>Math.max(...d)))):0)
    let spaceLeft = [0, conf.size[0], 0, conf.size[1]]

    let svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="'+conf.size[0]+'" height="'+conf.size[1]+'">']
    let svgI = 0
    
    //draw axis
    if(conf.axis){
        spaceLeft[0] += 40
        spaceLeft[1] -= 20
        spaceLeft[2] += 30
        spaceLeft[3] -= 20
    }

    //draw bars
    let drawBar = function(conf, x, y, height, color){
        return '<rect x="'+x+'" y="'+(y-height*conf.singleHeight)+'" width="'+conf.width+'" height="'+height*conf.singleHeight+'" style="fill:'+color+';"/>'  //;stroke-width:3;stroke:rgb(0,0,0)
    }
    let barConf = {
        width: (spaceLeft[1] - spaceLeft[0] - nrData*maxLength*conf.distance[0] - (nrData>1?maxLength*conf.distance[1]:0)) / (nrData*maxLength),
        singleHeight: (spaceLeft[3]-spaceLeft[2]) / maxHeight
    }

    let y = conf.size[0]-spaceLeft[2]
    for(di in data){
        let x = spaceLeft[0] + (barConf.width + conf.distance[0])*di
        for(ei in data[di]){
            svg[++svgI] = drawBar(barConf, x, y, data[di][ei], conf.colors[di % conf.colors.length]) + (config.text?"":"")
            x += (barConf.width + conf.distance[0])*nrData + (nrData>1?conf.distance[1]:0)
        }
    }

    //draw grid
    if(conf.grid){
        for(let i = 0; i <= maxHeight; i+=conf.gridStep){
            let y = Math.floor(conf.size[1]-barConf.singleHeight*i-spaceLeft[2])
            
            svg[++svgI] = '<line x1="'+(spaceLeft[0]-5)+'" y1="'+y+'" x2="'+(spaceLeft[1]-5)+'" y2="'+y+'" stroke="black" stroke-width="0.5" style="opacity:0.5;" />'    //axis height line
            svg[++svgI] = '<text text-anchor="end" dy=".3em" x="'+(spaceLeft[0]-8)+'" y="'+y+'">'+i+'</text>'    //left axis text
        }
    }
    return svg.join("")+'</svg>'
}

BF.svg.chart.pie = function(config, data){
    let conf = Object.assign({
        size: [400, 400],  //width, height
        colors: ["blue", "green", "red", "grey", "orange"],
        mode: "direct", //other: smooth
    }, config);

    let r = Math.floor(Math.min(...conf.size)/2)
    let cx = conf.size[0]/2
    let cy = conf.size[1]/2
    let svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="'+conf.size[0]+'" height="'+conf.size[1]+'">']
    let svgI = 0

    let polarToCartesian = function(centerX, centerY, radius, angleInDegrees) {
        let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
        
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }
    
    let act_angle = 0;
    if(data.length == 1 && data[0] >= 100){
        data[0] = 99.99999
    }
    for(di in data){
        let start = polarToCartesian(cx,cy,r, act_angle)
        act_angle += data[di]*3.6
        if(act_angle > 360) act_angle = 360
        let end = polarToCartesian(cx,cy,r, act_angle)

        let p = [
            "M", start.x, start.y,
            "A", r, r, 0, data[di]*3.6<=180?"0":"1", 1, end.x, end.y,
            "L", cx, cy,
            "L", start.x, start.y,
        ]
        svg[++svgI] = '<path d="'+p.join(" ")+'"  fill="'+conf.colors[di]+'"/>'
    }
    return svg.join("")+'</svg>'
}

BF.svg.chart.line = function(config, data){
    let conf = Object.assign({
        size: [400, 400],  //width, height
        colors: ["blue", "green", "red", "grey", "orange"],
        mode: "direct", //other: smooth

        axis: false,
        grid: false,
        gridStep: 1,
    }, config);

    let nrData = data.length
    let maxLength = nrData>0?Math.max(...(data.map(d=>d.length))):0
    let maxHeight = conf.maxHeight?conf.maxHeight:(nrData>0?Math.max(...(data.map(d=>Math.max(...d)))):0)
    let spaceLeft = [0, conf.size[0], 0, conf.size[1]]

    let svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="'+conf.size[0]+'" height="'+conf.size[1]+'">']
    let svgI = 0
    
    //draw axis
    if(conf.axis){
        spaceLeft[0] += 40
        spaceLeft[1] -= 20
        spaceLeft[2] += 30
        spaceLeft[3] -= 20
    }

    let lineConf = {
        width: (spaceLeft[1] - spaceLeft[0]) / (maxLength-1),
        singleHeight: (spaceLeft[3]-spaceLeft[2]) / maxHeight
    }

    //draw lines
    for(di in data){
        let p = ["M", spaceLeft[0], Math.floor(conf.size[1]-lineConf.singleHeight*data[di][0]-spaceLeft[2])]
        for(let ei=1; ei < data[di].length; ei++){
            let px = spaceLeft[0]+lineConf.width*ei
            let py = Math.floor(conf.size[1]-lineConf.singleHeight*data[di][ei]-spaceLeft[2])
            if(conf.mode == "direct"){
                p[p.length] = "L "+px+" "+py
            }else if(conf.mode == "bezier"){
                if(ei == 1) p[p.length] = "C";
                p[p.length] = px+" "+py
                if(ei+1 < data[di].length) p[p.length] = ","
            }
        }
        svg[++svgI] = '<path d="'+p.join(" ")+'" fill="none" stroke-width="3" stroke="'+conf.colors[di]+'"/>'
    }


    //draw grid
    if(conf.grid){
        for(let i = 0; i <= maxHeight; i+=conf.gridStep){
            let y = Math.floor(conf.size[1]-lineConf.singleHeight*i-spaceLeft[2])
            
            svg[++svgI] = '<line x1="'+(spaceLeft[0]-5)+'" y1="'+y+'" x2="'+(spaceLeft[1]-5)+'" y2="'+y+'" stroke="black" stroke-width="0.5" style="opacity:0.5;" />'    //axis height line
            svg[++svgI] = '<text text-anchor="end" dy=".3em" x="'+(spaceLeft[0]-8)+'" y="'+y+'">'+i+'</text>'    //left axis text
        }
    }
    
    return svg.join("")+'</svg>'
}