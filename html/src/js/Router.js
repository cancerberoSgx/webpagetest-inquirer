var ReportView = require('./ReportView')
,	HomeView = require('./HomeView')
,	Util = require('./Util')
,	ReportCompareView = require('./ReportCompareView')
,	ReportVisualProgressCompareView = require('./ReportVisualProgressCompareView')
,	VideoFramesView = require('./VideoFramesView')
,	ResourceBreakdownView = require('./ResourceBreakdownView')
 
// ,	NetworkView = require('./NetworkView');

//@module wptinquirer.html @class Router @extends Backbone.Router
module.exports = Backbone.Router.extend({
	
	routes: {
		'': 'home'

	,	'report/:testId': 'report'
	,	'report/:testId?:options': 'report'

	,	'reportCompare/:testIds': 'reportCompare'
	,	'reportCompare/:testIds?:options': 'reportCompare'

	,	'visualProgressCompare/:testIds': 'visualProgressCompare'
	,	'visualProgressCompare/:testIds?:options': 'visualProgressCompare'

	,	'resourceBreakdown/:testIds': 'resourceBreakdown'
	,	'resourceBreakdown/:testIds?:options': 'resourceBreakdown'

	,	'videoFrames/?:options': 'videoFrames'

	,	'network/:testIds': 'network'
	,	'network/:testIds?:options': 'network'
	}

,	initialize: function(application)
	{
		this.application = application;
	}

	//@method home dispatch the / url that shows all the test definitions and let the user do reporting and in the future re-run it.
,	home: function()
	{
		var self = this;
		// Util.getTestsMetadata().done(function(metadata)
		// {			
		// 	var view = new HomeView({application: self.application, metadata: metadata});
		// 	self.application.showView(view);
		// }); 
		var view = new HomeView({application: self.application});
		self.application.showView(view);
	}

	//@method report dispatch the /report url that shows a report of ONE existing test definition
,	report: function(testId, options)
	{
		var parsedOptions = Util.parseOptions(options);
		var view = new ReportView({application: this.application, testId: testId, options: parsedOptions});
		this.application.showView(view); 
	}

	//@method reportCompare dispatch the /reportCompare url that shows reports numbers comparision of different vigen tests  definitions
,	reportCompare: function(testIds, options)
	{		
		var parsedOptions = Util.parseOptions(options);
		var view = new ReportCompareView({application: this.application, testIds: testIds, options: parsedOptions});
		this.application.showView(view); 
	}

	//@method reportCompare dispatch the /reportCompare url that shows reports numbers comparision of different vigen tests  definitions
,	resourceBreakdown: function(testIds, options)
	{		
		var parsedOptions = Util.parseOptions(options);
		var view = new ResourceBreakdownView({application: this.application, testIds: testIds, options: parsedOptions});
		this.application.showView(view); 
	}
	//@method reportCompare dispatch the /reportCompare url that shows reports numbers comparision of visual progress for given test definitions
,	visualProgressCompare: function(testIds, options)
	{
		var parsedOptions = Util.parseOptions(options);
		var view = new ReportVisualProgressCompareView({application: this.application, testIds: testIds, options: parsedOptions});
		this.application.showView(view); 
	}
	//@method videoFrames dispatch the /videoFrames url that shows comparision between two or more samples video strip frames in time
,	videoFrames: function(options)
	{
		var parsedOptions = Util.parseOptions(options);
		var view = new VideoFramesView({application: this.application, options: parsedOptions});
		this.application.showView(view); 
	}

}); 