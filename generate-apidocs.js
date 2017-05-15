var ShortJsDoc = require('short-jsdoc') 
,	shelljs = require('shelljs')
,	colors = require('colors/safe')
,	fs = require('fs'); 

shelljs.rm('-r', 'jsdoc'); 

ShortJsDoc.make({
	inputDirs: ['./src/']
,	output: 'jsdoc'
,	projectMetadata: JSON.parse(fs.readFileSync('./package.json'))
,	vendor: ['javascript']
}); 

var static = require('node-static');
console.log(colors.green('Serving jsdoc in http://localhost:8080/')); 
var file = new static.Server('./jsdoc');
require('http').createServer(function (request, response) {
	request.addListener('end', function () {
		file.serve(request, response);
	}).resume();
}).listen(8080);