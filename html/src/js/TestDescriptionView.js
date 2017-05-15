
// @module wptinquirer.html @class ReportVisualProgressCompareView display given test description - 
// commonly used as a subview. @extends AbstractView

var AbstractView = require('./AbstractView')
,	Util = require('./Util')
,	DataExtractor = require('./DataExtractor'); 

module.exports = AbstractView.extend({

	template: 'test-description.html'

,	initialize: function(options)
	{
		this.application = options.application;
		this.reportId = options.reportId;
		// this.testIds = options.testIds;
		this.testData = options.testData; 
	}

// ,	afterRender: function()
// 	{
// 		var self = this; 
// 		var aTestId = this.testIds[0];
// 		Util.getTestData(aTestId).done(function(data)
// 		{
// 			self.testData = data;
// 			self.dataExtractor = new DataExtractor(data);
// 			setTimeout(function(){self.render();}, 1500); 
// 		}); 	
// 	}
}); 