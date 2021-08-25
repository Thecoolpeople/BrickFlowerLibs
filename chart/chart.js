/*
   _____ _    _          _____ _______ 
  / ____| |  | |   /\   |  __ \__   __|
 | |    | |__| |  /  \  | |__) | | |   
 | |    |  __  | / /\ \ |  _  /  | |   
 | |____| |  | |/ ____ \| | \ \  | |   
  \_____|_|  |_/_/    \_\_|  \_\ |_|   

create awesome graphs, only with svg
*/

BF.chart = {}

BF.chart.bar = function(config, data){
    let conf = Object.assign({
        size: [400, 400],  //width, height
        distance: [2, 8], //[bar distance, additional between groups]
        colors: ["blue", "green", "red", "grey", "orange"],
		maxHeight: false,

        
        axis: false,
        grid: false,
        gridStep: 1,
        text: false,
    }, config);

    let nrData = data.length
	let maxLength = nrData>0?Math.max(...(data.map(d=>d.length))):0
    let maxHeight = conf.maxHeight?conf.maxHeight:(nrData>0?Math.max(...(data.map(d=>Math.max(...d)))):0)
    let spaceLeft = [0, conf.size[0], 0, conf.size[1]]

    let svg = ['<svg width="'+conf.size[0]+'" height="'+conf.size[1]+'">']
    
    //draw axis
    if(conf.axis){
        spaceLeft[0] += 20
        spaceLeft[3] += 20
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
            svg[Number(1) + Number(di*maxLength) + Number(ei)] = drawBar(barConf, x, y, data[di][ei], conf.colors[di % conf.colors.length]) + (config.text?"":"")
            x += (barConf.width + conf.distance[0])*nrData + (nrData>1?conf.distance[1]:0)
        }
    }

    //draw grid
    if(conf.grid){
        for(let i = 0; i <= maxHeight; i+=conf.gridStep){
            svg[1+nrData*maxLength+i] = '<line x1="'+spaceLeft[0]+'" y1="'+(spaceLeft[3]-barConf.singleHeight*i)+'" x2="'+spaceLeft[1]+'" y2="'+(spaceLeft[3]-barConf.singleHeight*i)+'" stroke="black" stroke-width="1" stroke-opacity:"0.4" />'
        }
    }
    console.log(svg)
    return svg.join("")+'</svg>'
}