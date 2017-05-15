//Responsabilities - tools that affect / configures the html application

var	_ = require('underscore')
,	Q = require('q')
// ,	colors = require('colors/safe')
// ,	args = require('yargs').argv
,	path = require('path')
,	shell = require('shelljs')
,	fs = require('fs'); 

var Tool = require('./tool'); 

_(Tool.prototype).extend({
	generateStaticHtml: function()
	{
		var self = this
		,	html = fs.readFileSync(path.join('html','index.html')).toString()
		,	metadata = JSON.parse(fs.readFileSync(path.join(this.config.testDataFolder,'metadata.json')))
		,	output = {
				metadata: metadata
			,	tests: {}
			}; 
		_(metadata).each(function(data, testId)
		{
			var data = JSON.parse(fs.readFileSync(path.join(self.config.testDataFolder, testId, 'data.json')).toString()); 
			output.tests[testId] = data; 
		}); 

		var s = '<script>window._webpagetestinquirer_data=' + JSON.stringify(output) + 
			'</script>' + '</body></html>'; 

		html = html.replace('</body></html>', s); 

		fs.writeFileSync(path.join('html','index-static.html'), html); 
	}
}); 