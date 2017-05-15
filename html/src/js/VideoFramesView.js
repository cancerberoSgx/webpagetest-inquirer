
// @module wptinquirer.html @class VideoFramesView will show the video strip frames of given tests frames. 
// Used in other views like ReportVisualprogressCompareView @extends AbstractView

var AbstractView = require('./AbstractView');
var DataExtractor = require('./DataExtractor');
var Util = require('./Util');

module.exports = AbstractView.extend({

	template: 'videoFrames.html'

,	events: {
		'click [data-image-url]': 'showFilmStripFrameInModal'
	,	'click [data-action="viewFirstView"]': 'viewFirstView'
	,	'click [data-type="html-snippet"]': 'htmlSnippet'
	}

,	initialize: function(options)
	{
		var self = this;

		this.application = options.application;
		this.options = options.options;
		this.testData = Util.parseOptions(options.options.tests, ',', ':');
		// this.testData = options.options;	

		//init the data for the chart
		this.visualProgressCompareTests = [];
		this.testDefIds = [];
		this.wptTestIds = []; 
		this.tests = [];
		_(this.testData).each(function(wptTestId, testDefId)
		{
			self.testDefIds.push(testDefId); 
			self.wptTestIds.push(wptTestId);
		});

		this.extractorConfig = {}; 
		if(this.options.viewRepeatView && this.options.viewRepeatView !== '0')
		{
			this.extractorConfig.firstView = false;
		}
	}

,	afterRender: function()
	{		
		this.renderHeader();
		this.showLoadingStatus('[data-type="loading-spinner"]', true); 

		var self = this; 
		Util.getTestsData(this.testDefIds).done(function(data)
		{
			Util.loadVis().done(function()
			{				
				self.tests = data.tests; 
				self.showLoadingStatus('[data-type="loading-spinner"]', false); 
				self.showVideoFrames();
				self.setUpFilmStrip();
				self.render(true); 
				self.$('[data-toggle="tooltip"]').tooltip({html: true})
				self.renderTimeline();
				
				self.renderHeader();
			}); 
		});
	}

,	showVideoFrames: function()
	{
		this.samples = {}
		var self = this;
		_(self.tests).each(function(test)
		{
			var testDefId = test.testDefinition.testId 
			,	wptTestId = self.testData[testDefId]
			,	arr = wptTestId.split('-')
			,	wptTestRunIndex = arr[1];
			wptTestId = arr[0]; 
			var	testSample = self.findTestSample(test, wptTestId, wptTestRunIndex, self.extractorConfig); 
			self.samples[testDefId] = {id: wptTestId, sample: testSample}; 
			self.visualProgressCompareTests.push(testDefId); 
		});
	}


,	renderTimeline: function()
	{
		var self = this, template = this.application.templates['videoFramesFrame.html']; 
		var container = this.$('[data-type="timeline"]').get(0); 

		var groups = [], groupCounter = 1, items = [], itemCounter = 0; 
		_(this.samples).each(function(samples, testId)
		{
			groups.push({
				id: groupCounter
			,	content: testId.replace(/([^a-xA-X]+)/g, '<br/>') //put some line breakings to save space 
			}); 

			_(samples.sample.videoFrames).each(function(frame)
			{
				items.push({
					id: itemCounter
				,	content: frame.VisuallyComplete + '%'
				,	start: frame.time
				,	group: groupCounter
				,	image: frame.image
				,	VisuallyComplete: frame.VisuallyComplete
				,	time: frame.time
				}); 
				itemCounter++;
				currentVisuallyComplete = frame.VisuallyComplete;		
			}); 
			groupCounter++;			
		}); 

		//calculate the start and end times from ms
		for (var i = 0; i < items.length; i++) 
		{
			var item = items[i]; 
			var date = Util.buildReferenceMsDate(item.start); 
			// var date = buildReferenceDate(); 
			// date.setMilliseconds(date.getMilliseconds() + item.start); 
			item.start = date; 
			if(i < items.length-1)
			{
				date = Util.buildReferenceMsDate(items[i+1].start || 0); 
				// date = self.buildReferenceDate();
				// date.setMilliseconds(date.getMilliseconds() + items[i+1].start||0);
				item.end = date;
			}
		};

		var itemsDataset = new vis.DataSet(items);		
		var options = {
			// timeAxis: {scale: 'millisecond'}
			// template: _('<div>image: <img src="<%= image%>"></img></div>').template()
		};
		var timeline = new vis.Timeline(container, null, options);

		timeline.setGroups(groups);
		timeline.setItems(itemsDataset);	
		timeline.focus(1); 
		timeline.on('select', function (selection) 
		{
			var selectedItem = _(items).find(function(item)
			{
				return selection.items[0] === item.id; 
			}); 
			self.showFrameDetailsInModal(selectedItem); 
		});
	}

,	showFilmStripFrameInModal: function(e)
	{
		var frame = {
			image: jQuery(e.target).attr('data-image-url')
		,	time: jQuery(e.target).attr('data-image-time')
		,	VisuallyComplete: jQuery(e.target).attr('data-image-VisuallyComplete')
		};
		this.showFrameDetailsInModal(frame);
	}

,	showFrameDetailsInModal: function(frame, title)
	{
		title = title || 'frame image'; 
		var view = new AbstractView({
			application: this.application
		});
		_(view).extend(frame)
		view.template = 'videoFramesFrame.html'

		this.application.showViewInModal(view, {title: title});
	}

,	getMaxStripLength: function()
	{
		var m = 0;
		_(this.filmStrip).each(function(strip){
			m = Math.max(m, strip.length);
		}); 
		return m; 
	}

,	findTestSample: function(test, wptTestId, wptTestRunIndex)
	{
		var sampleFound, self = this;

		var extractor = new DataExtractor(test, this.extractorConfig);
		//TODO: implement a findSample method
		extractor.iterateSamples(function(sample)
		{
			if(sample.testId === wptTestId && sample.run == parseInt(wptTestRunIndex))
			{
				sampleFound = sample;
			}
		}); 
		return sampleFound;  
	}

	//@method setUpFilmStrip init the high level this.filmStrip data with filled times
,	setUpFilmStrip: function()
	{		
		var self = this;
		this.filmStrip = {}; 
		_(this.samples).each(function(samples, testId)
		{
			self.filmStrip[testId] = DataExtractor.poblateVideoFrames(samples.sample);
		});
		// debugger;
	}

,	viewFirstView: function()
	{
		var hash = window.location.hash;
		var options = hash.indexOf('?')!==-1 ? hash.split('?')[1] : '';
		options = Util.parseOptions(options); 
		hash = hash.split('?')[0]; 
		var value = this.$('[data-action="viewFirstView"]:checked').size(); 
		options.viewRepeatView = value;
		var navigateHash = hash + '?' + Util.optionsToString(options); 
		Backbone.history.navigate(navigateHash, {trigger: true}); 
	}

,	htmlSnippet: function()
	{
		var html = this.$('.filmstrip-comparison').parent().html()
		,	view = new AbstractView({application:this.application});
		view.template = function() {return '<textarea>'+_(html).escape()+'</textarea>'; }
		// view.$el = jQuery(html); 
		this.application.showViewInModal(view, {title: 'film strip comparison html snippet '})
	}

});