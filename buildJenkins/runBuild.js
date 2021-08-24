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

//building core.js
let files = [
    "../pre.js",
	"",	//THE FILES
	"../post.js",
]

let file = ""

files.forEach(f => {
	file += fs.readFileSync(f, 'utf8')+'\n\n';
})


	
fs.writeFileSync("build.js", obfuscator(file))