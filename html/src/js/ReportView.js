var AbstractView = require('./AbstractView');
var DataExtractor = require('./DataExtractor'); 
var TestDescriptionView = require('./TestDescriptionView');
var Util = require('./Util');
// @module wptinquirer.html @class ReportView @extends AbstractView
module.exports = AbstractView.extend({

	template: 'report.html'

,	events: {
		'click [data-action="viewFirstView"]': 'viewFirstView'
	,	'change [data-chart-option]': 'changeChartControl'
	,	'click [data-action="showStandardDeviation"]': 'showStandardDeviation'
	}

,	initialize: function(options)
	{
		this.application = options.application;
		// this.reportId = options.reportId;
		this.testIds = options.testId.split(',');
		this.options = options.options || {};
		this.options.visuallyComplete100Threeshold = this.options.visuallyComplete100Threeshold || 100; 
		_(Chart.defaults.global).extend({
			scaleBeginAtZero: true
		}); 

		_(Chart.defaults.global).extend({
			animation: true
		}); 
	}

,	afterRender: function()
	{

		this.showLoadingStatus('[data-type="loading-spinner"]', true); 
		this.renderHeader();
		var self = this; 
		var aTestId = this.testIds[0];

		Util.getTestData(aTestId).done(function(data)
		{
			self.testData = data;
			var extractorConfig = {
				firstView: !self.options.viewRepeatView
			,	visuallyComplete100Threeshold: self.options.visuallyComplete100Threeshold 
			};
			self.dataExtractor = new DataExtractor(data, extractorConfig);

			self.showLoadingStatus('[data-type="loading-spinner"]', false); 

			self.drawChartVisuallyCompleteNonZero();
			self.drawChartVisuallyComplete100(); 
			self.drawChartLastVisualChange(); 
			self.drawChartFullyLoaded(); 
			self.drawChartSpeedIndex(); 

			var testDescriptionView = new TestDescriptionView({
				application: self.application
				, testData: self.testData
			});
			testDescriptionView.renderIn(self.$('[data-view="test-description"]')); 

		}); 

	}

,	drawAbstractLineChart: function(config)
	{
		var self = this
		,	data = self.dataExtractor.extractNumbers(config.extractNumbersId);

		var numbers = _(data).map(function(d){return d.value; }); 
		this.numbers = this.numbers || {}; 
		this.numbers[config.extractNumbersId] = numbers; 
		var labels = _(data).map(function(d){return d.testId; }); 

		var chartConfig = {
			responsive: true
		,	labels: labels
		,	datasets: [{
				label: 0
			,	fillColor: 'rgba(220,220,220,0.2)'
			,	strokeColor: 'rgba(220,220,220,1)'
			,	pointColor: 'rgba(220,220,220,1)'
			,	pointStrokeColor: '#fff'
			,	pointHighlightFill: '#fff'
			,	pointHighlightStroke: 'rgba(220,220,220,1)'
			,	data: numbers
			}]
		};

		var chartOptions = {};

		var canvas = self.$(config.chartSelector + ' .chart-canvas').get(0);
		var ctx = canvas.getContext('2d');
		var myLineChart = new Chart(ctx).Line(chartConfig, chartOptions);

		canvas.onclick = function(e)
		{
			var tooltipEl = self.$(config.chartSelector + ' .chart-tooltip')
			,	activePoints = myLineChart.getPointsAtEvent(e)
			,	point = activePoints[0]
			,	testId = point.label
			,	url = 'http://www.webpagetest.org/result/' + testId + '/'
			,	framesUrl = 'http://www.webpagetest.org/video/compare.php?tests='+testId+'&thumbSize=200&ival=100&end=visual'
			,	visualProgressUrl = 'http://www.webpagetest.org/video/compare.php?tests='+testId+'&thumbSize=200&ival=100&end=visual#compare_visual_progress'
			,	html = 'Selected Sample Test id: <b>'+testId+'</b>: '+
					'<a href="'+url+'">Summary</a>, '+
					'<a href="'+framesUrl+'">Frames</a>, ' + 
					'<a href="'+visualProgressUrl+'">Visual Progress</a>' ;

			tooltipEl.html(html);
		};
	}

,	showStandardDeviation: function(e)
	{
		var self = this;
		Util.loadVis().done(function()
		{
			var measureType = jQuery(e.currentTarget).closest('[data-measure-type]').attr('data-measure-type'); 
			var numbers = self.numbers[measureType]; 

			var view = new AbstractView({application: self.application});
			view.template = _('<div></div>').template(); 
			view.render();
			var config = {
				numbers:numbers
				// ,container:self.$('[data-measure-type="'+measureType+'"] .standard-deviation .chart').get(0)
				,	container: view.el
			}; 
			self.application.showViewInModal(view, {title: 'Standard Deviation for '+measureType}); 
		// debugger;
			self.drawStandardDeviation(config); 
		}); 		
	}

,	drawStandardDeviation: function(config)
	{
		var numbers = config.numbers
		,	out = DataExtractor.getStandarDeviation(numbers); 

		var items =  [], startTime=0;
		_(out).each(function(val, key)
		{
			if(val && val.length)
			{
				startTime=parseInt(key+'');
			}
			if(startTime)
			{
				items.push({
					x: Util.buildReferenceMsDate(parseInt(key+''))
					, y: val.length
				});	
			}
		}); 

		var dataset = new vis.DataSet(items);
		var options = {
			style:'bar'
			,timeAxis:{
				scale:'millisecond'
				,step:200
			}
			,dataAxis: {
				showMinorLabels:false
			}
			,drawPoints: {
				style: 'circle'
				,size: 10
			}
			,height: '600px'
		};
		var graph2d = new vis.Graph2d(config.container, dataset, options);
	}

,	drawChartVisuallyComplete100: function()
	{
		this.drawAbstractLineChart({
			extractNumbersId: 'VisuallyComplete100'
		,	chartSelector: '[data-id="visualCompletion100Canvas"]'
		}); 
	}

,	drawChartVisuallyCompleteNonZero: function()
	{
		this.drawAbstractLineChart({
			extractNumbersId: 'VisuallyCompleteNonZero'
		,	chartSelector: '[data-id="visualCompletionNonZeroCanvas"]'
		}); 
	}

,	drawChartLastVisualChange: function()
	{	
		this.drawAbstractLineChart({
			extractNumbersId: 'lastVisualChange'
		,	chartSelector: '[data-id="lastVisualChangeCanvas"]'
		}); 
	}

,	drawChartSpeedIndex: function()
	{
		this.drawAbstractLineChart({
			extractNumbersId: 'SpeedIndex'
		,	chartSelector: '[data-id="SpeedIndex"]'
		}); 
	}

,	drawChartFullyLoaded: function()
	{	
		this.drawAbstractLineChart({
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
		console.log(hash, options, value, navigateHash); 
		Backbone.history.navigate(navigateHash, {trigger: true}); 
	}

,	changeChartControl: function(el)
	{
		var el = jQuery(el.target), value = el.val()
		,	actionName = el.data('chart-option')
		,	options = {}; 
		options[actionName] = value; 
		var hash = Util.setOptionsToHash(null, options);
		Backbone.history.navigate(hash, {trigger:true}); 
	}

});