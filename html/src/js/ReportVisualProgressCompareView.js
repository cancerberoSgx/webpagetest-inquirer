var AbstractView = require('./AbstractView');
var DataExtractor = require('./DataExtractor'); 
var Util = require('./Util');

// @module wptinquirer.html @class ReportVisualProgressCompareView @extends AbstractView
module.exports = AbstractView.extend({

	template: 'report-visual-progress-compare.html'

,	events: {
		'click [data-action="viewFirstView"]': 'viewFirstView'
	,	'click [data-placeholder="videoFramesCompare"]': 'gotoVideoFrames'
	,	'click [data-action="removeOutliers"]': 'removeOutliers'
	}

,	initialize: function(options)
	{
		this.application = options.application;
		this.testIds = options.testIds.split(',');
		this.options = options.options || {};
		
		//@property {Object<String,String>} colors we want to draw all the charts using the same colors for each test def
		this.colors = {}; 
		Util.randomColorReset();
		
		_(Chart.defaults.global).extend({
			animation: false
		// ,	showXLabels: 10
		}); 
	}

,	afterRender: function()
	{
		this.renderHeader();
		this.showLoadingStatus('[data-type="loading-spinner"]', true); 
		var self = this; 
		self.dataExtractors = {};

		Util.getTestsData(this.testIds).done(function(obj)
		{
			var data = {}; 
			_(obj.tests).each(function(testData)
			{
				data[testData.testDefinition.testId] = testData; 
				var extractorConfig = {firstView: !self.options.viewRepeatView, removeOutliers: self.options.removeOutliers};
				self.dataExtractors[testData.testDefinition.testId] = new DataExtractor(testData, extractorConfig); 
			}); 
			self.data = data;

			self.showLoadingStatus('[data-type="loading-spinner"]', false); 

			self.drawAllCharts();
		}); 
	}

,	removeOutliers: function()
	{
		var checked = this.$('[data-action="removeOutliers"]:checked').size(); 
		var options = {removeOutliers: checked}; 
		var hash = Util.setOptionsToHash(null, options);
		Backbone.history.navigate(hash, {trigger:true}); 
	}

,	gotoVideoFrames: function(e)
	{
		e.preventDefault();
		e.stopPropagation(); 
		var url = 'videoFrames/?tests='; 
		// debugger;
		var mname = jQuery(e.target).closest('[data-measure-name]').attr('data-measure-name');
		_(this.dataExtractors).each(function(extractor)
		{
			var numbers = extractor.videoFrameNumbers[mname]
			,	testDefId = extractor.data.testDefinition.testId
			,	wptTestId = numbers.sampleData.testId; 
			url += testDefId + ':' + wptTestId + '-' + numbers.sampleData.runIndex + ','; 
		}); 
		Backbone.history.navigate(url, {trigger: true}); 
	}

,	drawAllCharts: function()
	{
		this.drawChartVisualProgress({
			extractNumbersId: 'VisuallyCompleteNonZero'
		,	chartSelector: '[data-id="visualCompletionNonZeroCanvas"]'
		}); 
		this.drawChartVisualProgress({
			extractNumbersId: 'VisuallyComplete100'
		,	chartSelector: '[data-id="visualCompletion100Canvas"]'
		}); 
		this.drawChartVisualProgress({
			extractNumbersId: 'lastVisualChange'
		,	chartSelector: '[data-id="lastVisualChangeCanvas"]'
		}); 
		this.drawChartVisualProgress({
			extractNumbersId: 'SpeedIndex'
		,	chartSelector: '[data-id="SpeedIndex"]'
		}); 
		this.drawChartVisualProgress({
			extractNumbersId: 'fullyLoaded'
		,	chartSelector: '[data-id="fullyLoadedCanvas"]'
		}); 
	}

,	drawChartVisualProgress: function (config)
	{
		var self = this
		,	datasets = [], labels = null, legends = [], largestData = null;

		_(self.dataExtractors).each(function(extractor, testId)
		{
			extractor.videoFrameNumbers = extractor.videoFrameNumbers || {}; 
			extractor.videoFrameNumbers[config.extractNumbersId] = extractor.getVideoFrameNumbers(config.extractNumbersId);

			var numbers = extractor.videoFrameNumbers[config.extractNumbersId].numbers;
	
			if(!labels)
			{
				labels = [];
				_(numbers).each(function(n)
				{
					labels.push(n.time); 
				}); 
			}

			if(!largestData || largestData.length < numbers.length)
			{
				largestData = numbers; 
			}

			numbers = _(numbers).map(function(n){return n.frame.VisuallyComplete; });

			var color = self.colors[testId] = (self.colors[testId] || Util.randomColor()); 
			var fillColor = _(color).clone()
			,	sample = extractor.getMedianSample(config.extractNumbersId).sample; 

			fillColor.a=0.05;

			datasets.push({
				data: numbers
				, label: testId
				, fillColor: Util.colorToRgb(fillColor)
				, strokeColor: Util.colorToRgb(color)
			});

			legends.push({
				name: testId
				, color: Util.colorToRgb(color)
				,sample: sample
				,url: '#report/'+testId
				,extraText: 'Speed Index: '+ sample.SpeedIndex +
					', Open in <a href="'+
					'http://www.webpagetest.org/video/compare.php?tests='+sample.testId+'&thumbSize=200&ival=100&end=visual#compare_visual_progress' +
					'">webpagetest.org</a>'
			}); 
		});
		
		
		for (var i = labels.length; i < largestData.length; i++) 
		{
			labels[i] = largestData[i].time;
		}
		labels = Util.chartjsSkipLabels(labels, 10); 

		var chartOptions = {}
		,	chartData = {
				labels: labels
			,	datasets: datasets
			}
		,	canvas = self.$(config.chartSelector + ' .chart-canvas').get(0)
		,	ctx = canvas.getContext('2d')
		,	myLineChart = new Chart(ctx).Line(chartData, chartOptions)
		,	legendHtml = Util.buildLegendHtml(legends); 
		// ,	legendHtml = '<span class="legend-title">Legend: </span><ul>';
		// _(legends).each(function(legend)
		// {
		// 	var visualProgressUrl = 'http://www.webpagetest.org/video/compare.php?tests='+legend.sample.testId+'&thumbSize=200&ival=100&end=visual#compare_visual_progress'; 
		// 	legendHtml += '<li><span class="legend-color" style="background-color:' + legend.color + 
		// 		'"></span><a href="#report/'+legend.name +'">' + legend.name + '</a>. '+
		// 		'Speed Index: '+ legend.sample.SpeedIndex +
		// 		', Open in <a href="'+visualProgressUrl+'">webpagetest.org</a>'+
		// 		'</li>'; 
		// }); 
		// legendHtml += '</ul>';
		self.$(config.chartSelector + ' .chart-legend').append(legendHtml);
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
		console.log(hash, options, value, navigateHash); 
		Backbone.history.navigate(navigateHash, {trigger: true}); 
	}

});