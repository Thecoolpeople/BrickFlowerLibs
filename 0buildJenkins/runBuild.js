const fs = require('fs')
const JavaScriptObfuscator = require("javascript-obfuscator");
const documentation = require("documentation");

let readFile = function(f){
    if(f.indexOf(">") == -1){
        return fs.readFileSync(f, 'utf8')
    }else{
        let file = fs.readFileSync(f.split(">")[0], 'utf8')
        file = file.split(f.split(">")[1])
        let folder = f.substring(0,f.lastIndexOf("/")+1)
        for(let i=1; i<file.length; i+=2){
            let subfile = file[i]
            file[i] = fs.readFileSync(folder+subfile, 'utf8')
        }
        return file.join('')
    }
}

let obfuscator = function(file){
    return JavaScriptObfuscator.obfuscate(file, {
        simplify: true,
        shuffleStringArray: true,
        compact: true,
        selfDefending: true,
        splitStrings: true,
        splitStringsChunkLength: 8,
        target: 'browser',
        seed: 0,
        sourceMapMode: 'inline',
        identifierNamesGenerator: "hexadecimal",
        stringArrayThreshold: 0.8,
        stringArray: true,
        rotateStringArray: true,
    }).getObfuscatedCode()
}

let buildFiles = function(files){
    let F = [].concat(files, ["../post.js"])
    let file = ""
    for(f of F){
        file += readFile(f)+'\n\n';
    }
    return obfuscator(file)
}

let wholeFiles = []

//go through all folders
let folders = fs.readdirSync("../").filter(function (file) {
    return fs.statSync('../'+file).isDirectory();
});

for(f of folders){
    if(f.indexOf("build") == -1 && f.indexOf(".git") == -1){
        console.log("start building: "+f)
        let buildPath = "../0build/"+f+".js"
        let files = []
        files = files.concat(readFile("../"+f+"/0build.txt").split("\r\n").map(i=>{return "../"+f+"/"+i}))
        wholeFiles = wholeFiles.concat(files)
        console.log(files)
        
        let build = buildFiles(files)
        fs.writeFileSync(buildPath, build)
        console.log(build.length)
    }
}

console.log("start building ALL")
//unique wholeFiles
wholeFiles = wholeFiles.map(e=>{
    if(e.indexOf(">") == -1){
        return fs.realpathSync(e).replaceAll("\\", "/")
    }else{
        let f = e.split(">")
        return fs.realpathSync(f[0]).replaceAll("\\", "/")+">"+f[1]
    }
})
wholeFiles = [...new Set(wholeFiles)]
console.log(wholeFiles.join("\n"))
let build = buildFiles(wholeFiles)
fs.writeFileSync("../0build/0build.js", build)
console.log(build.length)