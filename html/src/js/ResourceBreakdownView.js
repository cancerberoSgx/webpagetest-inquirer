
// @module wptinquirer.html @class ResourceBreakdownView compare the resource breakdown of two or more tests. 
// TODO: WIP - currently the sample selection is hardcoded to VisuallyCompleteNonZero
// @extends AbstractView

var AbstractView = require('./AbstractView');
var DataExtractor = require('./DataExtractor');
var Util = require('./Util');

module.exports = AbstractView.extend({

	template: 'resourceBreakdown.html'

,	initialize: function(options)
	{
		var self = this;
		this.application = options.application;
		this.options = options.options;

		this.testIds = options.testIds.split(',');

		this.resources = ['html', 'css', 'js', 'image', 'font', 'other']; 
		this.colors = {};
		Util.randomColorReset();
		_(this.resources).each(function(res)
		{
			self.colors[res] = Util.randomColorRgb(); 
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
				var extractorConfig = {firstView: !self.options.viewRepeatView};
				self.dataExtractors[testData.testDefinition.testId] = new DataExtractor(testData, extractorConfig); 
			}); 
			self.data = data;

			self.showLoadingStatus('[data-type="loading-spinner"]', false); 

			self.showResourceBreakdown();
			self.renderHeader();
		}); 
	}

,	showResourceBreakdown: function()
	{
		var self = this;
		self.render(true)
		_(this.data).each(function(data, testId)
		{
			var extractor = self.dataExtractors[testId]; 
			var breakdown = extractor.getMedianSample('VisuallyCompleteNonZero').sample.breakdown;
			var chartData = [];
			var legends = []; 
			_(breakdown).each(function(b, name)
			{
				chartData.push({value: b.bytes, label: name, color: self.colors[name]});
				legends.push({name: name, color: self.colors[name]});
			}); 

			var legendHtml = Util.buildLegendHtml(legends); 
			self.$('[data-legend="'+testId+'"]').html(legendHtml);

			var canvas = self.$('[data-canvas-test-id="'+testId+'"]').get(0);
			var ctx = canvas.getContext('2d');
			var myPieChart = new Chart(ctx).Pie(chartData, {});
		}); 
		
	}
});