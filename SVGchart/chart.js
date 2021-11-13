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

BF.svg.chart.internalGrid = function(svg, spaceLeft, conf){
    for(let i = 0; i <= Math.ceil(conf.maxHeight-conf.minHeight); i+=conf.gridStep){
        let y = Math.floor(conf.size[1]-conf.singleHeight*i-spaceLeft[2])
        
        svg[svg.length] = '<line x1="'+(spaceLeft[0]-5)+'" y1="'+y+'" x2="'+(spaceLeft[1]+5)+'" y2="'+y+'" stroke="black" stroke-width="0.5" style="opacity:0.5;" />'    //axis height line
        if(conf.axis)
            svg[svg.length] = '<text text-anchor="end" dy=".3em" x="'+(spaceLeft[0]-8)+'" y="'+y+'">'+(i+conf.minHeight).toFixed(conf.axisToFixed)+'</text>'    //left axis text
    }
}
BF.svg.chart.internalGridX = function(svg, spaceLeft, conf){
    for(let i = 0; i <= conf.XnrData; i+=conf.gridStep){
        let x = spaceLeft[0] + conf.singeWidth*i

        svg[svg.length] = '<line x1="'+x+'" y1="'+(spaceLeft[2]-15)+'" x2="'+x+'" y2="'+(spaceLeft[3]-5)+'" stroke="black" stroke-width="0.5" style="opacity:0.5;" />'    //axis height line
        console.log((i+conf.X0).toFixed(conf.axisToFixed))
        if(conf.axis)
            svg[svg.length] = '<text text-anchor="end" transform="translate('+x+', '+(spaceLeft[3]-5)+') rotate(-90)" dy=".3em">'+(i/conf.X0step+conf.X0).toFixed(conf.axisToFixed)+'</text>'    //left axis text
    }

}

BF.svg.chart.bar = function(config, data){
    let conf = Object.assign({
        size: [400, 400],  //width, height
        distance: [2, 8], //[bar distance, additional between groups]
        colors: ["blue", "green", "red", "grey", "orange"],
        maxHeight: false,
        minHeight: false,
        
        axis: false,
        axisToFixed: 0,
        grid: false,
        gridStep: false,
    }, config);

    let nrData = data.length
    let maxLength = nrData>0?Math.max(...(data.map(d=>d.length))):0
    let maxHeight = conf.maxHeight?conf.maxHeight:(nrData>0?Math.max(...(data.map(d=>Math.max(...d)))):0)
    let minHeight = conf.minHeight?conf.minHeight:(nrData>0?Math.min(...(data.map(d=>Math.min(...d)))):0)
    let spaceLeft = [0, conf.size[0], 0, conf.size[1]]

    if(conf.gridStep == false)  conf.gridStep = Math.ceil((maxHeight-minHeight)/10)

    let svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="'+conf.size[0]+'" height="'+conf.size[1]+'">']
    
    //draw axis
    if(conf.axis){
        spaceLeft[0] += 40
        spaceLeft[1] -= 20
        spaceLeft[2] += 30
        spaceLeft[3] -= 20
    }

    //draw bars
    let drawBar = function(conf, x, y, height, color){
        if(height >= 0)
            return '<rect x="'+x+'" y="'+(y-height*conf.singleHeight+conf.zeroHeight)+'" width="'+conf.width+'" height="'+(height-(minHeight>0?minHeight:0))*conf.singleHeight+'" style="fill:'+color+';"/>'
        else
            return '<rect x="'+x+'" y="'+(y+conf.zeroHeight)+'" width="'+conf.width+'" height="'+(-height)*conf.singleHeight+'" style="fill:'+color+';"/>'
    }
    let barConf = {
        width: (spaceLeft[1] - spaceLeft[0] - nrData*maxLength*conf.distance[0] - (nrData>1?maxLength*conf.distance[1]:0)) / (nrData*maxLength),
        singleHeight: (spaceLeft[3]-spaceLeft[2]) / Math.ceil(maxHeight-minHeight),
        zeroHeight: (spaceLeft[3]-spaceLeft[2]) / (maxHeight-minHeight)*minHeight,
    }

    let y = conf.size[0]-spaceLeft[2]
    for(di in data){
        let x = spaceLeft[0] + (barConf.width + conf.distance[0])*di
        for(ei in data[di]){
            svg[svg.length] = drawBar(barConf, x, y, data[di][ei], conf.colors[di % conf.colors.length]) + (config.text?"":"")
            x += (barConf.width + conf.distance[0])*nrData + (nrData>1?conf.distance[1]:0)
        }
    }

    //draw grid
    if(conf.grid)
        BF.svg.chart.internalGrid(svg, spaceLeft,{
            minHeight: minHeight,
            maxHeight: maxHeight,
            singleHeight: barConf.singleHeight,
            axis: conf.axis,
            axisToFixed: conf.axisToFixed,
            gridStep:conf.gridStep,
            size: conf.size,
        })
    
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
        svg[svg.length] = '<path d="'+p.join(" ")+'"  fill="'+conf.colors[di % conf.colors.length]+'"/>'
    }
    return svg.join("")+'</svg>'
}

BF.svg.chart.line = function(config, data){
    let conf = Object.assign({
        size: [400, 400],  //width, height
        colors: ["blue", "green", "red", "grey", "orange"],
        maxHeight: false,
        minHeight: false,

        mode: "direct", //other: bezier

        axis: false,
        axisToFixed: 0,
        grid: false,
        gridStep: false,
        gridStepX: false,
        X0: 0,
        X0step: 1,
    }, config);

    let nrData = data.length
    let maxLength = nrData>0?Math.max(...(data.map(d=>d.length))):0
    let maxHeight = conf.maxHeight?conf.maxHeight:(nrData>0?Math.max(...(data.map(d=>Math.max(...d)))):0)
    let minHeight = conf.minHeight?conf.minHeight:(nrData>0?Math.min(...(data.map(d=>Math.min(...d)))):0)
    
    if(conf.gridStep == false)  conf.gridStep = Math.ceil((maxHeight-minHeight)/10)
    if(conf.gridStepX == false)  conf.gridStepX = Math.ceil(maxLength/10)

    let spaceLeft = [0, conf.size[0], 0, conf.size[1]]

    let svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="'+conf.size[0]+'" height="'+conf.size[1]+'">']
    
    //draw axis
    if(conf.axis){
        spaceLeft[0] += 40
        spaceLeft[1] -= 20
        spaceLeft[2] += 30
        spaceLeft[3] -= 20
    }

    let lineConf = {
        width: (spaceLeft[1] - spaceLeft[0]) / (maxLength-1),
        singleHeight: (spaceLeft[3]-spaceLeft[2]) / Math.ceil(maxHeight-minHeight),
        zeroHeight: (spaceLeft[3]-spaceLeft[2]) / (maxHeight-minHeight)*minHeight,
    }

    //draw lines
    for(di in data){
        let p = ["M", spaceLeft[0], Math.floor(conf.size[1]-lineConf.singleHeight*data[di][0]-spaceLeft[2]+lineConf.zeroHeight)]
        for(let ei=1; ei < data[di].length; ei++){
            let px = spaceLeft[0]+lineConf.width*ei
            let py = Math.floor(conf.size[1]-lineConf.singleHeight*data[di][ei]-spaceLeft[2]+lineConf.zeroHeight)
            if(conf.mode == "direct"){
                p[p.length] = "L "+px+" "+py
            }else if(conf.mode == "bezier"){
                if(ei == 1) p[p.length] = "C";
                p[p.length] = px+" "+py
                if(ei+1 < data[di].length) p[p.length] = ","
            }
        }
        svg[svg.length] = '<path d="'+p.join(" ")+'" fill="none" stroke-width="3" stroke="'+conf.colors[di % conf.colors.length]+'"/>'
    }


    //draw grid
    if(conf.grid){
        BF.svg.chart.internalGrid(svg, spaceLeft, {
            minHeight: minHeight,
            maxHeight: maxHeight,
            singleHeight: lineConf.singleHeight,
            axis: conf.axis,
            axisToFixed: conf.axisToFixed,
            gridStep:conf.gridStep,
            size: conf.size,
        })
        BF.svg.chart.internalGridX(svg, spaceLeft, {
            singeWidth: lineConf.width,
            gridStep: conf.gridStepX,
            axis: conf.axis,
            axisToFixed: conf.axisToFixed,
            XnrData: maxLength,
            X0: conf.X0,
            X0step: conf.X0step,
        })
    }
    
    return svg.join("")+'</svg>'
}

BF.svg.chart.function = function(config, data){
    let conf = Object.assign({
        size: [400, 400],  //width, height
        colors: ["blue", "green", "red", "grey", "orange"],
        maxHeight: false,
        minHeight: false,

        resolution: 0.1,
        toFixed: 2,
        lenXmin: 0,
        lenXmax: 10,

        axis: true,
        axisToFixed: 0,
        grid: true,
        gridStep: false,
        gridStepX: false,
    }, config);

    
    let nrFunction = data.length
    let len = (conf.lenXmax-conf.lenXmin)/conf.resolution

    //math function
    let funcs = Array.from({length:nrFunction}).map((e,i)=>{
        return new Function("x","with(Math){return("+data[i]+").toFixed("+conf.toFixed+")}")
    })
    let nrData = Array.from({length:nrFunction}).map((e,nr)=>Array.from({length:len}, (_,i)=>funcs[nr](conf.resolution*i)))

    return BF.svg.chart.line(Object.assign(conf, {mode:"bezier", X0step:1/conf.resolution}), nrData)
}