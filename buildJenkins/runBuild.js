const fs = require('fs')
const JavaScriptObfuscator = require("javascript-obfuscator");

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
		file += fs.readFileSync(f, 'utf8')+'\n\n';
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
		let buildPath = "../build/"+f+".js"
		let files = []
		files = files.concat(fs.readFileSync("../"+f+"/0build.txt", 'utf8').split("\r\n").map(i=>{return "../"+f+"/"+i}))
		wholeFiles = wholeFiles.concat(files)
		console.log(files)
		
		let build = buildFiles(files)
		fs.writeFileSync(buildPath, build)
		console.log(build.length)
	}
}

console.log("start building ALL")
let build = buildFiles(wholeFiles)
fs.writeFileSync("../build/0build.js", build)
console.log(build.length)