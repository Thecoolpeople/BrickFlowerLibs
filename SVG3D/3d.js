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
        
        cameraPos: [5,5,5], //position of the camera
        lookAt: [0,0,0], //position to look at
        scale: 1, //the scale of the drawing
    }, config);

    let M = {
        /**
         * multiplicate 2 mat4 matrix a.b
         * good optimised: for 1mio calls about 156ms
         * @param {Array(16)} a The left matrix
         * @param {Array(16)} b The right matrix
         * @returns {Array(16)} The calculated matrix
         */
        mat4: function(a,b){
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
        },
        /**
         * multiplicate a vector with a matrix m.v
         * @param {Array(16)} m The matrix
         * @param {Array(4)} v The vector
         * @returns {Array(4)} The calculated vector
         */
        mat4vec: function(m, v){
            return [
                m[0]*v[0] + m[1]*v[1] + m[2]*v[2] + m[3]*v[3],
                m[4]*v[0] + m[5]*v[1] + m[6]*v[2] + m[7]*v[3],
                m[8]*v[0] + m[9]*v[1] + m[10]*v[2] + m[11]*v[3],
                m[12]*v[0] + m[13]*v[1] + m[14]*v[2] + m[15]*v[3]
            ]
        },
        /**
         * Calculate the manipulation matrix for seeing points from the camera position, looking to the lookAt position
         * @param {Array(3)} camera The camera Position [x,y,z]
         * @param {Array(3)} lookAt Look to the Position [x,y,z]
         * @returns {Array(16)} The calculated manipulation matrix
         */
        LookM: function(camera, lookAt){
            let normal = function(v){
                let l = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2])
                return [v[0]/l, v[1]/l, v[2]/l]
            }
            let cross = function(a,b){
                return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
            }
            let dot = function(a,b){
                return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
            }
            
            zaxis = normal([lookAt[0]-camera[0], lookAt[1]-camera[1], lookAt[2]-camera[2]])
            xaxis = normal(cross(zaxis, [0,0,1])) //vector is Up
            yaxis = cross(xaxis, zaxis)
            return [
                xaxis[0], xaxis[1], xaxis[2], -dot(xaxis, camera),
                -yaxis[0], -yaxis[1], -yaxis[2], dot(yaxis, camera),
                -zaxis[0], -zaxis[1], -zaxis[2], dot(zaxis, camera),
                0, 0, 0, 1
            ]
        },
        /**
         * Projection of a 3D point to the screen space
         * @param {Number} left The left position of the screen ending
         * @param {Number} right The right position of the screen ending
         * @param {Number} bottom The bottom position of the screen ending
         * @param {Number} top The top position of the screen ending
         * @param {Number} scale The scale for drawing
         * @returns {Array(16)} The calculated manipulation matrix
         */
        OrthoProj: function(left, right, bottom, top, scale=1){
            //transponiert
            return[
                (right-left)*scale , 0, 0, (right-left)/2,
                0, (top-bottom)*scale, 0, (top-bottom)/2,
                0, 0, 1, 0,
                0, 0, 0, 1
            ];
        },
        /**
         * Display the matrix in the console
         * @param {Array(16)} m The matrix
         */
        display: function(m){
            let c = ""
            s = Math.sqrt(m.length)
            for(let y = 0; y < s; y++){
                for(let x = 0; x < s; x++){
                    c += m[y*4+x].toFixed(3)+"\t"
                }
                c += "\n"
            }
            console.log(c)
        }
    }
    let Draw = {
        p: function(point, size=1){
            return '<circle cx="'+point[0]+'" cy="'+point[1]+'" r="'+size+'" stroke="red"/>'
        },
        l: function(point1, point2){
            return '<line x1="'+point1[0]+'" y1="'+point1[1]+'" x2="'+point2[0]+'" y2="'+point2[1]+'" stroke="black"/>'
        },
        g: function(points){
            let p = points.filter(function(_, i){ //delete every third element
                return (i + 1) % 3;
            })
            return '<polygon points="'+p.join(",")+'" stroke="black" fill="green" fill-opacity="0.5"/>'
        }
    }

    /*a = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
    t1 = performance.now()
    for(let i=0;i<1000000;i++)
        c = mat4(a,a)
    t2=performance.now()
    console.log("Time delta: "+(t2-t1)+"ms")*/
    

    /*t1 = performance.now()
    for(let i=0;i<100000;i++){
        c = M.LookM(conf.cameraPos, conf.lookAt)
        ortho = M.OrthoProj(0, 400, 0, 400)
        proj = M.mat4(ortho, c)
        pNew = M.mat4vec(proj, [2,2,2,1])
    }
    t2=performance.now()
    console.log("Time delta: "+(t2-t1)+"ms")*/

    //calculate the translation matrix
    let look = M.LookM(conf.cameraPos, conf.lookAt)
    let ortho = M.OrthoProj(0, conf.size[0], 0, conf.size[1], conf.scale)
    let T = M.mat4(ortho, look)

    let svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="'+conf.size[0]+'" height="'+conf.size[1]+'">']

    //coord system //TODO remove or put it into a if
    svg[svg.length] = Draw.l(M.mat4vec(T, [-1,0,0,1]), M.mat4vec(T, [1,0,0,1]))
    svg[svg.length] = Draw.l(M.mat4vec(T, [0,-1,0,1]), M.mat4vec(T, [0,1,0,1]))
    svg[svg.length] = Draw.l(M.mat4vec(T, [0,0,-1,1]), M.mat4vec(T, [0,0,1,1]))

    //precalc the coordinates
    points = []
    for(let i = 0; i < data.length; i++){
        switch(data[i].id){
        case 'p':
            points[points.length] = [
                'p',
                M.mat4vec(T, [...data[i].p,1]).slice(0,3)
            ]
        break;
        case 'l':
            points[points.length] = [
                'l',
                M.mat4vec(T, [...data[i].p1,1]).slice(0,3),
                M.mat4vec(T, [...data[i].p2,1]).slice(0,3)
            ]
        break;
        case 'g':
            let l = points.length
            points[l] = ['g', []]
            for(let a = 0; data[i]['p'+(a+1)]; a++){
                let p1 = M.mat4vec(T, [...data[i]['p'+(a+1)],1])
                points[l][1][a*3] =   p1[0]
                points[l][1][a*3+1] = p1[1]
                points[l][1][a*3+2] = p1[2]
            }
        break;
        case 'cube': 
            //p1 = M.mat4vec(T, [data[i][1]-data[i][4]/2, data[i][2]-data[i][5]/2, data[i][3]-data[i][6]/2])
            let p1 = M.mat4vec(T, [data[i].p[0]+data[i].s[0]/2, data[i].p[1]-data[i].s[1]/2, data[i].p[2]-data[i].s[2]/2, 1]).slice(0,3)
            let p2 = M.mat4vec(T, [data[i].p[0]+data[i].s[0]/2, data[i].p[1]+data[i].s[1]/2, data[i].p[2]-data[i].s[2]/2, 1]).slice(0,3)
            let p5 = M.mat4vec(T, [data[i].p[0]+data[i].s[0]/2, data[i].p[1]-data[i].s[1]/2, data[i].p[2]+data[i].s[2]/2, 1]).slice(0,3)
            let p6 = M.mat4vec(T, [data[i].p[0]+data[i].s[0]/2, data[i].p[1]+data[i].s[1]/2, data[i].p[2]+data[i].s[2]/2, 1]).slice(0,3)

            let p3 = M.mat4vec(T, [data[i].p[0]-data[i].s[0]/2, data[i].p[1]-data[i].s[1]/2, data[i].p[2]-data[i].s[2]/2, 1]).slice(0,3)
            let p4 = M.mat4vec(T, [data[i].p[0]-data[i].s[0]/2, data[i].p[1]+data[i].s[1]/2, data[i].p[2]-data[i].s[2]/2, 1]).slice(0,3)
            let p7 = M.mat4vec(T, [data[i].p[0]-data[i].s[0]/2, data[i].p[1]-data[i].s[1]/2, data[i].p[2]+data[i].s[2]/2, 1]).slice(0,3)
            let p8 = M.mat4vec(T, [data[i].p[0]-data[i].s[0]/2, data[i].p[1]+data[i].s[1]/2, data[i].p[2]+data[i].s[2]/2, 1]).slice(0,3)
            points[points.length] = ['g', [...p1, ...p2, ...p6, ...p5]]
            points[points.length] = ['g', [...p1, ...p2, ...p4, ...p3]]
            points[points.length] = ['g', [...p2, ...p4, ...p8, ...p6]]
            points[points.length] = ['g', [...p5, ...p6, ...p8, ...p7]]
            points[points.length] = ['g', [...p1, ...p3, ...p7, ...p5]]
            points[points.length] = ['g', [...p3, ...p4, ...p8, ...p7]]
        break;
        }
    }
    
    //sorting after zaxis, to draw the data in the correct order
    points.sort(function(a,b){
        let getZ = function(i){
            switch(i[0]){
                case 'p': return i[1][2]
                case 'l': return (i[1][2] + i[2][2])/2  //TODO now it is middle of the line, perhaps other?
                case 'g':
                    let s = 0
                    for(let a = 0; a < i[1].length/3; a++){
                        s += i[1][a*3+2]
                    }
                    return s*3/i.length
                
            }
        }
        return getZ(a) - getZ(b)
    })

    //drawing the data
    for(let i = 0; i < points.length; i++){
        if(points[i][0] == 'p')
            svg[svg.length] = Draw.p(points[i][1], 2)
        else if(points[i][0] == 'l')
            svg[svg.length] = Draw.l(points[i][1], points[i][2])
        else if(points[i][0] == 'g')
            svg[svg.length] = Draw.g(points[i][1])
    }
    return svg.join("")+'</svg>'
}
