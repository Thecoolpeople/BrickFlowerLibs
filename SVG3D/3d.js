/*
   _______      _______   ____  _____  
  / ____\ \    / / ____| |___ \|  __ \ 
 | (___  \ \  / / |  __    __) | |  | |
  \___ \  \ \/ /| | |_ |  |__ <| |  | |
  ____) |  \  / | |__| |  ___) | |__| |
 |_____/    \/   \_____| |____/|_____/ 

create awesome 3d objects in svg
*/

if(typeof BF.svg == "undefined") BF.svg = {}

BF.svg.D3 = function(config, data){
    let conf = Object.assign({
        size: [400, 400],  //width, height
        
    }, config);

    mat4 = function(a,b){ //good optimised: for 1mio calls about 156ms
        return[
            a[0]*b[0] + a[1]*b[4] + a[2]*b[8] + a[3]*b[12],
            a[0]*b[1] + a[1]*b[5] + a[2]*b[9] + a[3]*b[13],
            a[0]*b[2] + a[1]*b[6] + a[2]*b[10] + a[3]*b[14],
            a[0]*b[3] + a[1]*b[7] + a[2]*b[11] + a[3]*b[15],

            a[4]*b[0] + a[5]*b[4] + a[6]*b[8] + a[7]*b[12],
            a[4]*b[1] + a[5]*b[5] + a[6]*b[9] + a[7]*b[13],
            a[4]*b[2] + a[5]*b[6] + a[6]*b[10] + a[7]*b[14],
            a[4]*b[3] + a[5]*b[7] + a[6]*b[11] + a[7]*b[15],

            a[8]*b[0] + a[9]*b[4] + a[10]*b[8] + a[11]*b[12],
            a[8]*b[1] + a[9]*b[5] + a[10]*b[9] + a[11]*b[13],
            a[8]*b[2] + a[9]*b[6] + a[10]*b[10] + a[11]*b[14],
            a[8]*b[3] + a[9]*b[7] + a[10]*b[11] + a[11]*b[15],

            a[12]*b[0] + a[13]*b[4] + a[14]*b[8] + a[15]*b[12],
            a[12]*b[1] + a[13]*b[5] + a[14]*b[9] + a[15]*b[13],
            a[12]*b[2] + a[13]*b[6] + a[14]*b[10] + a[15]*b[14],
            a[12]*b[3] + a[13]*b[7] + a[14]*b[11] + a[15]*b[15]
        ]
    }
    /*a = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
    t1 = performance.now()
    for(let i=0;i<1000000;i++)
        c = mat4(a,a)
    t2=performance.now()
    console.log("Time delta: "+(t2-t1)+"ms")*/

    

    let svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="'+conf.size[0]+'" height="'+conf.size[1]+'">']
    
    return svg.join("")+'</svg>'
}
