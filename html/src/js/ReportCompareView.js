var AbstractView = require('./AbstractView');
var DataExtractor = require('./DataExtractor'); 
var TestDescriptionView = require('./TestDescriptionView');
var Util = require('./Util');

// @module wptinquirer.html @class ReportCompareView @extends AbstractView
module.exports = AbstractView.extend({

	template: 'report-compare.html'

,	events: {
		'click [data-action="viewFirstView"]': 'viewFirstView'
	,	'change [data-type="sample-selection-by"]': 'sampleSelectionBy'
	,	'click [data-action="removeOutliers"]': 'removeOutliers'
	}

,	initialize: function(options)
	{
		this.application = options.application;
		this.testIds = options.testIds.split(',');
		_(Chart.defaults.global).extend({
			scaleBeginAtZero: true
		}); 
		this.options = options.options || {};

		// @property {Object<String,String>} colors we want to draw all the charts using the same colors for each test def
		this.colors = {}; 
		Util.randomColorReset();
		_(Chart.defaults.global).extend({
			animation: true
		}); 
	}

,	sampleSelectionBy: function()
	{
		var selected = this.$('[data-type="sample-selection-by"] :selected').val();
		var options = {sampleSelectionBy: selected}; 
		var hash = Util.setOptionsToHash(null, options);
		Backbone.history.navigate(hash, {trigger:true}); 
	}

,	removeOutliers: function()
	{
		var checked = this.$('[data-action="removeOutliers"]:checked').size(); 
		// console.log('checked', checked)
		var options = {removeOutliers: checked}; 
		var hash = Util.setOptionsToHash(null, options);
		Backbone.history.navigate(hash, {trigger:true}); 
	}

,	afterRender: function()
	{
		this.renderHeader();
		this.showLoadingStatus('[data-type="loading-spinner"]', true); 
		var self = this; 
		self.dataExtractors = {};
		var promises = []; 

		_(this.testIds).each(function(testId)
		{
			promises.push(Util.getTestData(testId));
		}); 
		jQuery.when.apply(jQuery, promises).done(function()
		{
			var data = {}; 			
			// _(arguments).each(function(arg)
			// {
			// 	var testData = arg; 
			_(Array.prototype.slice.call(arguments)).each(function(arg)
			{
				var testData = arg[0]; 
				data[testData.testDefinition.testId] = testData; 
				var extractorConfig = {
					firstView: !self.options.viewRepeatView
				,	sampleSelectionBy: self.options.sampleSelectionBy
				,	removeOutliers: self.options.removeOutliers
				};
				self.dataExtractors[testData.testDefinition.testId] = new DataExtractor(testData, extractorConfig); 
			}); 
			self.data = data;

			self.showLoadingStatus('[data-type="loading-spinner"]', false); 

			self.drawChartVisuallyComplete100(); 
			self.drawChartVisuallyCompleteNonZero();
			self.drawChartLastVisualChange();
			self.drawChartSpeedIndex();
			self.drawChartFullyLoaded(); 
		}); 
	}

,	drawAbstractBarChart: function(config)
	{
		var datasets = [], self = this, legends = []; 

		_(self.dataExtractors).each(function(extractor, testId)
		{
			var number = extractor.extractSingleNumber(config.extractNumbersId);
			var color = self.colors[testId] = (self.colors[testId] || Util.randomColor()); 
			var fillColor = _(color).clone();
			fillColor.a = 0.2;
			datasets.push({
				data: [number]
				, label: testId
				, fillColor: Util.colorToRgb(color)
			});
			legends.push({
				name: testId
				, color: Util.colorToRgb(color)
				, url: '#report/'+testId
			}); 
		});
		
		var chartOptions = {
			showXLabels: 2
		}; 
		var chartData = {
			labels: [_.range(this.testIds.length)],
			datasets: datasets
		};

		var canvas = self.$(config.chartSelector + ' .chart-canvas').get(0);
		var ctx = canvas.getContext('2d');

		var myBarChart = new Chart(ctx).Bar(chartData, chartOptions);

		var legendHtml = Util.buildLegendHtml(legends); 
		self.$(config.chartSelector + ' .chart-legend').append(legendHtml);

	}

,	drawChartVisuallyCompleteNonZero: function()
	{
		this.drawAbstractBarChart({
			extractNumbersId: 'VisuallyCompleteNonZero'
		,	chartSelector: '[data-id="visualCompletionNonZeroCanvas"]'
		});
	}

,	drawChartVisuallyComplete100: function()
	{
		this.drawAbstractBarChart({
			extractNumbersId: 'VisuallyComplete100'
		,	chartSelector: '[data-id="visualCompletion100Canvas"]'
		});
	}



,	drawChartLastVisualChange: function()
	{	
		this.drawAbstractBarChart({
			extractNumbersId: 'lastVisualChange'
		,	chartSelector: '[data-id="lastVisualChangeCanvas"]'
		}); 
	}

,	drawChartSpeedIndex: function()
	{
		this.drawAbstractBarChart({
			extractNumbersId: 'SpeedIndex'
		,	chartSelector: '[data-id="SpeedIndex"]'
		}); 
	}

,	drawChartFullyLoaded: function()
	{	
		this.drawAbstractBarChart({
			extractNumbersId: 'fullyLoaded'
		,	chartSelector: '[data-id="fullyLoadedCanvas"]'
		}); 
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


});