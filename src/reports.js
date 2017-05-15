// Responsabilities in this file: generate reports for some existing test results in static html pages.
var Tool = require('./tool')
,	shell = require('shelljs')
,	path = require('path')
,	request = require('request')
,	_ = require('underscore')
,	Q = require('q')
,	fs = require('fs'); 

_(Tool.prototype).extend({

	runReport: function(reportId)
	{
		if(reportId==='1')
		{
			this.runppReport();
		}
		else
		{
			throw new Error('Report '+reportId + ' doesn\'t exists!'); 
		}
	}

,	runReport1: function ()
	{
		console.log(path.join(__dirname, 'report_template1.tpl'));
	}
});

module.exports = Tool; 