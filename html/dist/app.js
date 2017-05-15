(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Router = require('./Router'); 
var AbstractView = require('./AbstractView'); 
// @module wptinquirer.html @class Application
var Application = function()
{
	this.templates = window.JST;

	if(jQuery('#mainContainer').size()===0)
	{
		jQuery('body').append('<div id="mainContainer"></div>'); 
	}
	this.$containerEl = jQuery('#mainContainer'); 


	if(jQuery('#modalsContainer').size()===0)
	{
		jQuery('body').append('<div id="modalsContainer"></div>'); 
	}
	this.$modalsContainer = jQuery('#modalsContainer');
	// this.$modalsContainer .hide();
	this.modalView = new AbstractView({application: this}); 
	this.modalView.template = '_modal.html'; 
	// this.modalView.title = 'Information'; 
	this.modalView.renderIn(this.$modalsContainer); 
}; 

_(Application.prototype).extend({

	//@method showView @param {AbstractView} view
	showView: function(view)
	{
		this.currentView = view;
		this.$containerEl.empty();
		view.renderIn(this.$containerEl);
	}

,	showViewInModal: function(view, modalConfig)
	{
		//TODO: destroy current child view
		this.modalView.$('[data-type="modal-body"]').empty();
		var title = modalConfig.title || 'Information';	
		this.modalView.$('[data-type="modal-title"]').text(title);
		view.renderIn(this.modalView.$('[data-type="modal-body"]'));
		this.modalView.$('#myModal').modal('show'); 
	}
});

Application.start = function()
{
	Application.instance = new Application();	
	new Router(Application.instance);
	Backbone.history.start(); 
}; 


jQuery(document).ready(function()
{	
	Application.start(); 
}); 

module.exports = Application;

},{"./AbstractView":2,"./Router":9}],2:[function(require,module,exports){
// var LoadingView = require('./LoadingView'); 

// @module wptinquirer.html @class AbstractView @extends Backbone.View
var AbstractView = Backbone.View.extend({

	initialize: function(options)
	{
		this.application = options.application;
	}

	//@method renderIn renders this view in given parent element @param {jQuery} $parent
,	renderIn: function($parent, dontAfterRender)
	{
		var template;
		if(_(this.template).isFunction())
		{
			template = this.template; 
		}
		else
		{
			template = this.application.templates[this.template]; 
		}
		if(template)
		{
			var html = template.apply(this, []); 
			this.$el.html(html);
			$parent.append(this.$el); 
		}
		else
		{
			console.log('Invalid template, ', this.template); 
			return;
		}
		this._afterRender(); 
		if(!dontAfterRender)
		{
			this.afterRender();
		}
		return this;
	}

,	afterRender: function()
	{
	}

,	_afterRender: function()
	{
		var events = _({
			'click [data-help-ref]': 'showHelp'
		}).extend(this.events); 
		// console.log(events)
		this.delegateEvents(events); 
	}

,	showHelp: function(el)
	{
		// data-help-ref="reportCompareSampleSelectionBy"
		var helpId = jQuery(el.target).data('help-ref');
		var title = jQuery(el.target).data('help-title') || ('Help on ' + helpId);
		var helpView = new AbstractView({application: this.application}); 
		_(helpView).extend({
			template: 'help/'+helpId+'.html'
		// ,	title: title
		})
		this.application.showViewInModal(helpView, {title: title}); 
	}
		
	//@method render implemented to comply with Backbone View contract		
,	render: function(dontAfterRender)
	{
		return this.renderIn(jQuery(this.el), dontAfterRender); 
	}

,	renderHeader: function()
	{
		var html = this.application.templates['header.html'].apply(this, []); 
		this.$el.prepend(html)
	}

,	showLoadingStatus: function(placeholder, status)
	{
		if(status)
		{
			var loadingView = new AbstractView({application: this.application});
			loadingView.template = 'loading.html'; 
			loadingView.renderIn(this.$(placeholder));
		}
		else
		{
			this.$(placeholder).empty();
		}
	}
}); 

module.exports = AbstractView; 

},{}],3:[function(require,module,exports){
// IMPORTANT this code must support to be executed in node !!!

// @module wptinquirer.html 
// @class DataExtractor responsible of extracting relevant/interesting numbers from test data. 
// A dataExtractor is associated with exactly ONE test definition and user must pass its data in the constructor.

//TODO. when discretization put all hardcoded 100ms in a config prop


// @constructor @param {Object} testData the json object of a test's data.json with no modifications
var DataExtractor = function(testData, config)
{
	this.data = testData;
	this.config = {
		//@property {String} config.multipleTestChooseStrategy can be 'media', 'all'
		multipleTestChooseStrategy: 'all'
		// @property {Boolean} firstView from where do I extract the numbers from  the first view or the repeat view ? 
	,	firstView: true

	,	visuallyCompleteNonZeroThreeshold: 1
	,	visuallyComplete100Threeshold: 100

	}; 

	_(this.config).extend(config||{}); 

	this.videoFrames = {samples:[]};
}; 

_(DataExtractor.prototype).extend({

	// @method iterateSamples always use this method to iterate all teest definition samples. 
	// @param {Function} iterator
	iterateSamples: function(iterator)
	{
		var self = this, runCount=0, testCount=0;
		_(this.data.testResults).each(function(result)
		{testCount++;
			runCount=0;
			if(_(result.runs).keys().length > 1)
			{runCount++;
				if(self.config.multipleTestChooseStrategy === 'media')
				{
					//means : choose the webpagetest media sample (media w respect to)
					throw 'TODO';
				}
				else if(self.config.multipleTestChooseStrategy === 'all')
				{
					_(result.runs).each(function(run, runKey)
					{
						var viewName = self.config.firstView ? 'firstView' : 'repeatView';
						var sample = run[viewName]; 
						if(!sample)
						{
							sample = run.firstView; 
						}
						if(!sample)
						{
							console.log('WARNING, ignoring empty '+viewName+' in run #'+runCount+' in test #'+testCount+' in testId='+self.data.testDefinition.testId); 
							// debugger;
							return;
						}
						sample.testId = result.id;
						iterator(sample, result.id, runKey); 
					}); 
				}
			}
			else
			{
				throw 'TODO'; 
			}
		}); 
	}
 
	//@method extractSingleNumber 
	// @param {String}measureName @param {String} type can be 'average', 'median' 
	// @return Number the average or median number of calling extractNumbers() with given measurement type.
,	extractSingleNumber: function(measureName, type)
	{
		type = type || this.config.sampleSelectionBy || 'average'; 
		var numbers = this.extractNumbers(measureName);

		numbers = this.removeOutliers(numbers); 

		if(type==='average')
		{
			var average = 0;
			_(numbers).each(function(number)
			{
				average += number.value;
			}); 
			return average / _(numbers).keys().length; 
		}
		else if(type === 'median')
		{
			var medianSample = this.getMedianSample(measureName).sample;
			return this.sampleExtractMeasure(medianSample, measureName); 
		}
		else
		{
			throw 'TODO';
		}
	}

,	removeOutliers: function(numbers)
	{
		if(!this.config.removeOutliers)
		{
			return numbers;
		}

		var values = _.map(numbers, function(o){return o.value});
		values.sort(function(a, b){return a<b?-1:1})
		// var cut = numbers.length>9 ? 0.1 : 0.2
		var howMany = Math.round(parseInt(values.length*0.1)) || 1
		// console.log('BEFORE', howMany, values.length, values)
		values.splice(values.length-howMany, howMany)
		// values.splice(3, 3)
		// console.log('AFTER', values.length, values)

		var choosen = values[values.length-1]

		var result = numbers.filter(function(o){return o.value == choosen})
		return result;
		// var output = values.filter(function(val))
		// console.log(values)
		// if(!this.config.removeOutliers)
		// {
		// 	return numbers;
		// }
		// var sum = 0;     // stores sum of elements
		// var sumsq = 0; // stores sum of squares
		// var l = numbers.length;
		// for(var i=0; i<numbers.length; ++i) 
		// {
		// 	sum += numbers[i].value;
		// 	sumsq += numbers[i].value*numbers[i].value;
		// }
		// var mean = sum/l; 
		// var varience = sumsq / l - mean*mean;
		// var sd = Math.sqrt(varience);
		// var numbersOutput = []; // uses for data which is 3 standard deviations from the mean
		// for(var i=0; i<numbers.length; ++i) 
		// {
		// 	if(numbers[i].value > mean - 3 *sd && numbers[i].value < mean + 3 *sd)
		// 	{					
		// 		numbersOutput.push(numbers[i]);	
		// 	}
		// }
		// return numbersOutput; 
	}

	//@method sampleExtractMeasure @return {Number}
,	sampleExtractMeasure: function(sample, measureName)
	{
		var self = this, val;

		if(typeof(sample[measureName])!=='undefined')
		{
			return sample[measureName]; 
		}
		else if(measureName === 'VisuallyCompleteNonZero')
		{
			val = self.getVisuallyCompleteNonZeroNumbers(sample);
			return val.value;
			// debugger;
		}
		else if(measureName === 'VisuallyComplete100')
		{
			val = self.getVisuallyComplete100Numbers(sample);
			return val.value;
		}
		else
		{
			console.log('sampleExtractMeasure unknown measure name ' + measureName); 
		}
	}

	// @method extractNumbers 
	// @param {String}measureName
	// @return {Array}
,	extractNumbers: function(measureName)
	{	
		//TODO: cache
		var self = this, numbers = [], number;
		self.iterateSamples(function(sample, testId, runKey)
		{
			if(measureName === 'lastVisualChange' || measureName === 'fullyLoaded' ||
				measureName === 'SpeedIndex')
			{
				numbers.push({testId: testId, sample: sample, runIndex: runKey
					, value: self.sampleExtractMeasure(sample, measureName)}); 
			}
			//TODO: delete the following repeated code and use this.sampleExtractMeasure()
			else if(measureName === 'VisuallyCompleteNonZero')
			{
				number = _({testId: testId, sample: sample, runIndex: runKey}).extend(self.getVisuallyCompleteNonZeroNumbers(sample));
				numbers.push(number); 
			}
			else if(measureName === 'VisuallyComplete100')
			{
				number = _({testId: testId, sample: sample, runIndex: runKey}).extend(self.getVisuallyComplete100Numbers(sample));
				numbers.push(number); 
			}
			else
			{
				console.log('error no measure type defined: ' + measureName); 
			}
		});
		return numbers;
	}


	//@method getFirstPaintTime @param {Object} sample the data.json 
,	getVisuallyCompleteNonZeroNumbers: function(sample)
	{
		var self = this
		,	compareAgainst = self.config.visuallyCompleteNonZeroThreeshold || 0;
		if(!sample.videoFrames)
		{
			console.log('WARNING, sample without videoFrames found!');return;
		}
		var frame = _(sample.videoFrames).find(function(f)
		{
			return f.VisuallyComplete > compareAgainst; 
		}); 
		if(!frame)
		{
			frame = sample.videoFrames[0];
		}
		return _({value:frame.time}).extend(frame);//{value:frame.time};
	}

	//@method getVisuallyComplete100Numbers @param {Object} sample the data.json 
,	getVisuallyComplete100Numbers: function(sample)
	{
		var self = this
		,	compareAgainst = self.config.visuallyComplete100Threeshold || 100
		, frame = _(sample.videoFrames).find(function(f)
		{
			return f.VisuallyComplete >= compareAgainst; 
		}); 
		if(!sample.videoFrames)
		{
			console.log('WARNING, sample without videoFrames found!');return;
		}
		return _({value:frame.time}).extend(frame);
	}


	// visual progress averages : it's not trivial. what we do for comparing is: 
	// 1) show two lines in time with no transformations
	// 2) the line shown is the median's according to a measure type
	// 3) we draw several charts taking the median on different measure types

	// @method getMedianSample @param {String}measureName median with respect to what number ? 
	// @return {sample:Number,testId:String} the median sample of all the data
,	getMedianSample: function(measureName, partIn)
	{
		partIn = partIn || 0.5;
		var divider = 1 / partIn, self = this
		,	samples = [];
		self.iterateSamples(function(sample, testId, runKey)
		{
			samples.push({sample:sample,testId: testId, runIndex: runKey}); 
		});

		samples.sort(function(s1, s2)
		{
			var s1Val = self.sampleExtractMeasure(s1.sample, measureName)
			,	s2Val = self.sampleExtractMeasure(s2.sample, measureName); 
			return s1Val - s2Val;
		}); 


		var divideIndex = Math.floor(samples.length/divider); 
		var medianSample = samples[divideIndex]; 
		return medianSample;
	}

	// @method getVideoFrameNumbers @param {String} measureName 
	// @return {time:Number,frame:Object,sampleData:Object}
,	getVideoFrameNumbers: function(measureName)
	{
		var sampleData = this.getMedianSample(measureName)
		,	sample = sampleData.sample
		,	numbers = DataExtractor.poblateVideoFrames(sample)

		return {
			numbers: numbers
			, sampleData: sampleData
		};
	}

}); 


// statics
_(DataExtractor).extend({

	// @method poblateVideoFrames given a sample it will return the equivalent videoFrames array but filling with missing discrete times. By default each frame is 100ms. 
	// @static @param sample @return {Array<Number>}
	poblateVideoFrames: function(sample)
	{
		var maxTime = DataExtractor.getMaxVideoFrameTime(sample)
		,	numbers = []
		,	currentFrameIndex = 0
		,   t = 0;

		for (t = 0; t <= maxTime; t += 100) 
		{
			if(sample.videoFrames[currentFrameIndex+1].time < t)
			{
				currentFrameIndex++;
				if(currentFrameIndex >= sample.videoFrames.length - 1)
				{
					break;
				}
			}
			numbers.push({
				time: t
			,	frame: sample.videoFrames[currentFrameIndex]
			}); 
		}
		//add the last one
		numbers.push({
			time: t
		,	frame: sample.videoFrames[sample.videoFrames.length-1]
		}); 
		return numbers; 
	}

	// @method getMaxVideoFrameTime @static @param sample @return {Number}
,	getMaxVideoFrameTime: function(sample)
	{
		//TODO: cache
		var maxTime = 0;
		_(sample.videoFrames).each(function(frame)
		{
			if(frame.time > maxTime)
			{
				maxTime = frame.time; 
			}
		});
		return maxTime; 
	}

,	getMax: function(numbers)
	{
		//TODO: cache
		var maxTime = 0;
		_(numbers).each(function(n)
		{
			if(n > maxTime)
			{
				maxTime = n; 
			}
		});
		return maxTime; 
	}

,	getStandarDeviation: function(numbers)
	{
		var	maxTime = DataExtractor.getMax(numbers)
		,	out = {}; 

		for (var i = 0; i < maxTime; i += 100) 
		{
			if(out[i] === undefined)
			{
				out[i] = []; 
			}
			_(numbers).each(function(n)
			{
				if(n>=i && n<i+100)
				{
					out[i].push(n);
				}
			});
		}
		return out;
	}
}); 

module.exports = DataExtractor;

},{}],4:[function(require,module,exports){
// @module wptinquirer.html @class Application @extends AbstractView
var AbstractView = require('./AbstractView');
var Util = require('./Util')

module.exports = AbstractView.extend({

	template: 'home.html'

,	events: {
		'click [data-action="report"]': 'report'
	,	'click [data-action="report-compare"]': 'reportCompare'
	,	'click [data-action="report-visualProgressCompare"]': 'reportVisualProgressCompare'
	}

,	initialize: function(options)
	{
		this.application = options.application;
	}

,	afterRender: function()
	{
		var self = this; 

		this.renderHeader();
		this.showLoadingStatus('[data-type="loading-spinner"]', true); 

		Util.getTestsMetadata().done(function(metadata)
		{	
			self.metadata = metadata; 

			self.showLoadingStatus('[data-type="loading-spinner"]', false); 
			self.render(true);
			self.renderHeader();
		}); 

	}

,	report: function()
	{
		var tests = this.getSelectedTests();
		if(!tests||!tests.length)
		{
			return;
		}; 
		Backbone.history.navigate('report/' + tests[0], {trigger:true});
	}

,	reportCompare: function()
	{
		var tests = this.getSelectedTests();
		if(!tests||!tests.length)
		{
			return;
		}; 
		Backbone.history.navigate('reportCompare/' + tests.join(','), {trigger:true});
	}

,	reportVisualProgressCompare: function()
	{
		var tests = this.getSelectedTests();
		if(!tests||!tests.length)
		{
			return;
		}; 
		Backbone.history.navigate('visualProgressCompare/' + tests.join(','), {trigger:true});
	}

,	getSelectedTests: function()
	{
		var tests = [];
		var checked = this.$('.report-selection:checked'); 
		if(!checked.size()) 
		{
			this.$('.condition-met').show();
			return null;
		}
		else
		{
			this.$('.condition-met').hide();
		}
		checked.each(function()
		{
			tests.push(jQuery(this).val()); 
		}); 
		return tests; 
	}
});    

},{"./AbstractView":2,"./Util":11}],5:[function(require,module,exports){
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

},{"./AbstractView":2,"./DataExtractor":3,"./TestDescriptionView":10,"./Util":11}],6:[function(require,module,exports){
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

},{"./AbstractView":2,"./DataExtractor":3,"./TestDescriptionView":10,"./Util":11}],7:[function(require,module,exports){
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

},{"./AbstractView":2,"./DataExtractor":3,"./Util":11}],8:[function(require,module,exports){

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

},{"./AbstractView":2,"./DataExtractor":3,"./Util":11}],9:[function(require,module,exports){
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

},{"./HomeView":4,"./ReportCompareView":5,"./ReportView":6,"./ReportVisualProgressCompareView":7,"./ResourceBreakdownView":8,"./Util":11,"./VideoFramesView":12}],10:[function(require,module,exports){

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

},{"./AbstractView":2,"./DataExtractor":3,"./Util":11}],11:[function(require,module,exports){
// @module wptinquirer.html @class Util misc utilities
module.exports = {
	

	getTestsMetadata: function()
	{
		// this.getTestsMetadataPromise = this.getTestsMetadataPromise || jQuery.getJSON('../testData/metadata.json'); 
		// return this.getTestsMetadataPromise; 

		// this.getTestsMetadataPromise = this.getTestsMetadataPromise || {}; 
		var promise; 
		if(this.getTestsMetadataPromise)
		{
			promise = this.getTestsMetadataPromise; 
		}
		else if(window._webpagetestinquirer_data)
		{
			promise = jQuery.Deferred();
			var data = window._webpagetestinquirer_data.metadata; 
			promise.resolve(data);
		}
		else
		{
			promise = jQuery.getJSON('../testData/metadata.json'); 
		}
		this.getTestsMetadataPromise = promise; 
		return promise; 
	}


,	getTestData: function(testId)
	{
		this.getTestDataPromises = this.getTestDataPromises || {}; 
		var promise; 
		// debugger;
		if(this.getTestDataPromises[testId])
		{
			promise = this.getTestDataPromises[testId]; 
		}
		else if(window._webpagetestinquirer_data)
		{
			promise = jQuery.Deferred();
			var data = [window._webpagetestinquirer_data.tests[testId]]; 
			promise.resolve(data);
		}
		else
		{
			promise = jQuery.getJSON('../testData/' + testId + '/data.json'); 
		}
		this.getTestDataPromises[testId] = promise; 
		return promise; 
	}

,	getTestsData: function(testIds)
	{
		var promises = [], self = this, promise = jQuery.Deferred(); 
		_(testIds).each(function(testId)
		{
			promises.push(self.getTestData(testId));
		}); 
		jQuery.when.apply(jQuery, promises).done(function()
		{
			var tests = []; 
			_(arguments).each(function(arg)
			{
				tests.push(arg[0]); 
			});
			promise.resolve({tests:tests});
		}); 
		return promise; 
	}

,	loadVis: function()
	{
		var promise = jQuery.Deferred();
		toast(
			'lib/vis/dist/vis.min.js'
		,	'lib/vis/dist/vis.min.css'
		,	function()
			{
				promise.resolve();
			}
		); 
		return promise; 
	}


,	openInNewTab: function(url) 
	{
		var win = window.open(url, '_blank');
		win.focus();
	}

,	chartjsSkipLabels: function(labels, skip)
	{
		var newLabels = []; 
		_(labels).each(function(label, index)
		{
			if(index % skip !== 0)
			{
				newLabels.push('');
			}
			else
			{
				newLabels.push(label);
			}
		});
		return newLabels; 
	}






	//COLORS

,	randomInt: function(min, max)
	{
		return Math.floor(Math.random() * max) + min; 
	}

,	randomColorsPalette: [
		{r:93, g : 165, b: 218}
	,	{r:250, g: 164, b: 58}
	,	{r: 96, g: 189, b: 104}
	,	{r: 241, g: 124, b: 176}
	,	{r: 178, g: 145, b: 47}
	,	{r: 178, g: 118, b: 178}
	,	{r: 222, g: 207, b: 63}
	,	{r: 241, g: 88, b: 84}
	,	{r: 77, g: 77, b: 77}
	]

,	randomColorIndex: 0

,	randomColorReset: function()
	{
		this.randomColorIndex = 0;
	}

,	randomColorRgb: function(alpha)
	{
		var c = this.randomColor(alpha); 
		return this.colorToRgb(c); 
		
	}

,	colorToRgb: function(c)
	{
		if(c.a)
		{
			return 'rgba(' + c.r + ',' +  c.g + ',' +  c.b + ',' + c.a + ')';
		}
		else
		{
			return 'rgb(' + c.r + ',' +  c.g + ',' +  c.b + ')';
		}
	}

,	randomColor: function(alpha)
	{
		var c = {r: this.randomInt(0, 255), g: this.randomInt(0, 255), b: this.randomInt(0, 255)}; 
		if(this.randomColorsPalette.length > this.randomColorIndex)
		{
			c = this.randomColorsPalette[this.randomColorIndex]; 
			this.randomColorIndex++;
		}
		if(alpha)
		{
			c.a = alpha; 
		}
		return c;
	}






	// URL OPTIONS

	//@method parseOptions @return {Object<String,String>}
,	parseOptions: function(options, propSep, valueSep)
	{
		propSep = propSep || '&'; 
		valueSep = valueSep || '='; 
		if(!options)
		{
			return {}; 
		}
		var params = {};
		_(options.split(propSep)).each(function(p)
		{
			var a = p.split(valueSep); 
			if (a.length >= 2)
			{
				params[a[0]] = a[1]; 
				if(!a[1] || a[1]==='0' || a[1]==='false')
				{
					params[a[0]] = false;
				}
			}
		}); 
		return params;
	}

,	getOptionsFromHash: function(hash)
	{
		hash = hash || window.location.hash;
		var options = hash.split('?');
		options = options.length<2 ? '' : options[1]; 
		return this.parseOptions(options);
	}

,	setOptionsToHash: function(hash, newOptions)
	{		
		hash = hash || window.location.hash;
		var options = hash.split('?');
		options = options.length<2 ? '' : options[1]; 
		options = this.parseOptions(options); 
		_(options).extend(newOptions);
		return hash.split('?')[0] + '?' + this.optionsToString(options); 
	}

,	optionsToString: function(options, propSep, valueSep)
	{
		propSep = propSep || '&'; 
		valueSep = valueSep || '='; 
		var a = []; 
		_(options).each(function(value, key)
		{
			a.push(key + valueSep + value); 
		}); 
		return a.join(propSep); 
	}



	//DATES

,	buildReferenceDate: function()
	{
		var date = new Date(0,0,0,0,0,0);
		return date;
	}

,	buildReferenceMsDate: function(ms)
	{
		var date = this.buildReferenceDate(); 
		date.setMilliseconds(date.getMilliseconds() + ms); 
		return date;
	}
	


	// HTML 

,	buildLegendHtml: function(legends)
	{
		var legendHtml = '<span class="legend-title">Legend: </span><ul class="legends">';
		_(legends).each(function(legend)
		{

		// console.log( legend.extraText)
		
			var inner = legend.url ? 
				('<a href="'+legend.url+'">' + legend.name + '</a>') : 
				('<span>'+legend.name+'</span>'); 
			inner = inner + (legend.extraText||''); 
			legendHtml += '<li><span class="legend-color" style="background-color:' + legend.color + 
				'"></span>'+inner+'</li>'; 
		}); 
		legendHtml += '</ul>';
		return legendHtml;
	}

}; 

},{}],12:[function(require,module,exports){

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

},{"./AbstractView":2,"./DataExtractor":3,"./Util":11}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2d1cmluL1BlcmZvcmNlL3NndXJpbl9zYXVyMDAyODhfNzc0Ny9QbGF0Zm9ybV9Tb2x1dGlvbnMvRUNvbW1lcmNlL1JlZmVyZW5jZV9JbXBsZW1lbnRhdGlvbnNfVG9vbHMvd2VicGFnZXRlc3QtaW5xdWlyZXIvaHRtbC9zcmMvanMvQXBwbGljYXRpb24uanMiLCIvVXNlcnMvc2d1cmluL1BlcmZvcmNlL3NndXJpbl9zYXVyMDAyODhfNzc0Ny9QbGF0Zm9ybV9Tb2x1dGlvbnMvRUNvbW1lcmNlL1JlZmVyZW5jZV9JbXBsZW1lbnRhdGlvbnNfVG9vbHMvd2VicGFnZXRlc3QtaW5xdWlyZXIvaHRtbC9zcmMvanMvQWJzdHJhY3RWaWV3LmpzIiwiL1VzZXJzL3NndXJpbi9QZXJmb3JjZS9zZ3VyaW5fc2F1cjAwMjg4Xzc3NDcvUGxhdGZvcm1fU29sdXRpb25zL0VDb21tZXJjZS9SZWZlcmVuY2VfSW1wbGVtZW50YXRpb25zX1Rvb2xzL3dlYnBhZ2V0ZXN0LWlucXVpcmVyL2h0bWwvc3JjL2pzL0RhdGFFeHRyYWN0b3IuanMiLCIvVXNlcnMvc2d1cmluL1BlcmZvcmNlL3NndXJpbl9zYXVyMDAyODhfNzc0Ny9QbGF0Zm9ybV9Tb2x1dGlvbnMvRUNvbW1lcmNlL1JlZmVyZW5jZV9JbXBsZW1lbnRhdGlvbnNfVG9vbHMvd2VicGFnZXRlc3QtaW5xdWlyZXIvaHRtbC9zcmMvanMvSG9tZVZpZXcuanMiLCIvVXNlcnMvc2d1cmluL1BlcmZvcmNlL3NndXJpbl9zYXVyMDAyODhfNzc0Ny9QbGF0Zm9ybV9Tb2x1dGlvbnMvRUNvbW1lcmNlL1JlZmVyZW5jZV9JbXBsZW1lbnRhdGlvbnNfVG9vbHMvd2VicGFnZXRlc3QtaW5xdWlyZXIvaHRtbC9zcmMvanMvUmVwb3J0Q29tcGFyZVZpZXcuanMiLCIvVXNlcnMvc2d1cmluL1BlcmZvcmNlL3NndXJpbl9zYXVyMDAyODhfNzc0Ny9QbGF0Zm9ybV9Tb2x1dGlvbnMvRUNvbW1lcmNlL1JlZmVyZW5jZV9JbXBsZW1lbnRhdGlvbnNfVG9vbHMvd2VicGFnZXRlc3QtaW5xdWlyZXIvaHRtbC9zcmMvanMvUmVwb3J0Vmlldy5qcyIsIi9Vc2Vycy9zZ3VyaW4vUGVyZm9yY2Uvc2d1cmluX3NhdXIwMDI4OF83NzQ3L1BsYXRmb3JtX1NvbHV0aW9ucy9FQ29tbWVyY2UvUmVmZXJlbmNlX0ltcGxlbWVudGF0aW9uc19Ub29scy93ZWJwYWdldGVzdC1pbnF1aXJlci9odG1sL3NyYy9qcy9SZXBvcnRWaXN1YWxQcm9ncmVzc0NvbXBhcmVWaWV3LmpzIiwiL1VzZXJzL3NndXJpbi9QZXJmb3JjZS9zZ3VyaW5fc2F1cjAwMjg4Xzc3NDcvUGxhdGZvcm1fU29sdXRpb25zL0VDb21tZXJjZS9SZWZlcmVuY2VfSW1wbGVtZW50YXRpb25zX1Rvb2xzL3dlYnBhZ2V0ZXN0LWlucXVpcmVyL2h0bWwvc3JjL2pzL1Jlc291cmNlQnJlYWtkb3duVmlldy5qcyIsIi9Vc2Vycy9zZ3VyaW4vUGVyZm9yY2Uvc2d1cmluX3NhdXIwMDI4OF83NzQ3L1BsYXRmb3JtX1NvbHV0aW9ucy9FQ29tbWVyY2UvUmVmZXJlbmNlX0ltcGxlbWVudGF0aW9uc19Ub29scy93ZWJwYWdldGVzdC1pbnF1aXJlci9odG1sL3NyYy9qcy9Sb3V0ZXIuanMiLCIvVXNlcnMvc2d1cmluL1BlcmZvcmNlL3NndXJpbl9zYXVyMDAyODhfNzc0Ny9QbGF0Zm9ybV9Tb2x1dGlvbnMvRUNvbW1lcmNlL1JlZmVyZW5jZV9JbXBsZW1lbnRhdGlvbnNfVG9vbHMvd2VicGFnZXRlc3QtaW5xdWlyZXIvaHRtbC9zcmMvanMvVGVzdERlc2NyaXB0aW9uVmlldy5qcyIsIi9Vc2Vycy9zZ3VyaW4vUGVyZm9yY2Uvc2d1cmluX3NhdXIwMDI4OF83NzQ3L1BsYXRmb3JtX1NvbHV0aW9ucy9FQ29tbWVyY2UvUmVmZXJlbmNlX0ltcGxlbWVudGF0aW9uc19Ub29scy93ZWJwYWdldGVzdC1pbnF1aXJlci9odG1sL3NyYy9qcy9VdGlsLmpzIiwiL1VzZXJzL3NndXJpbi9QZXJmb3JjZS9zZ3VyaW5fc2F1cjAwMjg4Xzc3NDcvUGxhdGZvcm1fU29sdXRpb25zL0VDb21tZXJjZS9SZWZlcmVuY2VfSW1wbGVtZW50YXRpb25zX1Rvb2xzL3dlYnBhZ2V0ZXN0LWlucXVpcmVyL2h0bWwvc3JjL2pzL1ZpZGVvRnJhbWVzVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNqQyxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUM3Qyw4Q0FBOEM7QUFDOUMsSUFBSSxXQUFXLEdBQUc7QUFDbEI7QUFDQSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQzs7Q0FFNUIsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDO0NBQ3RDO0VBQ0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0VBQ3hEO0FBQ0YsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQzlDOztDQUVDLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztDQUN4QztFQUNDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsa0NBQWtDLENBQUMsQ0FBQztFQUMxRDtBQUNGLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztDQUVuRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEQsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUM7O0NBRXhDLElBQUks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QyxDQUFDO0VBQzlELFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzNELEVBQUU7O0VBRUEsV0FBVyxFQUFFO0NBQ2Q7RUFDQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFO0lBQ3hELElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUM1RCxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRTs7RUFFakYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7QUFDeEYsRUFBRTs7Q0FFRCxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSb3V0ZXIgPSByZXF1aXJlKCcuL1JvdXRlcicpOyBcbnZhciBBYnN0cmFjdFZpZXcgPSByZXF1aXJlKCcuL0Fic3RyYWN0VmlldycpOyBcbi8vIEBtb2R1bGUgd3B0aW5xdWlyZXIuaHRtbCBAY2xhc3MgQXBwbGljYXRpb25cbnZhciBBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKClcbntcblx0dGhpcy50ZW1wbGF0ZXMgPSB3aW5kb3cuSlNUO1xuXG5cdGlmKGpRdWVyeSgnI21haW5Db250YWluZXInKS5zaXplKCk9PT0wKVxuXHR7XG5cdFx0alF1ZXJ5KCdib2R5JykuYXBwZW5kKCc8ZGl2IGlkPVwibWFpbkNvbnRhaW5lclwiPjwvZGl2PicpOyBcblx0fVxuXHR0aGlzLiRjb250YWluZXJFbCA9IGpRdWVyeSgnI21haW5Db250YWluZXInKTsgXG5cblxuXHRpZihqUXVlcnkoJyNtb2RhbHNDb250YWluZXInKS5zaXplKCk9PT0wKVxuXHR7XG5cdFx0alF1ZXJ5KCdib2R5JykuYXBwZW5kKCc8ZGl2IGlkPVwibW9kYWxzQ29udGFpbmVyXCI+PC9kaXY+Jyk7IFxuXHR9XG5cdHRoaXMuJG1vZGFsc0NvbnRhaW5lciA9IGpRdWVyeSgnI21vZGFsc0NvbnRhaW5lcicpO1xuXHQvLyB0aGlzLiRtb2RhbHNDb250YWluZXIgLmhpZGUoKTtcblx0dGhpcy5tb2RhbFZpZXcgPSBuZXcgQWJzdHJhY3RWaWV3KHthcHBsaWNhdGlvbjogdGhpc30pOyBcblx0dGhpcy5tb2RhbFZpZXcudGVtcGxhdGUgPSAnX21vZGFsLmh0bWwnOyBcblx0Ly8gdGhpcy5tb2RhbFZpZXcudGl0bGUgPSAnSW5mb3JtYXRpb24nOyBcblx0dGhpcy5tb2RhbFZpZXcucmVuZGVySW4odGhpcy4kbW9kYWxzQ29udGFpbmVyKTsgXG59OyBcblxuXyhBcHBsaWNhdGlvbi5wcm90b3R5cGUpLmV4dGVuZCh7XG5cblx0Ly9AbWV0aG9kIHNob3dWaWV3IEBwYXJhbSB7QWJzdHJhY3RWaWV3fSB2aWV3XG5cdHNob3dWaWV3OiBmdW5jdGlvbih2aWV3KVxuXHR7XG5cdFx0dGhpcy5jdXJyZW50VmlldyA9IHZpZXc7XG5cdFx0dGhpcy4kY29udGFpbmVyRWwuZW1wdHkoKTtcblx0XHR2aWV3LnJlbmRlckluKHRoaXMuJGNvbnRhaW5lckVsKTtcblx0fVxuXG4sXHRzaG93Vmlld0luTW9kYWw6IGZ1bmN0aW9uKHZpZXcsIG1vZGFsQ29uZmlnKVxuXHR7XG5cdFx0Ly9UT0RPOiBkZXN0cm95IGN1cnJlbnQgY2hpbGQgdmlld1xuXHRcdHRoaXMubW9kYWxWaWV3LiQoJ1tkYXRhLXR5cGU9XCJtb2RhbC1ib2R5XCJdJykuZW1wdHkoKTtcblx0XHR2YXIgdGl0bGUgPSBtb2RhbENvbmZpZy50aXRsZSB8fCAnSW5mb3JtYXRpb24nO1x0XG5cdFx0dGhpcy5tb2RhbFZpZXcuJCgnW2RhdGEtdHlwZT1cIm1vZGFsLXRpdGxlXCJdJykudGV4dCh0aXRsZSk7XG5cdFx0dmlldy5yZW5kZXJJbih0aGlzLm1vZGFsVmlldy4kKCdbZGF0YS10eXBlPVwibW9kYWwtYm9keVwiXScpKTtcblx0XHR0aGlzLm1vZGFsVmlldy4kKCcjbXlNb2RhbCcpLm1vZGFsKCdzaG93Jyk7IFxuXHR9XG59KTtcblxuQXBwbGljYXRpb24uc3RhcnQgPSBmdW5jdGlvbigpXG57XG5cdEFwcGxpY2F0aW9uLmluc3RhbmNlID0gbmV3IEFwcGxpY2F0aW9uKCk7XHRcblx0bmV3IFJvdXRlcihBcHBsaWNhdGlvbi5pbnN0YW5jZSk7XG5cdEJhY2tib25lLmhpc3Rvcnkuc3RhcnQoKTsgXG59OyBcblxuXG5qUXVlcnkoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKClcbntcdFxuXHRBcHBsaWNhdGlvbi5zdGFydCgpOyBcbn0pOyBcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsaWNhdGlvbjsiLCIvLyB2YXIgTG9hZGluZ1ZpZXcgPSByZXF1aXJlKCcuL0xvYWRpbmdWaWV3Jyk7IFxuXG4vLyBAbW9kdWxlIHdwdGlucXVpcmVyLmh0bWwgQGNsYXNzIEFic3RyYWN0VmlldyBAZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG52YXIgQWJzdHJhY3RWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpXG5cdHtcblx0XHR0aGlzLmFwcGxpY2F0aW9uID0gb3B0aW9ucy5hcHBsaWNhdGlvbjtcblx0fVxuXG5cdC8vQG1ldGhvZCByZW5kZXJJbiByZW5kZXJzIHRoaXMgdmlldyBpbiBnaXZlbiBwYXJlbnQgZWxlbWVudCBAcGFyYW0ge2pRdWVyeX0gJHBhcmVudFxuLFx0cmVuZGVySW46IGZ1bmN0aW9uKCRwYXJlbnQsIGRvbnRBZnRlclJlbmRlcilcblx0e1xuXHRcdHZhciB0ZW1wbGF0ZTtcblx0XHRpZihfKHRoaXMudGVtcGxhdGUpLmlzRnVuY3Rpb24oKSlcblx0XHR7XG5cdFx0XHR0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGU7IFxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGVtcGxhdGUgPSB0aGlzLmFwcGxpY2F0aW9uLnRlbXBsYXRlc1t0aGlzLnRlbXBsYXRlXTsgXG5cdFx0fVxuXHRcdGlmKHRlbXBsYXRlKVxuXHRcdHtcblx0XHRcdHZhciBodG1sID0gdGVtcGxhdGUuYXBwbHkodGhpcywgW10pOyBcblx0XHRcdHRoaXMuJGVsLmh0bWwoaHRtbCk7XG5cdFx0XHQkcGFyZW50LmFwcGVuZCh0aGlzLiRlbCk7IFxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coJ0ludmFsaWQgdGVtcGxhdGUsICcsIHRoaXMudGVtcGxhdGUpOyBcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5fYWZ0ZXJSZW5kZXIoKTsgXG5cdFx0aWYoIWRvbnRBZnRlclJlbmRlcilcblx0XHR7XG5cdFx0XHR0aGlzLmFmdGVyUmVuZGVyKCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbixcdGFmdGVyUmVuZGVyOiBmdW5jdGlvbigpXG5cdHtcblx0fVxuXG4sXHRfYWZ0ZXJSZW5kZXI6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBldmVudHMgPSBfKHtcblx0XHRcdCdjbGljayBbZGF0YS1oZWxwLXJlZl0nOiAnc2hvd0hlbHAnXG5cdFx0fSkuZXh0ZW5kKHRoaXMuZXZlbnRzKTsgXG5cdFx0Ly8gY29uc29sZS5sb2coZXZlbnRzKVxuXHRcdHRoaXMuZGVsZWdhdGVFdmVudHMoZXZlbnRzKTsgXG5cdH1cblxuLFx0c2hvd0hlbHA6IGZ1bmN0aW9uKGVsKVxuXHR7XG5cdFx0Ly8gZGF0YS1oZWxwLXJlZj1cInJlcG9ydENvbXBhcmVTYW1wbGVTZWxlY3Rpb25CeVwiXG5cdFx0dmFyIGhlbHBJZCA9IGpRdWVyeShlbC50YXJnZXQpLmRhdGEoJ2hlbHAtcmVmJyk7XG5cdFx0dmFyIHRpdGxlID0galF1ZXJ5KGVsLnRhcmdldCkuZGF0YSgnaGVscC10aXRsZScpIHx8ICgnSGVscCBvbiAnICsgaGVscElkKTtcblx0XHR2YXIgaGVscFZpZXcgPSBuZXcgQWJzdHJhY3RWaWV3KHthcHBsaWNhdGlvbjogdGhpcy5hcHBsaWNhdGlvbn0pOyBcblx0XHRfKGhlbHBWaWV3KS5leHRlbmQoe1xuXHRcdFx0dGVtcGxhdGU6ICdoZWxwLycraGVscElkKycuaHRtbCdcblx0XHQvLyAsXHR0aXRsZTogdGl0bGVcblx0XHR9KVxuXHRcdHRoaXMuYXBwbGljYXRpb24uc2hvd1ZpZXdJbk1vZGFsKGhlbHBWaWV3LCB7dGl0bGU6IHRpdGxlfSk7IFxuXHR9XG5cdFx0XG5cdC8vQG1ldGhvZCByZW5kZXIgaW1wbGVtZW50ZWQgdG8gY29tcGx5IHdpdGggQmFja2JvbmUgVmlldyBjb250cmFjdFx0XHRcbixcdHJlbmRlcjogZnVuY3Rpb24oZG9udEFmdGVyUmVuZGVyKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMucmVuZGVySW4oalF1ZXJ5KHRoaXMuZWwpLCBkb250QWZ0ZXJSZW5kZXIpOyBcblx0fVxuXG4sXHRyZW5kZXJIZWFkZXI6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBodG1sID0gdGhpcy5hcHBsaWNhdGlvbi50ZW1wbGF0ZXNbJ2hlYWRlci5odG1sJ10uYXBwbHkodGhpcywgW10pOyBcblx0XHR0aGlzLiRlbC5wcmVwZW5kKGh0bWwpXG5cdH1cblxuLFx0c2hvd0xvYWRpbmdTdGF0dXM6IGZ1bmN0aW9uKHBsYWNlaG9sZGVyLCBzdGF0dXMpXG5cdHtcblx0XHRpZihzdGF0dXMpXG5cdFx0e1xuXHRcdFx0dmFyIGxvYWRpbmdWaWV3ID0gbmV3IEFic3RyYWN0Vmlldyh7YXBwbGljYXRpb246IHRoaXMuYXBwbGljYXRpb259KTtcblx0XHRcdGxvYWRpbmdWaWV3LnRlbXBsYXRlID0gJ2xvYWRpbmcuaHRtbCc7IFxuXHRcdFx0bG9hZGluZ1ZpZXcucmVuZGVySW4odGhpcy4kKHBsYWNlaG9sZGVyKSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLiQocGxhY2Vob2xkZXIpLmVtcHR5KCk7XG5cdFx0fVxuXHR9XG59KTsgXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RWaWV3OyAiLCIvLyBJTVBPUlRBTlQgdGhpcyBjb2RlIG11c3Qgc3VwcG9ydCB0byBiZSBleGVjdXRlZCBpbiBub2RlICEhIVxuXG4vLyBAbW9kdWxlIHdwdGlucXVpcmVyLmh0bWwgXG4vLyBAY2xhc3MgRGF0YUV4dHJhY3RvciByZXNwb25zaWJsZSBvZiBleHRyYWN0aW5nIHJlbGV2YW50L2ludGVyZXN0aW5nIG51bWJlcnMgZnJvbSB0ZXN0IGRhdGEuIFxuLy8gQSBkYXRhRXh0cmFjdG9yIGlzIGFzc29jaWF0ZWQgd2l0aCBleGFjdGx5IE9ORSB0ZXN0IGRlZmluaXRpb24gYW5kIHVzZXIgbXVzdCBwYXNzIGl0cyBkYXRhIGluIHRoZSBjb25zdHJ1Y3Rvci5cblxuLy9UT0RPLiB3aGVuIGRpc2NyZXRpemF0aW9uIHB1dCBhbGwgaGFyZGNvZGVkIDEwMG1zIGluIGEgY29uZmlnIHByb3BcblxuXG4vLyBAY29uc3RydWN0b3IgQHBhcmFtIHtPYmplY3R9IHRlc3REYXRhIHRoZSBqc29uIG9iamVjdCBvZiBhIHRlc3QncyBkYXRhLmpzb24gd2l0aCBubyBtb2RpZmljYXRpb25zXG52YXIgRGF0YUV4dHJhY3RvciA9IGZ1bmN0aW9uKHRlc3REYXRhLCBjb25maWcpXG57XG5cdHRoaXMuZGF0YSA9IHRlc3REYXRhO1xuXHR0aGlzLmNvbmZpZyA9IHtcblx0XHQvL0Bwcm9wZXJ0eSB7U3RyaW5nfSBjb25maWcubXVsdGlwbGVUZXN0Q2hvb3NlU3RyYXRlZ3kgY2FuIGJlICdtZWRpYScsICdhbGwnXG5cdFx0bXVsdGlwbGVUZXN0Q2hvb3NlU3RyYXRlZ3k6ICdhbGwnXG5cdFx0Ly8gQHByb3BlcnR5IHtCb29sZWFufSBmaXJzdFZpZXcgZnJvbSB3aGVyZSBkbyBJIGV4dHJhY3QgdGhlIG51bWJlcnMgZnJvbSAgdGhlIGZpcnN0IHZpZXcgb3IgdGhlIHJlcGVhdCB2aWV3ID8gXG5cdCxcdGZpcnN0VmlldzogdHJ1ZVxuXG5cdCxcdHZpc3VhbGx5Q29tcGxldGVOb25aZXJvVGhyZWVzaG9sZDogMVxuXHQsXHR2aXN1YWxseUNvbXBsZXRlMTAwVGhyZWVzaG9sZDogMTAwXG5cblx0fTsgXG5cblx0Xyh0aGlzLmNvbmZpZykuZXh0ZW5kKGNvbmZpZ3x8e30pOyBcblxuXHR0aGlzLnZpZGVvRnJhbWVzID0ge3NhbXBsZXM6W119O1xufTsgXG5cbl8oRGF0YUV4dHJhY3Rvci5wcm90b3R5cGUpLmV4dGVuZCh7XG5cblx0Ly8gQG1ldGhvZCBpdGVyYXRlU2FtcGxlcyBhbHdheXMgdXNlIHRoaXMgbWV0aG9kIHRvIGl0ZXJhdGUgYWxsIHRlZXN0IGRlZmluaXRpb24gc2FtcGxlcy4gXG5cdC8vIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG5cdGl0ZXJhdGVTYW1wbGVzOiBmdW5jdGlvbihpdGVyYXRvcilcblx0e1xuXHRcdHZhciBzZWxmID0gdGhpcywgcnVuQ291bnQ9MCwgdGVzdENvdW50PTA7XG5cdFx0Xyh0aGlzLmRhdGEudGVzdFJlc3VsdHMpLmVhY2goZnVuY3Rpb24ocmVzdWx0KVxuXHRcdHt0ZXN0Q291bnQrKztcblx0XHRcdHJ1bkNvdW50PTA7XG5cdFx0XHRpZihfKHJlc3VsdC5ydW5zKS5rZXlzKCkubGVuZ3RoID4gMSlcblx0XHRcdHtydW5Db3VudCsrO1xuXHRcdFx0XHRpZihzZWxmLmNvbmZpZy5tdWx0aXBsZVRlc3RDaG9vc2VTdHJhdGVneSA9PT0gJ21lZGlhJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vbWVhbnMgOiBjaG9vc2UgdGhlIHdlYnBhZ2V0ZXN0IG1lZGlhIHNhbXBsZSAobWVkaWEgdyByZXNwZWN0IHRvKVxuXHRcdFx0XHRcdHRocm93ICdUT0RPJztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmKHNlbGYuY29uZmlnLm11bHRpcGxlVGVzdENob29zZVN0cmF0ZWd5ID09PSAnYWxsJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF8ocmVzdWx0LnJ1bnMpLmVhY2goZnVuY3Rpb24ocnVuLCBydW5LZXkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFyIHZpZXdOYW1lID0gc2VsZi5jb25maWcuZmlyc3RWaWV3ID8gJ2ZpcnN0VmlldycgOiAncmVwZWF0Vmlldyc7XG5cdFx0XHRcdFx0XHR2YXIgc2FtcGxlID0gcnVuW3ZpZXdOYW1lXTsgXG5cdFx0XHRcdFx0XHRpZighc2FtcGxlKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzYW1wbGUgPSBydW4uZmlyc3RWaWV3OyBcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmKCFzYW1wbGUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdXQVJOSU5HLCBpZ25vcmluZyBlbXB0eSAnK3ZpZXdOYW1lKycgaW4gcnVuICMnK3J1bkNvdW50KycgaW4gdGVzdCAjJyt0ZXN0Q291bnQrJyBpbiB0ZXN0SWQ9JytzZWxmLmRhdGEudGVzdERlZmluaXRpb24udGVzdElkKTsgXG5cdFx0XHRcdFx0XHRcdC8vIGRlYnVnZ2VyO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzYW1wbGUudGVzdElkID0gcmVzdWx0LmlkO1xuXHRcdFx0XHRcdFx0aXRlcmF0b3Ioc2FtcGxlLCByZXN1bHQuaWQsIHJ1bktleSk7IFxuXHRcdFx0XHRcdH0pOyBcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyAnVE9ETyc7IFxuXHRcdFx0fVxuXHRcdH0pOyBcblx0fVxuIFxuXHQvL0BtZXRob2QgZXh0cmFjdFNpbmdsZU51bWJlciBcblx0Ly8gQHBhcmFtIHtTdHJpbmd9bWVhc3VyZU5hbWUgQHBhcmFtIHtTdHJpbmd9IHR5cGUgY2FuIGJlICdhdmVyYWdlJywgJ21lZGlhbicgXG5cdC8vIEByZXR1cm4gTnVtYmVyIHRoZSBhdmVyYWdlIG9yIG1lZGlhbiBudW1iZXIgb2YgY2FsbGluZyBleHRyYWN0TnVtYmVycygpIHdpdGggZ2l2ZW4gbWVhc3VyZW1lbnQgdHlwZS5cbixcdGV4dHJhY3RTaW5nbGVOdW1iZXI6IGZ1bmN0aW9uKG1lYXN1cmVOYW1lLCB0eXBlKVxuXHR7XG5cdFx0dHlwZSA9IHR5cGUgfHwgdGhpcy5jb25maWcuc2FtcGxlU2VsZWN0aW9uQnkgfHwgJ2F2ZXJhZ2UnOyBcblx0XHR2YXIgbnVtYmVycyA9IHRoaXMuZXh0cmFjdE51bWJlcnMobWVhc3VyZU5hbWUpO1xuXG5cdFx0bnVtYmVycyA9IHRoaXMucmVtb3ZlT3V0bGllcnMobnVtYmVycyk7IFxuXG5cdFx0aWYodHlwZT09PSdhdmVyYWdlJylcblx0XHR7XG5cdFx0XHR2YXIgYXZlcmFnZSA9IDA7XG5cdFx0XHRfKG51bWJlcnMpLmVhY2goZnVuY3Rpb24obnVtYmVyKVxuXHRcdFx0e1xuXHRcdFx0XHRhdmVyYWdlICs9IG51bWJlci52YWx1ZTtcblx0XHRcdH0pOyBcblx0XHRcdHJldHVybiBhdmVyYWdlIC8gXyhudW1iZXJzKS5rZXlzKCkubGVuZ3RoOyBcblx0XHR9XG5cdFx0ZWxzZSBpZih0eXBlID09PSAnbWVkaWFuJylcblx0XHR7XG5cdFx0XHR2YXIgbWVkaWFuU2FtcGxlID0gdGhpcy5nZXRNZWRpYW5TYW1wbGUobWVhc3VyZU5hbWUpLnNhbXBsZTtcblx0XHRcdHJldHVybiB0aGlzLnNhbXBsZUV4dHJhY3RNZWFzdXJlKG1lZGlhblNhbXBsZSwgbWVhc3VyZU5hbWUpOyBcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRocm93ICdUT0RPJztcblx0XHR9XG5cdH1cblxuLFx0cmVtb3ZlT3V0bGllcnM6IGZ1bmN0aW9uKG51bWJlcnMpXG5cdHtcblx0XHRpZighdGhpcy5jb25maWcucmVtb3ZlT3V0bGllcnMpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG51bWJlcnM7XG5cdFx0fVxuXG5cdFx0dmFyIHZhbHVlcyA9IF8ubWFwKG51bWJlcnMsIGZ1bmN0aW9uKG8pe3JldHVybiBvLnZhbHVlfSk7XG5cdFx0dmFsdWVzLnNvcnQoZnVuY3Rpb24oYSwgYil7cmV0dXJuIGE8Yj8tMToxfSlcblx0XHQvLyB2YXIgY3V0ID0gbnVtYmVycy5sZW5ndGg+OSA/IDAuMSA6IDAuMlxuXHRcdHZhciBob3dNYW55ID0gTWF0aC5yb3VuZChwYXJzZUludCh2YWx1ZXMubGVuZ3RoKjAuMSkpIHx8IDFcblx0XHQvLyBjb25zb2xlLmxvZygnQkVGT1JFJywgaG93TWFueSwgdmFsdWVzLmxlbmd0aCwgdmFsdWVzKVxuXHRcdHZhbHVlcy5zcGxpY2UodmFsdWVzLmxlbmd0aC1ob3dNYW55LCBob3dNYW55KVxuXHRcdC8vIHZhbHVlcy5zcGxpY2UoMywgMylcblx0XHQvLyBjb25zb2xlLmxvZygnQUZURVInLCB2YWx1ZXMubGVuZ3RoLCB2YWx1ZXMpXG5cblx0XHR2YXIgY2hvb3NlbiA9IHZhbHVlc1t2YWx1ZXMubGVuZ3RoLTFdXG5cblx0XHR2YXIgcmVzdWx0ID0gbnVtYmVycy5maWx0ZXIoZnVuY3Rpb24obyl7cmV0dXJuIG8udmFsdWUgPT0gY2hvb3Nlbn0pXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0XHQvLyB2YXIgb3V0cHV0ID0gdmFsdWVzLmZpbHRlcihmdW5jdGlvbih2YWwpKVxuXHRcdC8vIGNvbnNvbGUubG9nKHZhbHVlcylcblx0XHQvLyBpZighdGhpcy5jb25maWcucmVtb3ZlT3V0bGllcnMpXG5cdFx0Ly8ge1xuXHRcdC8vIFx0cmV0dXJuIG51bWJlcnM7XG5cdFx0Ly8gfVxuXHRcdC8vIHZhciBzdW0gPSAwOyAgICAgLy8gc3RvcmVzIHN1bSBvZiBlbGVtZW50c1xuXHRcdC8vIHZhciBzdW1zcSA9IDA7IC8vIHN0b3JlcyBzdW0gb2Ygc3F1YXJlc1xuXHRcdC8vIHZhciBsID0gbnVtYmVycy5sZW5ndGg7XG5cdFx0Ly8gZm9yKHZhciBpPTA7IGk8bnVtYmVycy5sZW5ndGg7ICsraSkgXG5cdFx0Ly8ge1xuXHRcdC8vIFx0c3VtICs9IG51bWJlcnNbaV0udmFsdWU7XG5cdFx0Ly8gXHRzdW1zcSArPSBudW1iZXJzW2ldLnZhbHVlKm51bWJlcnNbaV0udmFsdWU7XG5cdFx0Ly8gfVxuXHRcdC8vIHZhciBtZWFuID0gc3VtL2w7IFxuXHRcdC8vIHZhciB2YXJpZW5jZSA9IHN1bXNxIC8gbCAtIG1lYW4qbWVhbjtcblx0XHQvLyB2YXIgc2QgPSBNYXRoLnNxcnQodmFyaWVuY2UpO1xuXHRcdC8vIHZhciBudW1iZXJzT3V0cHV0ID0gW107IC8vIHVzZXMgZm9yIGRhdGEgd2hpY2ggaXMgMyBzdGFuZGFyZCBkZXZpYXRpb25zIGZyb20gdGhlIG1lYW5cblx0XHQvLyBmb3IodmFyIGk9MDsgaTxudW1iZXJzLmxlbmd0aDsgKytpKSBcblx0XHQvLyB7XG5cdFx0Ly8gXHRpZihudW1iZXJzW2ldLnZhbHVlID4gbWVhbiAtIDMgKnNkICYmIG51bWJlcnNbaV0udmFsdWUgPCBtZWFuICsgMyAqc2QpXG5cdFx0Ly8gXHR7XHRcdFx0XHRcdFxuXHRcdC8vIFx0XHRudW1iZXJzT3V0cHV0LnB1c2gobnVtYmVyc1tpXSk7XHRcblx0XHQvLyBcdH1cblx0XHQvLyB9XG5cdFx0Ly8gcmV0dXJuIG51bWJlcnNPdXRwdXQ7IFxuXHR9XG5cblx0Ly9AbWV0aG9kIHNhbXBsZUV4dHJhY3RNZWFzdXJlIEByZXR1cm4ge051bWJlcn1cbixcdHNhbXBsZUV4dHJhY3RNZWFzdXJlOiBmdW5jdGlvbihzYW1wbGUsIG1lYXN1cmVOYW1lKVxuXHR7XG5cdFx0dmFyIHNlbGYgPSB0aGlzLCB2YWw7XG5cblx0XHRpZih0eXBlb2Yoc2FtcGxlW21lYXN1cmVOYW1lXSkhPT0ndW5kZWZpbmVkJylcblx0XHR7XG5cdFx0XHRyZXR1cm4gc2FtcGxlW21lYXN1cmVOYW1lXTsgXG5cdFx0fVxuXHRcdGVsc2UgaWYobWVhc3VyZU5hbWUgPT09ICdWaXN1YWxseUNvbXBsZXRlTm9uWmVybycpXG5cdFx0e1xuXHRcdFx0dmFsID0gc2VsZi5nZXRWaXN1YWxseUNvbXBsZXRlTm9uWmVyb051bWJlcnMoc2FtcGxlKTtcblx0XHRcdHJldHVybiB2YWwudmFsdWU7XG5cdFx0XHQvLyBkZWJ1Z2dlcjtcblx0XHR9XG5cdFx0ZWxzZSBpZihtZWFzdXJlTmFtZSA9PT0gJ1Zpc3VhbGx5Q29tcGxldGUxMDAnKVxuXHRcdHtcblx0XHRcdHZhbCA9IHNlbGYuZ2V0VmlzdWFsbHlDb21wbGV0ZTEwME51bWJlcnMoc2FtcGxlKTtcblx0XHRcdHJldHVybiB2YWwudmFsdWU7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZygnc2FtcGxlRXh0cmFjdE1lYXN1cmUgdW5rbm93biBtZWFzdXJlIG5hbWUgJyArIG1lYXN1cmVOYW1lKTsgXG5cdFx0fVxuXHR9XG5cblx0Ly8gQG1ldGhvZCBleHRyYWN0TnVtYmVycyBcblx0Ly8gQHBhcmFtIHtTdHJpbmd9bWVhc3VyZU5hbWVcblx0Ly8gQHJldHVybiB7QXJyYXl9XG4sXHRleHRyYWN0TnVtYmVyczogZnVuY3Rpb24obWVhc3VyZU5hbWUpXG5cdHtcdFxuXHRcdC8vVE9ETzogY2FjaGVcblx0XHR2YXIgc2VsZiA9IHRoaXMsIG51bWJlcnMgPSBbXSwgbnVtYmVyO1xuXHRcdHNlbGYuaXRlcmF0ZVNhbXBsZXMoZnVuY3Rpb24oc2FtcGxlLCB0ZXN0SWQsIHJ1bktleSlcblx0XHR7XG5cdFx0XHRpZihtZWFzdXJlTmFtZSA9PT0gJ2xhc3RWaXN1YWxDaGFuZ2UnIHx8IG1lYXN1cmVOYW1lID09PSAnZnVsbHlMb2FkZWQnIHx8XG5cdFx0XHRcdG1lYXN1cmVOYW1lID09PSAnU3BlZWRJbmRleCcpXG5cdFx0XHR7XG5cdFx0XHRcdG51bWJlcnMucHVzaCh7dGVzdElkOiB0ZXN0SWQsIHNhbXBsZTogc2FtcGxlLCBydW5JbmRleDogcnVuS2V5XG5cdFx0XHRcdFx0LCB2YWx1ZTogc2VsZi5zYW1wbGVFeHRyYWN0TWVhc3VyZShzYW1wbGUsIG1lYXN1cmVOYW1lKX0pOyBcblx0XHRcdH1cblx0XHRcdC8vVE9ETzogZGVsZXRlIHRoZSBmb2xsb3dpbmcgcmVwZWF0ZWQgY29kZSBhbmQgdXNlIHRoaXMuc2FtcGxlRXh0cmFjdE1lYXN1cmUoKVxuXHRcdFx0ZWxzZSBpZihtZWFzdXJlTmFtZSA9PT0gJ1Zpc3VhbGx5Q29tcGxldGVOb25aZXJvJylcblx0XHRcdHtcblx0XHRcdFx0bnVtYmVyID0gXyh7dGVzdElkOiB0ZXN0SWQsIHNhbXBsZTogc2FtcGxlLCBydW5JbmRleDogcnVuS2V5fSkuZXh0ZW5kKHNlbGYuZ2V0VmlzdWFsbHlDb21wbGV0ZU5vblplcm9OdW1iZXJzKHNhbXBsZSkpO1xuXHRcdFx0XHRudW1iZXJzLnB1c2gobnVtYmVyKTsgXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmKG1lYXN1cmVOYW1lID09PSAnVmlzdWFsbHlDb21wbGV0ZTEwMCcpXG5cdFx0XHR7XG5cdFx0XHRcdG51bWJlciA9IF8oe3Rlc3RJZDogdGVzdElkLCBzYW1wbGU6IHNhbXBsZSwgcnVuSW5kZXg6IHJ1bktleX0pLmV4dGVuZChzZWxmLmdldFZpc3VhbGx5Q29tcGxldGUxMDBOdW1iZXJzKHNhbXBsZSkpO1xuXHRcdFx0XHRudW1iZXJzLnB1c2gobnVtYmVyKTsgXG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdlcnJvciBubyBtZWFzdXJlIHR5cGUgZGVmaW5lZDogJyArIG1lYXN1cmVOYW1lKTsgXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG51bWJlcnM7XG5cdH1cblxuXG5cdC8vQG1ldGhvZCBnZXRGaXJzdFBhaW50VGltZSBAcGFyYW0ge09iamVjdH0gc2FtcGxlIHRoZSBkYXRhLmpzb24gXG4sXHRnZXRWaXN1YWxseUNvbXBsZXRlTm9uWmVyb051bWJlcnM6IGZ1bmN0aW9uKHNhbXBsZSlcblx0e1xuXHRcdHZhciBzZWxmID0gdGhpc1xuXHRcdCxcdGNvbXBhcmVBZ2FpbnN0ID0gc2VsZi5jb25maWcudmlzdWFsbHlDb21wbGV0ZU5vblplcm9UaHJlZXNob2xkIHx8IDA7XG5cdFx0aWYoIXNhbXBsZS52aWRlb0ZyYW1lcylcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZygnV0FSTklORywgc2FtcGxlIHdpdGhvdXQgdmlkZW9GcmFtZXMgZm91bmQhJyk7cmV0dXJuO1xuXHRcdH1cblx0XHR2YXIgZnJhbWUgPSBfKHNhbXBsZS52aWRlb0ZyYW1lcykuZmluZChmdW5jdGlvbihmKVxuXHRcdHtcblx0XHRcdHJldHVybiBmLlZpc3VhbGx5Q29tcGxldGUgPiBjb21wYXJlQWdhaW5zdDsgXG5cdFx0fSk7IFxuXHRcdGlmKCFmcmFtZSlcblx0XHR7XG5cdFx0XHRmcmFtZSA9IHNhbXBsZS52aWRlb0ZyYW1lc1swXTtcblx0XHR9XG5cdFx0cmV0dXJuIF8oe3ZhbHVlOmZyYW1lLnRpbWV9KS5leHRlbmQoZnJhbWUpOy8ve3ZhbHVlOmZyYW1lLnRpbWV9O1xuXHR9XG5cblx0Ly9AbWV0aG9kIGdldFZpc3VhbGx5Q29tcGxldGUxMDBOdW1iZXJzIEBwYXJhbSB7T2JqZWN0fSBzYW1wbGUgdGhlIGRhdGEuanNvbiBcbixcdGdldFZpc3VhbGx5Q29tcGxldGUxMDBOdW1iZXJzOiBmdW5jdGlvbihzYW1wbGUpXG5cdHtcblx0XHR2YXIgc2VsZiA9IHRoaXNcblx0XHQsXHRjb21wYXJlQWdhaW5zdCA9IHNlbGYuY29uZmlnLnZpc3VhbGx5Q29tcGxldGUxMDBUaHJlZXNob2xkIHx8IDEwMFxuXHRcdCwgZnJhbWUgPSBfKHNhbXBsZS52aWRlb0ZyYW1lcykuZmluZChmdW5jdGlvbihmKVxuXHRcdHtcblx0XHRcdHJldHVybiBmLlZpc3VhbGx5Q29tcGxldGUgPj0gY29tcGFyZUFnYWluc3Q7IFxuXHRcdH0pOyBcblx0XHRpZighc2FtcGxlLnZpZGVvRnJhbWVzKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKCdXQVJOSU5HLCBzYW1wbGUgd2l0aG91dCB2aWRlb0ZyYW1lcyBmb3VuZCEnKTtyZXR1cm47XG5cdFx0fVxuXHRcdHJldHVybiBfKHt2YWx1ZTpmcmFtZS50aW1lfSkuZXh0ZW5kKGZyYW1lKTtcblx0fVxuXG5cblx0Ly8gdmlzdWFsIHByb2dyZXNzIGF2ZXJhZ2VzIDogaXQncyBub3QgdHJpdmlhbC4gd2hhdCB3ZSBkbyBmb3IgY29tcGFyaW5nIGlzOiBcblx0Ly8gMSkgc2hvdyB0d28gbGluZXMgaW4gdGltZSB3aXRoIG5vIHRyYW5zZm9ybWF0aW9uc1xuXHQvLyAyKSB0aGUgbGluZSBzaG93biBpcyB0aGUgbWVkaWFuJ3MgYWNjb3JkaW5nIHRvIGEgbWVhc3VyZSB0eXBlXG5cdC8vIDMpIHdlIGRyYXcgc2V2ZXJhbCBjaGFydHMgdGFraW5nIHRoZSBtZWRpYW4gb24gZGlmZmVyZW50IG1lYXN1cmUgdHlwZXNcblxuXHQvLyBAbWV0aG9kIGdldE1lZGlhblNhbXBsZSBAcGFyYW0ge1N0cmluZ31tZWFzdXJlTmFtZSBtZWRpYW4gd2l0aCByZXNwZWN0IHRvIHdoYXQgbnVtYmVyID8gXG5cdC8vIEByZXR1cm4ge3NhbXBsZTpOdW1iZXIsdGVzdElkOlN0cmluZ30gdGhlIG1lZGlhbiBzYW1wbGUgb2YgYWxsIHRoZSBkYXRhXG4sXHRnZXRNZWRpYW5TYW1wbGU6IGZ1bmN0aW9uKG1lYXN1cmVOYW1lLCBwYXJ0SW4pXG5cdHtcblx0XHRwYXJ0SW4gPSBwYXJ0SW4gfHwgMC41O1xuXHRcdHZhciBkaXZpZGVyID0gMSAvIHBhcnRJbiwgc2VsZiA9IHRoaXNcblx0XHQsXHRzYW1wbGVzID0gW107XG5cdFx0c2VsZi5pdGVyYXRlU2FtcGxlcyhmdW5jdGlvbihzYW1wbGUsIHRlc3RJZCwgcnVuS2V5KVxuXHRcdHtcblx0XHRcdHNhbXBsZXMucHVzaCh7c2FtcGxlOnNhbXBsZSx0ZXN0SWQ6IHRlc3RJZCwgcnVuSW5kZXg6IHJ1bktleX0pOyBcblx0XHR9KTtcblxuXHRcdHNhbXBsZXMuc29ydChmdW5jdGlvbihzMSwgczIpXG5cdFx0e1xuXHRcdFx0dmFyIHMxVmFsID0gc2VsZi5zYW1wbGVFeHRyYWN0TWVhc3VyZShzMS5zYW1wbGUsIG1lYXN1cmVOYW1lKVxuXHRcdFx0LFx0czJWYWwgPSBzZWxmLnNhbXBsZUV4dHJhY3RNZWFzdXJlKHMyLnNhbXBsZSwgbWVhc3VyZU5hbWUpOyBcblx0XHRcdHJldHVybiBzMVZhbCAtIHMyVmFsO1xuXHRcdH0pOyBcblxuXG5cdFx0dmFyIGRpdmlkZUluZGV4ID0gTWF0aC5mbG9vcihzYW1wbGVzLmxlbmd0aC9kaXZpZGVyKTsgXG5cdFx0dmFyIG1lZGlhblNhbXBsZSA9IHNhbXBsZXNbZGl2aWRlSW5kZXhdOyBcblx0XHRyZXR1cm4gbWVkaWFuU2FtcGxlO1xuXHR9XG5cblx0Ly8gQG1ldGhvZCBnZXRWaWRlb0ZyYW1lTnVtYmVycyBAcGFyYW0ge1N0cmluZ30gbWVhc3VyZU5hbWUgXG5cdC8vIEByZXR1cm4ge3RpbWU6TnVtYmVyLGZyYW1lOk9iamVjdCxzYW1wbGVEYXRhOk9iamVjdH1cbixcdGdldFZpZGVvRnJhbWVOdW1iZXJzOiBmdW5jdGlvbihtZWFzdXJlTmFtZSlcblx0e1xuXHRcdHZhciBzYW1wbGVEYXRhID0gdGhpcy5nZXRNZWRpYW5TYW1wbGUobWVhc3VyZU5hbWUpXG5cdFx0LFx0c2FtcGxlID0gc2FtcGxlRGF0YS5zYW1wbGVcblx0XHQsXHRudW1iZXJzID0gRGF0YUV4dHJhY3Rvci5wb2JsYXRlVmlkZW9GcmFtZXMoc2FtcGxlKVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG51bWJlcnM6IG51bWJlcnNcblx0XHRcdCwgc2FtcGxlRGF0YTogc2FtcGxlRGF0YVxuXHRcdH07XG5cdH1cblxufSk7IFxuXG5cbi8vIHN0YXRpY3Ncbl8oRGF0YUV4dHJhY3RvcikuZXh0ZW5kKHtcblxuXHQvLyBAbWV0aG9kIHBvYmxhdGVWaWRlb0ZyYW1lcyBnaXZlbiBhIHNhbXBsZSBpdCB3aWxsIHJldHVybiB0aGUgZXF1aXZhbGVudCB2aWRlb0ZyYW1lcyBhcnJheSBidXQgZmlsbGluZyB3aXRoIG1pc3NpbmcgZGlzY3JldGUgdGltZXMuIEJ5IGRlZmF1bHQgZWFjaCBmcmFtZSBpcyAxMDBtcy4gXG5cdC8vIEBzdGF0aWMgQHBhcmFtIHNhbXBsZSBAcmV0dXJuIHtBcnJheTxOdW1iZXI+fVxuXHRwb2JsYXRlVmlkZW9GcmFtZXM6IGZ1bmN0aW9uKHNhbXBsZSlcblx0e1xuXHRcdHZhciBtYXhUaW1lID0gRGF0YUV4dHJhY3Rvci5nZXRNYXhWaWRlb0ZyYW1lVGltZShzYW1wbGUpXG5cdFx0LFx0bnVtYmVycyA9IFtdXG5cdFx0LFx0Y3VycmVudEZyYW1lSW5kZXggPSAwXG5cdFx0LCAgIHQgPSAwO1xuXG5cdFx0Zm9yICh0ID0gMDsgdCA8PSBtYXhUaW1lOyB0ICs9IDEwMCkgXG5cdFx0e1xuXHRcdFx0aWYoc2FtcGxlLnZpZGVvRnJhbWVzW2N1cnJlbnRGcmFtZUluZGV4KzFdLnRpbWUgPCB0KVxuXHRcdFx0e1xuXHRcdFx0XHRjdXJyZW50RnJhbWVJbmRleCsrO1xuXHRcdFx0XHRpZihjdXJyZW50RnJhbWVJbmRleCA+PSBzYW1wbGUudmlkZW9GcmFtZXMubGVuZ3RoIC0gMSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRudW1iZXJzLnB1c2goe1xuXHRcdFx0XHR0aW1lOiB0XG5cdFx0XHQsXHRmcmFtZTogc2FtcGxlLnZpZGVvRnJhbWVzW2N1cnJlbnRGcmFtZUluZGV4XVxuXHRcdFx0fSk7IFxuXHRcdH1cblx0XHQvL2FkZCB0aGUgbGFzdCBvbmVcblx0XHRudW1iZXJzLnB1c2goe1xuXHRcdFx0dGltZTogdFxuXHRcdCxcdGZyYW1lOiBzYW1wbGUudmlkZW9GcmFtZXNbc2FtcGxlLnZpZGVvRnJhbWVzLmxlbmd0aC0xXVxuXHRcdH0pOyBcblx0XHRyZXR1cm4gbnVtYmVyczsgXG5cdH1cblxuXHQvLyBAbWV0aG9kIGdldE1heFZpZGVvRnJhbWVUaW1lIEBzdGF0aWMgQHBhcmFtIHNhbXBsZSBAcmV0dXJuIHtOdW1iZXJ9XG4sXHRnZXRNYXhWaWRlb0ZyYW1lVGltZTogZnVuY3Rpb24oc2FtcGxlKVxuXHR7XG5cdFx0Ly9UT0RPOiBjYWNoZVxuXHRcdHZhciBtYXhUaW1lID0gMDtcblx0XHRfKHNhbXBsZS52aWRlb0ZyYW1lcykuZWFjaChmdW5jdGlvbihmcmFtZSlcblx0XHR7XG5cdFx0XHRpZihmcmFtZS50aW1lID4gbWF4VGltZSlcblx0XHRcdHtcblx0XHRcdFx0bWF4VGltZSA9IGZyYW1lLnRpbWU7IFxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBtYXhUaW1lOyBcblx0fVxuXG4sXHRnZXRNYXg6IGZ1bmN0aW9uKG51bWJlcnMpXG5cdHtcblx0XHQvL1RPRE86IGNhY2hlXG5cdFx0dmFyIG1heFRpbWUgPSAwO1xuXHRcdF8obnVtYmVycykuZWFjaChmdW5jdGlvbihuKVxuXHRcdHtcblx0XHRcdGlmKG4gPiBtYXhUaW1lKVxuXHRcdFx0e1xuXHRcdFx0XHRtYXhUaW1lID0gbjsgXG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG1heFRpbWU7IFxuXHR9XG5cbixcdGdldFN0YW5kYXJEZXZpYXRpb246IGZ1bmN0aW9uKG51bWJlcnMpXG5cdHtcblx0XHR2YXJcdG1heFRpbWUgPSBEYXRhRXh0cmFjdG9yLmdldE1heChudW1iZXJzKVxuXHRcdCxcdG91dCA9IHt9OyBcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4VGltZTsgaSArPSAxMDApIFxuXHRcdHtcblx0XHRcdGlmKG91dFtpXSA9PT0gdW5kZWZpbmVkKVxuXHRcdFx0e1xuXHRcdFx0XHRvdXRbaV0gPSBbXTsgXG5cdFx0XHR9XG5cdFx0XHRfKG51bWJlcnMpLmVhY2goZnVuY3Rpb24obilcblx0XHRcdHtcblx0XHRcdFx0aWYobj49aSAmJiBuPGkrMTAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0b3V0W2ldLnB1c2gobik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb3V0O1xuXHR9XG59KTsgXG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YUV4dHJhY3RvcjsiLCIvLyBAbW9kdWxlIHdwdGlucXVpcmVyLmh0bWwgQGNsYXNzIEFwcGxpY2F0aW9uIEBleHRlbmRzIEFic3RyYWN0Vmlld1xudmFyIEFic3RyYWN0VmlldyA9IHJlcXVpcmUoJy4vQWJzdHJhY3RWaWV3Jyk7XG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbCcpXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RWaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICdob21lLmh0bWwnXG5cbixcdGV2ZW50czoge1xuXHRcdCdjbGljayBbZGF0YS1hY3Rpb249XCJyZXBvcnRcIl0nOiAncmVwb3J0J1xuXHQsXHQnY2xpY2sgW2RhdGEtYWN0aW9uPVwicmVwb3J0LWNvbXBhcmVcIl0nOiAncmVwb3J0Q29tcGFyZSdcblx0LFx0J2NsaWNrIFtkYXRhLWFjdGlvbj1cInJlcG9ydC12aXN1YWxQcm9ncmVzc0NvbXBhcmVcIl0nOiAncmVwb3J0VmlzdWFsUHJvZ3Jlc3NDb21wYXJlJ1xuXHR9XG5cbixcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpXG5cdHtcblx0XHR0aGlzLmFwcGxpY2F0aW9uID0gb3B0aW9ucy5hcHBsaWNhdGlvbjtcblx0fVxuXG4sXHRhZnRlclJlbmRlcjogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIHNlbGYgPSB0aGlzOyBcblxuXHRcdHRoaXMucmVuZGVySGVhZGVyKCk7XG5cdFx0dGhpcy5zaG93TG9hZGluZ1N0YXR1cygnW2RhdGEtdHlwZT1cImxvYWRpbmctc3Bpbm5lclwiXScsIHRydWUpOyBcblxuXHRcdFV0aWwuZ2V0VGVzdHNNZXRhZGF0YSgpLmRvbmUoZnVuY3Rpb24obWV0YWRhdGEpXG5cdFx0e1x0XG5cdFx0XHRzZWxmLm1ldGFkYXRhID0gbWV0YWRhdGE7IFxuXG5cdFx0XHRzZWxmLnNob3dMb2FkaW5nU3RhdHVzKCdbZGF0YS10eXBlPVwibG9hZGluZy1zcGlubmVyXCJdJywgZmFsc2UpOyBcblx0XHRcdHNlbGYucmVuZGVyKHRydWUpO1xuXHRcdFx0c2VsZi5yZW5kZXJIZWFkZXIoKTtcblx0XHR9KTsgXG5cblx0fVxuXG4sXHRyZXBvcnQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciB0ZXN0cyA9IHRoaXMuZ2V0U2VsZWN0ZWRUZXN0cygpO1xuXHRcdGlmKCF0ZXN0c3x8IXRlc3RzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRyZXR1cm47XG5cdFx0fTsgXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgncmVwb3J0LycgKyB0ZXN0c1swXSwge3RyaWdnZXI6dHJ1ZX0pO1xuXHR9XG5cbixcdHJlcG9ydENvbXBhcmU6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciB0ZXN0cyA9IHRoaXMuZ2V0U2VsZWN0ZWRUZXN0cygpO1xuXHRcdGlmKCF0ZXN0c3x8IXRlc3RzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRyZXR1cm47XG5cdFx0fTsgXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSgncmVwb3J0Q29tcGFyZS8nICsgdGVzdHMuam9pbignLCcpLCB7dHJpZ2dlcjp0cnVlfSk7XG5cdH1cblxuLFx0cmVwb3J0VmlzdWFsUHJvZ3Jlc3NDb21wYXJlOiBmdW5jdGlvbigpXG5cdHtcblx0XHR2YXIgdGVzdHMgPSB0aGlzLmdldFNlbGVjdGVkVGVzdHMoKTtcblx0XHRpZighdGVzdHN8fCF0ZXN0cy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0cmV0dXJuO1xuXHRcdH07IFxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoJ3Zpc3VhbFByb2dyZXNzQ29tcGFyZS8nICsgdGVzdHMuam9pbignLCcpLCB7dHJpZ2dlcjp0cnVlfSk7XG5cdH1cblxuLFx0Z2V0U2VsZWN0ZWRUZXN0czogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIHRlc3RzID0gW107XG5cdFx0dmFyIGNoZWNrZWQgPSB0aGlzLiQoJy5yZXBvcnQtc2VsZWN0aW9uOmNoZWNrZWQnKTsgXG5cdFx0aWYoIWNoZWNrZWQuc2l6ZSgpKSBcblx0XHR7XG5cdFx0XHR0aGlzLiQoJy5jb25kaXRpb24tbWV0Jykuc2hvdygpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLiQoJy5jb25kaXRpb24tbWV0JykuaGlkZSgpO1xuXHRcdH1cblx0XHRjaGVja2VkLmVhY2goZnVuY3Rpb24oKVxuXHRcdHtcblx0XHRcdHRlc3RzLnB1c2goalF1ZXJ5KHRoaXMpLnZhbCgpKTsgXG5cdFx0fSk7IFxuXHRcdHJldHVybiB0ZXN0czsgXG5cdH1cbn0pOyAgICAiLCJ2YXIgQWJzdHJhY3RWaWV3ID0gcmVxdWlyZSgnLi9BYnN0cmFjdFZpZXcnKTtcbnZhciBEYXRhRXh0cmFjdG9yID0gcmVxdWlyZSgnLi9EYXRhRXh0cmFjdG9yJyk7IFxudmFyIFRlc3REZXNjcmlwdGlvblZpZXcgPSByZXF1aXJlKCcuL1Rlc3REZXNjcmlwdGlvblZpZXcnKTtcbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlsJyk7XG5cbi8vIEBtb2R1bGUgd3B0aW5xdWlyZXIuaHRtbCBAY2xhc3MgUmVwb3J0Q29tcGFyZVZpZXcgQGV4dGVuZHMgQWJzdHJhY3RWaWV3XG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0Vmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAncmVwb3J0LWNvbXBhcmUuaHRtbCdcblxuLFx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIFtkYXRhLWFjdGlvbj1cInZpZXdGaXJzdFZpZXdcIl0nOiAndmlld0ZpcnN0Vmlldydcblx0LFx0J2NoYW5nZSBbZGF0YS10eXBlPVwic2FtcGxlLXNlbGVjdGlvbi1ieVwiXSc6ICdzYW1wbGVTZWxlY3Rpb25CeSdcblx0LFx0J2NsaWNrIFtkYXRhLWFjdGlvbj1cInJlbW92ZU91dGxpZXJzXCJdJzogJ3JlbW92ZU91dGxpZXJzJ1xuXHR9XG5cbixcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpXG5cdHtcblx0XHR0aGlzLmFwcGxpY2F0aW9uID0gb3B0aW9ucy5hcHBsaWNhdGlvbjtcblx0XHR0aGlzLnRlc3RJZHMgPSBvcHRpb25zLnRlc3RJZHMuc3BsaXQoJywnKTtcblx0XHRfKENoYXJ0LmRlZmF1bHRzLmdsb2JhbCkuZXh0ZW5kKHtcblx0XHRcdHNjYWxlQmVnaW5BdFplcm86IHRydWVcblx0XHR9KTsgXG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucy5vcHRpb25zIHx8IHt9O1xuXG5cdFx0Ly8gQHByb3BlcnR5IHtPYmplY3Q8U3RyaW5nLFN0cmluZz59IGNvbG9ycyB3ZSB3YW50IHRvIGRyYXcgYWxsIHRoZSBjaGFydHMgdXNpbmcgdGhlIHNhbWUgY29sb3JzIGZvciBlYWNoIHRlc3QgZGVmXG5cdFx0dGhpcy5jb2xvcnMgPSB7fTsgXG5cdFx0VXRpbC5yYW5kb21Db2xvclJlc2V0KCk7XG5cdFx0XyhDaGFydC5kZWZhdWx0cy5nbG9iYWwpLmV4dGVuZCh7XG5cdFx0XHRhbmltYXRpb246IHRydWVcblx0XHR9KTsgXG5cdH1cblxuLFx0c2FtcGxlU2VsZWN0aW9uQnk6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBzZWxlY3RlZCA9IHRoaXMuJCgnW2RhdGEtdHlwZT1cInNhbXBsZS1zZWxlY3Rpb24tYnlcIl0gOnNlbGVjdGVkJykudmFsKCk7XG5cdFx0dmFyIG9wdGlvbnMgPSB7c2FtcGxlU2VsZWN0aW9uQnk6IHNlbGVjdGVkfTsgXG5cdFx0dmFyIGhhc2ggPSBVdGlsLnNldE9wdGlvbnNUb0hhc2gobnVsbCwgb3B0aW9ucyk7XG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZShoYXNoLCB7dHJpZ2dlcjp0cnVlfSk7IFxuXHR9XG5cbixcdHJlbW92ZU91dGxpZXJzOiBmdW5jdGlvbigpXG5cdHtcblx0XHR2YXIgY2hlY2tlZCA9IHRoaXMuJCgnW2RhdGEtYWN0aW9uPVwicmVtb3ZlT3V0bGllcnNcIl06Y2hlY2tlZCcpLnNpemUoKTsgXG5cdFx0Ly8gY29uc29sZS5sb2coJ2NoZWNrZWQnLCBjaGVja2VkKVxuXHRcdHZhciBvcHRpb25zID0ge3JlbW92ZU91dGxpZXJzOiBjaGVja2VkfTsgXG5cdFx0dmFyIGhhc2ggPSBVdGlsLnNldE9wdGlvbnNUb0hhc2gobnVsbCwgb3B0aW9ucyk7XG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZShoYXNoLCB7dHJpZ2dlcjp0cnVlfSk7IFxuXHR9XG5cbixcdGFmdGVyUmVuZGVyOiBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLnJlbmRlckhlYWRlcigpO1xuXHRcdHRoaXMuc2hvd0xvYWRpbmdTdGF0dXMoJ1tkYXRhLXR5cGU9XCJsb2FkaW5nLXNwaW5uZXJcIl0nLCB0cnVlKTsgXG5cdFx0dmFyIHNlbGYgPSB0aGlzOyBcblx0XHRzZWxmLmRhdGFFeHRyYWN0b3JzID0ge307XG5cdFx0dmFyIHByb21pc2VzID0gW107IFxuXG5cdFx0Xyh0aGlzLnRlc3RJZHMpLmVhY2goZnVuY3Rpb24odGVzdElkKVxuXHRcdHtcblx0XHRcdHByb21pc2VzLnB1c2goVXRpbC5nZXRUZXN0RGF0YSh0ZXN0SWQpKTtcblx0XHR9KTsgXG5cdFx0alF1ZXJ5LndoZW4uYXBwbHkoalF1ZXJ5LCBwcm9taXNlcykuZG9uZShmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIGRhdGEgPSB7fTsgXHRcdFx0XG5cdFx0XHQvLyBfKGFyZ3VtZW50cykuZWFjaChmdW5jdGlvbihhcmcpXG5cdFx0XHQvLyB7XG5cdFx0XHQvLyBcdHZhciB0ZXN0RGF0YSA9IGFyZzsgXG5cdFx0XHRfKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpLmVhY2goZnVuY3Rpb24oYXJnKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgdGVzdERhdGEgPSBhcmdbMF07IFxuXHRcdFx0XHRkYXRhW3Rlc3REYXRhLnRlc3REZWZpbml0aW9uLnRlc3RJZF0gPSB0ZXN0RGF0YTsgXG5cdFx0XHRcdHZhciBleHRyYWN0b3JDb25maWcgPSB7XG5cdFx0XHRcdFx0Zmlyc3RWaWV3OiAhc2VsZi5vcHRpb25zLnZpZXdSZXBlYXRWaWV3XG5cdFx0XHRcdCxcdHNhbXBsZVNlbGVjdGlvbkJ5OiBzZWxmLm9wdGlvbnMuc2FtcGxlU2VsZWN0aW9uQnlcblx0XHRcdFx0LFx0cmVtb3ZlT3V0bGllcnM6IHNlbGYub3B0aW9ucy5yZW1vdmVPdXRsaWVyc1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRzZWxmLmRhdGFFeHRyYWN0b3JzW3Rlc3REYXRhLnRlc3REZWZpbml0aW9uLnRlc3RJZF0gPSBuZXcgRGF0YUV4dHJhY3Rvcih0ZXN0RGF0YSwgZXh0cmFjdG9yQ29uZmlnKTsgXG5cdFx0XHR9KTsgXG5cdFx0XHRzZWxmLmRhdGEgPSBkYXRhO1xuXG5cdFx0XHRzZWxmLnNob3dMb2FkaW5nU3RhdHVzKCdbZGF0YS10eXBlPVwibG9hZGluZy1zcGlubmVyXCJdJywgZmFsc2UpOyBcblxuXHRcdFx0c2VsZi5kcmF3Q2hhcnRWaXN1YWxseUNvbXBsZXRlMTAwKCk7IFxuXHRcdFx0c2VsZi5kcmF3Q2hhcnRWaXN1YWxseUNvbXBsZXRlTm9uWmVybygpO1xuXHRcdFx0c2VsZi5kcmF3Q2hhcnRMYXN0VmlzdWFsQ2hhbmdlKCk7XG5cdFx0XHRzZWxmLmRyYXdDaGFydFNwZWVkSW5kZXgoKTtcblx0XHRcdHNlbGYuZHJhd0NoYXJ0RnVsbHlMb2FkZWQoKTsgXG5cdFx0fSk7IFxuXHR9XG5cbixcdGRyYXdBYnN0cmFjdEJhckNoYXJ0OiBmdW5jdGlvbihjb25maWcpXG5cdHtcblx0XHR2YXIgZGF0YXNldHMgPSBbXSwgc2VsZiA9IHRoaXMsIGxlZ2VuZHMgPSBbXTsgXG5cblx0XHRfKHNlbGYuZGF0YUV4dHJhY3RvcnMpLmVhY2goZnVuY3Rpb24oZXh0cmFjdG9yLCB0ZXN0SWQpXG5cdFx0e1xuXHRcdFx0dmFyIG51bWJlciA9IGV4dHJhY3Rvci5leHRyYWN0U2luZ2xlTnVtYmVyKGNvbmZpZy5leHRyYWN0TnVtYmVyc0lkKTtcblx0XHRcdHZhciBjb2xvciA9IHNlbGYuY29sb3JzW3Rlc3RJZF0gPSAoc2VsZi5jb2xvcnNbdGVzdElkXSB8fCBVdGlsLnJhbmRvbUNvbG9yKCkpOyBcblx0XHRcdHZhciBmaWxsQ29sb3IgPSBfKGNvbG9yKS5jbG9uZSgpO1xuXHRcdFx0ZmlsbENvbG9yLmEgPSAwLjI7XG5cdFx0XHRkYXRhc2V0cy5wdXNoKHtcblx0XHRcdFx0ZGF0YTogW251bWJlcl1cblx0XHRcdFx0LCBsYWJlbDogdGVzdElkXG5cdFx0XHRcdCwgZmlsbENvbG9yOiBVdGlsLmNvbG9yVG9SZ2IoY29sb3IpXG5cdFx0XHR9KTtcblx0XHRcdGxlZ2VuZHMucHVzaCh7XG5cdFx0XHRcdG5hbWU6IHRlc3RJZFxuXHRcdFx0XHQsIGNvbG9yOiBVdGlsLmNvbG9yVG9SZ2IoY29sb3IpXG5cdFx0XHRcdCwgdXJsOiAnI3JlcG9ydC8nK3Rlc3RJZFxuXHRcdFx0fSk7IFxuXHRcdH0pO1xuXHRcdFxuXHRcdHZhciBjaGFydE9wdGlvbnMgPSB7XG5cdFx0XHRzaG93WExhYmVsczogMlxuXHRcdH07IFxuXHRcdHZhciBjaGFydERhdGEgPSB7XG5cdFx0XHRsYWJlbHM6IFtfLnJhbmdlKHRoaXMudGVzdElkcy5sZW5ndGgpXSxcblx0XHRcdGRhdGFzZXRzOiBkYXRhc2V0c1xuXHRcdH07XG5cblx0XHR2YXIgY2FudmFzID0gc2VsZi4kKGNvbmZpZy5jaGFydFNlbGVjdG9yICsgJyAuY2hhcnQtY2FudmFzJykuZ2V0KDApO1xuXHRcdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRcdHZhciBteUJhckNoYXJ0ID0gbmV3IENoYXJ0KGN0eCkuQmFyKGNoYXJ0RGF0YSwgY2hhcnRPcHRpb25zKTtcblxuXHRcdHZhciBsZWdlbmRIdG1sID0gVXRpbC5idWlsZExlZ2VuZEh0bWwobGVnZW5kcyk7IFxuXHRcdHNlbGYuJChjb25maWcuY2hhcnRTZWxlY3RvciArICcgLmNoYXJ0LWxlZ2VuZCcpLmFwcGVuZChsZWdlbmRIdG1sKTtcblxuXHR9XG5cbixcdGRyYXdDaGFydFZpc3VhbGx5Q29tcGxldGVOb25aZXJvOiBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLmRyYXdBYnN0cmFjdEJhckNoYXJ0KHtcblx0XHRcdGV4dHJhY3ROdW1iZXJzSWQ6ICdWaXN1YWxseUNvbXBsZXRlTm9uWmVybydcblx0XHQsXHRjaGFydFNlbGVjdG9yOiAnW2RhdGEtaWQ9XCJ2aXN1YWxDb21wbGV0aW9uTm9uWmVyb0NhbnZhc1wiXSdcblx0XHR9KTtcblx0fVxuXG4sXHRkcmF3Q2hhcnRWaXN1YWxseUNvbXBsZXRlMTAwOiBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLmRyYXdBYnN0cmFjdEJhckNoYXJ0KHtcblx0XHRcdGV4dHJhY3ROdW1iZXJzSWQ6ICdWaXN1YWxseUNvbXBsZXRlMTAwJ1xuXHRcdCxcdGNoYXJ0U2VsZWN0b3I6ICdbZGF0YS1pZD1cInZpc3VhbENvbXBsZXRpb24xMDBDYW52YXNcIl0nXG5cdFx0fSk7XG5cdH1cblxuXG5cbixcdGRyYXdDaGFydExhc3RWaXN1YWxDaGFuZ2U6IGZ1bmN0aW9uKClcblx0e1x0XG5cdFx0dGhpcy5kcmF3QWJzdHJhY3RCYXJDaGFydCh7XG5cdFx0XHRleHRyYWN0TnVtYmVyc0lkOiAnbGFzdFZpc3VhbENoYW5nZSdcblx0XHQsXHRjaGFydFNlbGVjdG9yOiAnW2RhdGEtaWQ9XCJsYXN0VmlzdWFsQ2hhbmdlQ2FudmFzXCJdJ1xuXHRcdH0pOyBcblx0fVxuXG4sXHRkcmF3Q2hhcnRTcGVlZEluZGV4OiBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLmRyYXdBYnN0cmFjdEJhckNoYXJ0KHtcblx0XHRcdGV4dHJhY3ROdW1iZXJzSWQ6ICdTcGVlZEluZGV4J1xuXHRcdCxcdGNoYXJ0U2VsZWN0b3I6ICdbZGF0YS1pZD1cIlNwZWVkSW5kZXhcIl0nXG5cdFx0fSk7IFxuXHR9XG5cbixcdGRyYXdDaGFydEZ1bGx5TG9hZGVkOiBmdW5jdGlvbigpXG5cdHtcdFxuXHRcdHRoaXMuZHJhd0Fic3RyYWN0QmFyQ2hhcnQoe1xuXHRcdFx0ZXh0cmFjdE51bWJlcnNJZDogJ2Z1bGx5TG9hZGVkJ1xuXHRcdCxcdGNoYXJ0U2VsZWN0b3I6ICdbZGF0YS1pZD1cImZ1bGx5TG9hZGVkQ2FudmFzXCJdJ1xuXHRcdH0pOyBcblx0fVxuXG5cbixcdHZpZXdGaXJzdFZpZXc6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG5cdFx0dmFyIG9wdGlvbnMgPSBoYXNoLmluZGV4T2YoJz8nKSE9PS0xID8gaGFzaC5zcGxpdCgnPycpWzFdIDogJyc7XG5cdFx0b3B0aW9ucyA9IFV0aWwucGFyc2VPcHRpb25zKG9wdGlvbnMpOyBcblx0XHRoYXNoID0gaGFzaC5zcGxpdCgnPycpWzBdOyBcblx0XHR2YXIgdmFsdWUgPSB0aGlzLiQoJ1tkYXRhLWFjdGlvbj1cInZpZXdGaXJzdFZpZXdcIl06Y2hlY2tlZCcpLnNpemUoKTsgXG5cdFx0b3B0aW9ucy52aWV3UmVwZWF0VmlldyA9IHZhbHVlO1xuXHRcdHZhciBuYXZpZ2F0ZUhhc2ggPSBoYXNoICsgJz8nICsgVXRpbC5vcHRpb25zVG9TdHJpbmcob3B0aW9ucyk7IFxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUobmF2aWdhdGVIYXNoLCB7dHJpZ2dlcjogdHJ1ZX0pOyBcblx0fVxuXG5cbn0pOyIsInZhciBBYnN0cmFjdFZpZXcgPSByZXF1aXJlKCcuL0Fic3RyYWN0VmlldycpO1xudmFyIERhdGFFeHRyYWN0b3IgPSByZXF1aXJlKCcuL0RhdGFFeHRyYWN0b3InKTsgXG52YXIgVGVzdERlc2NyaXB0aW9uVmlldyA9IHJlcXVpcmUoJy4vVGVzdERlc2NyaXB0aW9uVmlldycpO1xudmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWwnKTtcbi8vIEBtb2R1bGUgd3B0aW5xdWlyZXIuaHRtbCBAY2xhc3MgUmVwb3J0VmlldyBAZXh0ZW5kcyBBYnN0cmFjdFZpZXdcbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RWaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICdyZXBvcnQuaHRtbCdcblxuLFx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIFtkYXRhLWFjdGlvbj1cInZpZXdGaXJzdFZpZXdcIl0nOiAndmlld0ZpcnN0Vmlldydcblx0LFx0J2NoYW5nZSBbZGF0YS1jaGFydC1vcHRpb25dJzogJ2NoYW5nZUNoYXJ0Q29udHJvbCdcblx0LFx0J2NsaWNrIFtkYXRhLWFjdGlvbj1cInNob3dTdGFuZGFyZERldmlhdGlvblwiXSc6ICdzaG93U3RhbmRhcmREZXZpYXRpb24nXG5cdH1cblxuLFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24ob3B0aW9ucylcblx0e1xuXHRcdHRoaXMuYXBwbGljYXRpb24gPSBvcHRpb25zLmFwcGxpY2F0aW9uO1xuXHRcdC8vIHRoaXMucmVwb3J0SWQgPSBvcHRpb25zLnJlcG9ydElkO1xuXHRcdHRoaXMudGVzdElkcyA9IG9wdGlvbnMudGVzdElkLnNwbGl0KCcsJyk7XG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucy5vcHRpb25zIHx8IHt9O1xuXHRcdHRoaXMub3B0aW9ucy52aXN1YWxseUNvbXBsZXRlMTAwVGhyZWVzaG9sZCA9IHRoaXMub3B0aW9ucy52aXN1YWxseUNvbXBsZXRlMTAwVGhyZWVzaG9sZCB8fCAxMDA7IFxuXHRcdF8oQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsKS5leHRlbmQoe1xuXHRcdFx0c2NhbGVCZWdpbkF0WmVybzogdHJ1ZVxuXHRcdH0pOyBcblxuXHRcdF8oQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsKS5leHRlbmQoe1xuXHRcdFx0YW5pbWF0aW9uOiB0cnVlXG5cdFx0fSk7IFxuXHR9XG5cbixcdGFmdGVyUmVuZGVyOiBmdW5jdGlvbigpXG5cdHtcblxuXHRcdHRoaXMuc2hvd0xvYWRpbmdTdGF0dXMoJ1tkYXRhLXR5cGU9XCJsb2FkaW5nLXNwaW5uZXJcIl0nLCB0cnVlKTsgXG5cdFx0dGhpcy5yZW5kZXJIZWFkZXIoKTtcblx0XHR2YXIgc2VsZiA9IHRoaXM7IFxuXHRcdHZhciBhVGVzdElkID0gdGhpcy50ZXN0SWRzWzBdO1xuXG5cdFx0VXRpbC5nZXRUZXN0RGF0YShhVGVzdElkKS5kb25lKGZ1bmN0aW9uKGRhdGEpXG5cdFx0e1xuXHRcdFx0c2VsZi50ZXN0RGF0YSA9IGRhdGE7XG5cdFx0XHR2YXIgZXh0cmFjdG9yQ29uZmlnID0ge1xuXHRcdFx0XHRmaXJzdFZpZXc6ICFzZWxmLm9wdGlvbnMudmlld1JlcGVhdFZpZXdcblx0XHRcdCxcdHZpc3VhbGx5Q29tcGxldGUxMDBUaHJlZXNob2xkOiBzZWxmLm9wdGlvbnMudmlzdWFsbHlDb21wbGV0ZTEwMFRocmVlc2hvbGQgXG5cdFx0XHR9O1xuXHRcdFx0c2VsZi5kYXRhRXh0cmFjdG9yID0gbmV3IERhdGFFeHRyYWN0b3IoZGF0YSwgZXh0cmFjdG9yQ29uZmlnKTtcblxuXHRcdFx0c2VsZi5zaG93TG9hZGluZ1N0YXR1cygnW2RhdGEtdHlwZT1cImxvYWRpbmctc3Bpbm5lclwiXScsIGZhbHNlKTsgXG5cblx0XHRcdHNlbGYuZHJhd0NoYXJ0VmlzdWFsbHlDb21wbGV0ZU5vblplcm8oKTtcblx0XHRcdHNlbGYuZHJhd0NoYXJ0VmlzdWFsbHlDb21wbGV0ZTEwMCgpOyBcblx0XHRcdHNlbGYuZHJhd0NoYXJ0TGFzdFZpc3VhbENoYW5nZSgpOyBcblx0XHRcdHNlbGYuZHJhd0NoYXJ0RnVsbHlMb2FkZWQoKTsgXG5cdFx0XHRzZWxmLmRyYXdDaGFydFNwZWVkSW5kZXgoKTsgXG5cblx0XHRcdHZhciB0ZXN0RGVzY3JpcHRpb25WaWV3ID0gbmV3IFRlc3REZXNjcmlwdGlvblZpZXcoe1xuXHRcdFx0XHRhcHBsaWNhdGlvbjogc2VsZi5hcHBsaWNhdGlvblxuXHRcdFx0XHQsIHRlc3REYXRhOiBzZWxmLnRlc3REYXRhXG5cdFx0XHR9KTtcblx0XHRcdHRlc3REZXNjcmlwdGlvblZpZXcucmVuZGVySW4oc2VsZi4kKCdbZGF0YS12aWV3PVwidGVzdC1kZXNjcmlwdGlvblwiXScpKTsgXG5cblx0XHR9KTsgXG5cblx0fVxuXG4sXHRkcmF3QWJzdHJhY3RMaW5lQ2hhcnQ6IGZ1bmN0aW9uKGNvbmZpZylcblx0e1xuXHRcdHZhciBzZWxmID0gdGhpc1xuXHRcdCxcdGRhdGEgPSBzZWxmLmRhdGFFeHRyYWN0b3IuZXh0cmFjdE51bWJlcnMoY29uZmlnLmV4dHJhY3ROdW1iZXJzSWQpO1xuXG5cdFx0dmFyIG51bWJlcnMgPSBfKGRhdGEpLm1hcChmdW5jdGlvbihkKXtyZXR1cm4gZC52YWx1ZTsgfSk7IFxuXHRcdHRoaXMubnVtYmVycyA9IHRoaXMubnVtYmVycyB8fCB7fTsgXG5cdFx0dGhpcy5udW1iZXJzW2NvbmZpZy5leHRyYWN0TnVtYmVyc0lkXSA9IG51bWJlcnM7IFxuXHRcdHZhciBsYWJlbHMgPSBfKGRhdGEpLm1hcChmdW5jdGlvbihkKXtyZXR1cm4gZC50ZXN0SWQ7IH0pOyBcblxuXHRcdHZhciBjaGFydENvbmZpZyA9IHtcblx0XHRcdHJlc3BvbnNpdmU6IHRydWVcblx0XHQsXHRsYWJlbHM6IGxhYmVsc1xuXHRcdCxcdGRhdGFzZXRzOiBbe1xuXHRcdFx0XHRsYWJlbDogMFxuXHRcdFx0LFx0ZmlsbENvbG9yOiAncmdiYSgyMjAsMjIwLDIyMCwwLjIpJ1xuXHRcdFx0LFx0c3Ryb2tlQ29sb3I6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJ1xuXHRcdFx0LFx0cG9pbnRDb2xvcjogJ3JnYmEoMjIwLDIyMCwyMjAsMSknXG5cdFx0XHQsXHRwb2ludFN0cm9rZUNvbG9yOiAnI2ZmZidcblx0XHRcdCxcdHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnXG5cdFx0XHQsXHRwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknXG5cdFx0XHQsXHRkYXRhOiBudW1iZXJzXG5cdFx0XHR9XVxuXHRcdH07XG5cblx0XHR2YXIgY2hhcnRPcHRpb25zID0ge307XG5cblx0XHR2YXIgY2FudmFzID0gc2VsZi4kKGNvbmZpZy5jaGFydFNlbGVjdG9yICsgJyAuY2hhcnQtY2FudmFzJykuZ2V0KDApO1xuXHRcdHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHR2YXIgbXlMaW5lQ2hhcnQgPSBuZXcgQ2hhcnQoY3R4KS5MaW5lKGNoYXJ0Q29uZmlnLCBjaGFydE9wdGlvbnMpO1xuXG5cdFx0Y2FudmFzLm9uY2xpY2sgPSBmdW5jdGlvbihlKVxuXHRcdHtcblx0XHRcdHZhciB0b29sdGlwRWwgPSBzZWxmLiQoY29uZmlnLmNoYXJ0U2VsZWN0b3IgKyAnIC5jaGFydC10b29sdGlwJylcblx0XHRcdCxcdGFjdGl2ZVBvaW50cyA9IG15TGluZUNoYXJ0LmdldFBvaW50c0F0RXZlbnQoZSlcblx0XHRcdCxcdHBvaW50ID0gYWN0aXZlUG9pbnRzWzBdXG5cdFx0XHQsXHR0ZXN0SWQgPSBwb2ludC5sYWJlbFxuXHRcdFx0LFx0dXJsID0gJ2h0dHA6Ly93d3cud2VicGFnZXRlc3Qub3JnL3Jlc3VsdC8nICsgdGVzdElkICsgJy8nXG5cdFx0XHQsXHRmcmFtZXNVcmwgPSAnaHR0cDovL3d3dy53ZWJwYWdldGVzdC5vcmcvdmlkZW8vY29tcGFyZS5waHA/dGVzdHM9Jyt0ZXN0SWQrJyZ0aHVtYlNpemU9MjAwJml2YWw9MTAwJmVuZD12aXN1YWwnXG5cdFx0XHQsXHR2aXN1YWxQcm9ncmVzc1VybCA9ICdodHRwOi8vd3d3LndlYnBhZ2V0ZXN0Lm9yZy92aWRlby9jb21wYXJlLnBocD90ZXN0cz0nK3Rlc3RJZCsnJnRodW1iU2l6ZT0yMDAmaXZhbD0xMDAmZW5kPXZpc3VhbCNjb21wYXJlX3Zpc3VhbF9wcm9ncmVzcydcblx0XHRcdCxcdGh0bWwgPSAnU2VsZWN0ZWQgU2FtcGxlIFRlc3QgaWQ6IDxiPicrdGVzdElkKyc8L2I+OiAnK1xuXHRcdFx0XHRcdCc8YSBocmVmPVwiJyt1cmwrJ1wiPlN1bW1hcnk8L2E+LCAnK1xuXHRcdFx0XHRcdCc8YSBocmVmPVwiJytmcmFtZXNVcmwrJ1wiPkZyYW1lczwvYT4sICcgKyBcblx0XHRcdFx0XHQnPGEgaHJlZj1cIicrdmlzdWFsUHJvZ3Jlc3NVcmwrJ1wiPlZpc3VhbCBQcm9ncmVzczwvYT4nIDtcblxuXHRcdFx0dG9vbHRpcEVsLmh0bWwoaHRtbCk7XG5cdFx0fTtcblx0fVxuXG4sXHRzaG93U3RhbmRhcmREZXZpYXRpb246IGZ1bmN0aW9uKGUpXG5cdHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0VXRpbC5sb2FkVmlzKCkuZG9uZShmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIG1lYXN1cmVUeXBlID0galF1ZXJ5KGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWVhc3VyZS10eXBlXScpLmF0dHIoJ2RhdGEtbWVhc3VyZS10eXBlJyk7IFxuXHRcdFx0dmFyIG51bWJlcnMgPSBzZWxmLm51bWJlcnNbbWVhc3VyZVR5cGVdOyBcblxuXHRcdFx0dmFyIHZpZXcgPSBuZXcgQWJzdHJhY3RWaWV3KHthcHBsaWNhdGlvbjogc2VsZi5hcHBsaWNhdGlvbn0pO1xuXHRcdFx0dmlldy50ZW1wbGF0ZSA9IF8oJzxkaXY+PC9kaXY+JykudGVtcGxhdGUoKTsgXG5cdFx0XHR2aWV3LnJlbmRlcigpO1xuXHRcdFx0dmFyIGNvbmZpZyA9IHtcblx0XHRcdFx0bnVtYmVyczpudW1iZXJzXG5cdFx0XHRcdC8vICxjb250YWluZXI6c2VsZi4kKCdbZGF0YS1tZWFzdXJlLXR5cGU9XCInK21lYXN1cmVUeXBlKydcIl0gLnN0YW5kYXJkLWRldmlhdGlvbiAuY2hhcnQnKS5nZXQoMClcblx0XHRcdFx0LFx0Y29udGFpbmVyOiB2aWV3LmVsXG5cdFx0XHR9OyBcblx0XHRcdHNlbGYuYXBwbGljYXRpb24uc2hvd1ZpZXdJbk1vZGFsKHZpZXcsIHt0aXRsZTogJ1N0YW5kYXJkIERldmlhdGlvbiBmb3IgJyttZWFzdXJlVHlwZX0pOyBcblx0XHQvLyBkZWJ1Z2dlcjtcblx0XHRcdHNlbGYuZHJhd1N0YW5kYXJkRGV2aWF0aW9uKGNvbmZpZyk7IFxuXHRcdH0pOyBcdFx0XG5cdH1cblxuLFx0ZHJhd1N0YW5kYXJkRGV2aWF0aW9uOiBmdW5jdGlvbihjb25maWcpXG5cdHtcblx0XHR2YXIgbnVtYmVycyA9IGNvbmZpZy5udW1iZXJzXG5cdFx0LFx0b3V0ID0gRGF0YUV4dHJhY3Rvci5nZXRTdGFuZGFyRGV2aWF0aW9uKG51bWJlcnMpOyBcblxuXHRcdHZhciBpdGVtcyA9ICBbXSwgc3RhcnRUaW1lPTA7XG5cdFx0XyhvdXQpLmVhY2goZnVuY3Rpb24odmFsLCBrZXkpXG5cdFx0e1xuXHRcdFx0aWYodmFsICYmIHZhbC5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHN0YXJ0VGltZT1wYXJzZUludChrZXkrJycpO1xuXHRcdFx0fVxuXHRcdFx0aWYoc3RhcnRUaW1lKVxuXHRcdFx0e1xuXHRcdFx0XHRpdGVtcy5wdXNoKHtcblx0XHRcdFx0XHR4OiBVdGlsLmJ1aWxkUmVmZXJlbmNlTXNEYXRlKHBhcnNlSW50KGtleSsnJykpXG5cdFx0XHRcdFx0LCB5OiB2YWwubGVuZ3RoXG5cdFx0XHRcdH0pO1x0XG5cdFx0XHR9XG5cdFx0fSk7IFxuXG5cdFx0dmFyIGRhdGFzZXQgPSBuZXcgdmlzLkRhdGFTZXQoaXRlbXMpO1xuXHRcdHZhciBvcHRpb25zID0ge1xuXHRcdFx0c3R5bGU6J2Jhcidcblx0XHRcdCx0aW1lQXhpczp7XG5cdFx0XHRcdHNjYWxlOidtaWxsaXNlY29uZCdcblx0XHRcdFx0LHN0ZXA6MjAwXG5cdFx0XHR9XG5cdFx0XHQsZGF0YUF4aXM6IHtcblx0XHRcdFx0c2hvd01pbm9yTGFiZWxzOmZhbHNlXG5cdFx0XHR9XG5cdFx0XHQsZHJhd1BvaW50czoge1xuXHRcdFx0XHRzdHlsZTogJ2NpcmNsZSdcblx0XHRcdFx0LHNpemU6IDEwXG5cdFx0XHR9XG5cdFx0XHQsaGVpZ2h0OiAnNjAwcHgnXG5cdFx0fTtcblx0XHR2YXIgZ3JhcGgyZCA9IG5ldyB2aXMuR3JhcGgyZChjb25maWcuY29udGFpbmVyLCBkYXRhc2V0LCBvcHRpb25zKTtcblx0fVxuXG4sXHRkcmF3Q2hhcnRWaXN1YWxseUNvbXBsZXRlMTAwOiBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLmRyYXdBYnN0cmFjdExpbmVDaGFydCh7XG5cdFx0XHRleHRyYWN0TnVtYmVyc0lkOiAnVmlzdWFsbHlDb21wbGV0ZTEwMCdcblx0XHQsXHRjaGFydFNlbGVjdG9yOiAnW2RhdGEtaWQ9XCJ2aXN1YWxDb21wbGV0aW9uMTAwQ2FudmFzXCJdJ1xuXHRcdH0pOyBcblx0fVxuXG4sXHRkcmF3Q2hhcnRWaXN1YWxseUNvbXBsZXRlTm9uWmVybzogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dGhpcy5kcmF3QWJzdHJhY3RMaW5lQ2hhcnQoe1xuXHRcdFx0ZXh0cmFjdE51bWJlcnNJZDogJ1Zpc3VhbGx5Q29tcGxldGVOb25aZXJvJ1xuXHRcdCxcdGNoYXJ0U2VsZWN0b3I6ICdbZGF0YS1pZD1cInZpc3VhbENvbXBsZXRpb25Ob25aZXJvQ2FudmFzXCJdJ1xuXHRcdH0pOyBcblx0fVxuXG4sXHRkcmF3Q2hhcnRMYXN0VmlzdWFsQ2hhbmdlOiBmdW5jdGlvbigpXG5cdHtcdFxuXHRcdHRoaXMuZHJhd0Fic3RyYWN0TGluZUNoYXJ0KHtcblx0XHRcdGV4dHJhY3ROdW1iZXJzSWQ6ICdsYXN0VmlzdWFsQ2hhbmdlJ1xuXHRcdCxcdGNoYXJ0U2VsZWN0b3I6ICdbZGF0YS1pZD1cImxhc3RWaXN1YWxDaGFuZ2VDYW52YXNcIl0nXG5cdFx0fSk7IFxuXHR9XG5cbixcdGRyYXdDaGFydFNwZWVkSW5kZXg6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHRoaXMuZHJhd0Fic3RyYWN0TGluZUNoYXJ0KHtcblx0XHRcdGV4dHJhY3ROdW1iZXJzSWQ6ICdTcGVlZEluZGV4J1xuXHRcdCxcdGNoYXJ0U2VsZWN0b3I6ICdbZGF0YS1pZD1cIlNwZWVkSW5kZXhcIl0nXG5cdFx0fSk7IFxuXHR9XG5cbixcdGRyYXdDaGFydEZ1bGx5TG9hZGVkOiBmdW5jdGlvbigpXG5cdHtcdFxuXHRcdHRoaXMuZHJhd0Fic3RyYWN0TGluZUNoYXJ0KHtcblx0XHRcdGV4dHJhY3ROdW1iZXJzSWQ6ICdmdWxseUxvYWRlZCdcblx0XHQsXHRjaGFydFNlbGVjdG9yOiAnW2RhdGEtaWQ9XCJmdWxseUxvYWRlZENhbnZhc1wiXSdcblx0XHR9KTsgXG5cdH1cblxuLFx0dmlld0ZpcnN0VmlldzogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcblx0XHR2YXIgb3B0aW9ucyA9IGhhc2guaW5kZXhPZignPycpIT09LTEgPyBoYXNoLnNwbGl0KCc/JylbMV0gOiAnJztcblx0XHRvcHRpb25zID0gVXRpbC5wYXJzZU9wdGlvbnMob3B0aW9ucyk7IFxuXHRcdGhhc2ggPSBoYXNoLnNwbGl0KCc/JylbMF07IFxuXHRcdHZhciB2YWx1ZSA9IHRoaXMuJCgnW2RhdGEtYWN0aW9uPVwidmlld0ZpcnN0Vmlld1wiXTpjaGVja2VkJykuc2l6ZSgpOyBcblx0XHRvcHRpb25zLnZpZXdSZXBlYXRWaWV3ID0gdmFsdWU7XG5cdFx0dmFyIG5hdmlnYXRlSGFzaCA9IGhhc2ggKyAnPycgKyBVdGlsLm9wdGlvbnNUb1N0cmluZyhvcHRpb25zKTsgXG5cdFx0Y29uc29sZS5sb2coaGFzaCwgb3B0aW9ucywgdmFsdWUsIG5hdmlnYXRlSGFzaCk7IFxuXHRcdEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUobmF2aWdhdGVIYXNoLCB7dHJpZ2dlcjogdHJ1ZX0pOyBcblx0fVxuXG4sXHRjaGFuZ2VDaGFydENvbnRyb2w6IGZ1bmN0aW9uKGVsKVxuXHR7XG5cdFx0dmFyIGVsID0galF1ZXJ5KGVsLnRhcmdldCksIHZhbHVlID0gZWwudmFsKClcblx0XHQsXHRhY3Rpb25OYW1lID0gZWwuZGF0YSgnY2hhcnQtb3B0aW9uJylcblx0XHQsXHRvcHRpb25zID0ge307IFxuXHRcdG9wdGlvbnNbYWN0aW9uTmFtZV0gPSB2YWx1ZTsgXG5cdFx0dmFyIGhhc2ggPSBVdGlsLnNldE9wdGlvbnNUb0hhc2gobnVsbCwgb3B0aW9ucyk7XG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZShoYXNoLCB7dHJpZ2dlcjp0cnVlfSk7IFxuXHR9XG5cbn0pOyIsInZhciBBYnN0cmFjdFZpZXcgPSByZXF1aXJlKCcuL0Fic3RyYWN0VmlldycpO1xudmFyIERhdGFFeHRyYWN0b3IgPSByZXF1aXJlKCcuL0RhdGFFeHRyYWN0b3InKTsgXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vVXRpbCcpO1xuXG4vLyBAbW9kdWxlIHdwdGlucXVpcmVyLmh0bWwgQGNsYXNzIFJlcG9ydFZpc3VhbFByb2dyZXNzQ29tcGFyZVZpZXcgQGV4dGVuZHMgQWJzdHJhY3RWaWV3XG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0Vmlldy5leHRlbmQoe1xuXG5cdHRlbXBsYXRlOiAncmVwb3J0LXZpc3VhbC1wcm9ncmVzcy1jb21wYXJlLmh0bWwnXG5cbixcdGV2ZW50czoge1xuXHRcdCdjbGljayBbZGF0YS1hY3Rpb249XCJ2aWV3Rmlyc3RWaWV3XCJdJzogJ3ZpZXdGaXJzdFZpZXcnXG5cdCxcdCdjbGljayBbZGF0YS1wbGFjZWhvbGRlcj1cInZpZGVvRnJhbWVzQ29tcGFyZVwiXSc6ICdnb3RvVmlkZW9GcmFtZXMnXG5cdCxcdCdjbGljayBbZGF0YS1hY3Rpb249XCJyZW1vdmVPdXRsaWVyc1wiXSc6ICdyZW1vdmVPdXRsaWVycydcblx0fVxuXG4sXHRpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKVxuXHR7XG5cdFx0dGhpcy5hcHBsaWNhdGlvbiA9IG9wdGlvbnMuYXBwbGljYXRpb247XG5cdFx0dGhpcy50ZXN0SWRzID0gb3B0aW9ucy50ZXN0SWRzLnNwbGl0KCcsJyk7XG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucy5vcHRpb25zIHx8IHt9O1xuXHRcdFxuXHRcdC8vQHByb3BlcnR5IHtPYmplY3Q8U3RyaW5nLFN0cmluZz59IGNvbG9ycyB3ZSB3YW50IHRvIGRyYXcgYWxsIHRoZSBjaGFydHMgdXNpbmcgdGhlIHNhbWUgY29sb3JzIGZvciBlYWNoIHRlc3QgZGVmXG5cdFx0dGhpcy5jb2xvcnMgPSB7fTsgXG5cdFx0VXRpbC5yYW5kb21Db2xvclJlc2V0KCk7XG5cdFx0XG5cdFx0XyhDaGFydC5kZWZhdWx0cy5nbG9iYWwpLmV4dGVuZCh7XG5cdFx0XHRhbmltYXRpb246IGZhbHNlXG5cdFx0Ly8gLFx0c2hvd1hMYWJlbHM6IDEwXG5cdFx0fSk7IFxuXHR9XG5cbixcdGFmdGVyUmVuZGVyOiBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLnJlbmRlckhlYWRlcigpO1xuXHRcdHRoaXMuc2hvd0xvYWRpbmdTdGF0dXMoJ1tkYXRhLXR5cGU9XCJsb2FkaW5nLXNwaW5uZXJcIl0nLCB0cnVlKTsgXG5cdFx0dmFyIHNlbGYgPSB0aGlzOyBcblx0XHRzZWxmLmRhdGFFeHRyYWN0b3JzID0ge307XG5cblx0XHRVdGlsLmdldFRlc3RzRGF0YSh0aGlzLnRlc3RJZHMpLmRvbmUoZnVuY3Rpb24ob2JqKVxuXHRcdHtcblx0XHRcdHZhciBkYXRhID0ge307IFxuXHRcdFx0XyhvYmoudGVzdHMpLmVhY2goZnVuY3Rpb24odGVzdERhdGEpXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGFbdGVzdERhdGEudGVzdERlZmluaXRpb24udGVzdElkXSA9IHRlc3REYXRhOyBcblx0XHRcdFx0dmFyIGV4dHJhY3RvckNvbmZpZyA9IHtmaXJzdFZpZXc6ICFzZWxmLm9wdGlvbnMudmlld1JlcGVhdFZpZXcsIHJlbW92ZU91dGxpZXJzOiBzZWxmLm9wdGlvbnMucmVtb3ZlT3V0bGllcnN9O1xuXHRcdFx0XHRzZWxmLmRhdGFFeHRyYWN0b3JzW3Rlc3REYXRhLnRlc3REZWZpbml0aW9uLnRlc3RJZF0gPSBuZXcgRGF0YUV4dHJhY3Rvcih0ZXN0RGF0YSwgZXh0cmFjdG9yQ29uZmlnKTsgXG5cdFx0XHR9KTsgXG5cdFx0XHRzZWxmLmRhdGEgPSBkYXRhO1xuXG5cdFx0XHRzZWxmLnNob3dMb2FkaW5nU3RhdHVzKCdbZGF0YS10eXBlPVwibG9hZGluZy1zcGlubmVyXCJdJywgZmFsc2UpOyBcblxuXHRcdFx0c2VsZi5kcmF3QWxsQ2hhcnRzKCk7XG5cdFx0fSk7IFxuXHR9XG5cbixcdHJlbW92ZU91dGxpZXJzOiBmdW5jdGlvbigpXG5cdHtcblx0XHR2YXIgY2hlY2tlZCA9IHRoaXMuJCgnW2RhdGEtYWN0aW9uPVwicmVtb3ZlT3V0bGllcnNcIl06Y2hlY2tlZCcpLnNpemUoKTsgXG5cdFx0dmFyIG9wdGlvbnMgPSB7cmVtb3ZlT3V0bGllcnM6IGNoZWNrZWR9OyBcblx0XHR2YXIgaGFzaCA9IFV0aWwuc2V0T3B0aW9uc1RvSGFzaChudWxsLCBvcHRpb25zKTtcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKGhhc2gsIHt0cmlnZ2VyOnRydWV9KTsgXG5cdH1cblxuLFx0Z290b1ZpZGVvRnJhbWVzOiBmdW5jdGlvbihlKVxuXHR7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7IFxuXHRcdHZhciB1cmwgPSAndmlkZW9GcmFtZXMvP3Rlc3RzPSc7IFxuXHRcdC8vIGRlYnVnZ2VyO1xuXHRcdHZhciBtbmFtZSA9IGpRdWVyeShlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtbWVhc3VyZS1uYW1lXScpLmF0dHIoJ2RhdGEtbWVhc3VyZS1uYW1lJyk7XG5cdFx0Xyh0aGlzLmRhdGFFeHRyYWN0b3JzKS5lYWNoKGZ1bmN0aW9uKGV4dHJhY3Rvcilcblx0XHR7XG5cdFx0XHR2YXIgbnVtYmVycyA9IGV4dHJhY3Rvci52aWRlb0ZyYW1lTnVtYmVyc1ttbmFtZV1cblx0XHRcdCxcdHRlc3REZWZJZCA9IGV4dHJhY3Rvci5kYXRhLnRlc3REZWZpbml0aW9uLnRlc3RJZFxuXHRcdFx0LFx0d3B0VGVzdElkID0gbnVtYmVycy5zYW1wbGVEYXRhLnRlc3RJZDsgXG5cdFx0XHR1cmwgKz0gdGVzdERlZklkICsgJzonICsgd3B0VGVzdElkICsgJy0nICsgbnVtYmVycy5zYW1wbGVEYXRhLnJ1bkluZGV4ICsgJywnOyBcblx0XHR9KTsgXG5cdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSh1cmwsIHt0cmlnZ2VyOiB0cnVlfSk7IFxuXHR9XG5cbixcdGRyYXdBbGxDaGFydHM6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHRoaXMuZHJhd0NoYXJ0VmlzdWFsUHJvZ3Jlc3Moe1xuXHRcdFx0ZXh0cmFjdE51bWJlcnNJZDogJ1Zpc3VhbGx5Q29tcGxldGVOb25aZXJvJ1xuXHRcdCxcdGNoYXJ0U2VsZWN0b3I6ICdbZGF0YS1pZD1cInZpc3VhbENvbXBsZXRpb25Ob25aZXJvQ2FudmFzXCJdJ1xuXHRcdH0pOyBcblx0XHR0aGlzLmRyYXdDaGFydFZpc3VhbFByb2dyZXNzKHtcblx0XHRcdGV4dHJhY3ROdW1iZXJzSWQ6ICdWaXN1YWxseUNvbXBsZXRlMTAwJ1xuXHRcdCxcdGNoYXJ0U2VsZWN0b3I6ICdbZGF0YS1pZD1cInZpc3VhbENvbXBsZXRpb24xMDBDYW52YXNcIl0nXG5cdFx0fSk7IFxuXHRcdHRoaXMuZHJhd0NoYXJ0VmlzdWFsUHJvZ3Jlc3Moe1xuXHRcdFx0ZXh0cmFjdE51bWJlcnNJZDogJ2xhc3RWaXN1YWxDaGFuZ2UnXG5cdFx0LFx0Y2hhcnRTZWxlY3RvcjogJ1tkYXRhLWlkPVwibGFzdFZpc3VhbENoYW5nZUNhbnZhc1wiXSdcblx0XHR9KTsgXG5cdFx0dGhpcy5kcmF3Q2hhcnRWaXN1YWxQcm9ncmVzcyh7XG5cdFx0XHRleHRyYWN0TnVtYmVyc0lkOiAnU3BlZWRJbmRleCdcblx0XHQsXHRjaGFydFNlbGVjdG9yOiAnW2RhdGEtaWQ9XCJTcGVlZEluZGV4XCJdJ1xuXHRcdH0pOyBcblx0XHR0aGlzLmRyYXdDaGFydFZpc3VhbFByb2dyZXNzKHtcblx0XHRcdGV4dHJhY3ROdW1iZXJzSWQ6ICdmdWxseUxvYWRlZCdcblx0XHQsXHRjaGFydFNlbGVjdG9yOiAnW2RhdGEtaWQ9XCJmdWxseUxvYWRlZENhbnZhc1wiXSdcblx0XHR9KTsgXG5cdH1cblxuLFx0ZHJhd0NoYXJ0VmlzdWFsUHJvZ3Jlc3M6IGZ1bmN0aW9uIChjb25maWcpXG5cdHtcblx0XHR2YXIgc2VsZiA9IHRoaXNcblx0XHQsXHRkYXRhc2V0cyA9IFtdLCBsYWJlbHMgPSBudWxsLCBsZWdlbmRzID0gW10sIGxhcmdlc3REYXRhID0gbnVsbDtcblxuXHRcdF8oc2VsZi5kYXRhRXh0cmFjdG9ycykuZWFjaChmdW5jdGlvbihleHRyYWN0b3IsIHRlc3RJZClcblx0XHR7XG5cdFx0XHRleHRyYWN0b3IudmlkZW9GcmFtZU51bWJlcnMgPSBleHRyYWN0b3IudmlkZW9GcmFtZU51bWJlcnMgfHwge307IFxuXHRcdFx0ZXh0cmFjdG9yLnZpZGVvRnJhbWVOdW1iZXJzW2NvbmZpZy5leHRyYWN0TnVtYmVyc0lkXSA9IGV4dHJhY3Rvci5nZXRWaWRlb0ZyYW1lTnVtYmVycyhjb25maWcuZXh0cmFjdE51bWJlcnNJZCk7XG5cblx0XHRcdHZhciBudW1iZXJzID0gZXh0cmFjdG9yLnZpZGVvRnJhbWVOdW1iZXJzW2NvbmZpZy5leHRyYWN0TnVtYmVyc0lkXS5udW1iZXJzO1xuXHRcblx0XHRcdGlmKCFsYWJlbHMpXG5cdFx0XHR7XG5cdFx0XHRcdGxhYmVscyA9IFtdO1xuXHRcdFx0XHRfKG51bWJlcnMpLmVhY2goZnVuY3Rpb24obilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxhYmVscy5wdXNoKG4udGltZSk7IFxuXHRcdFx0XHR9KTsgXG5cdFx0XHR9XG5cblx0XHRcdGlmKCFsYXJnZXN0RGF0YSB8fCBsYXJnZXN0RGF0YS5sZW5ndGggPCBudW1iZXJzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0bGFyZ2VzdERhdGEgPSBudW1iZXJzOyBcblx0XHRcdH1cblxuXHRcdFx0bnVtYmVycyA9IF8obnVtYmVycykubWFwKGZ1bmN0aW9uKG4pe3JldHVybiBuLmZyYW1lLlZpc3VhbGx5Q29tcGxldGU7IH0pO1xuXG5cdFx0XHR2YXIgY29sb3IgPSBzZWxmLmNvbG9yc1t0ZXN0SWRdID0gKHNlbGYuY29sb3JzW3Rlc3RJZF0gfHwgVXRpbC5yYW5kb21Db2xvcigpKTsgXG5cdFx0XHR2YXIgZmlsbENvbG9yID0gXyhjb2xvcikuY2xvbmUoKVxuXHRcdFx0LFx0c2FtcGxlID0gZXh0cmFjdG9yLmdldE1lZGlhblNhbXBsZShjb25maWcuZXh0cmFjdE51bWJlcnNJZCkuc2FtcGxlOyBcblxuXHRcdFx0ZmlsbENvbG9yLmE9MC4wNTtcblxuXHRcdFx0ZGF0YXNldHMucHVzaCh7XG5cdFx0XHRcdGRhdGE6IG51bWJlcnNcblx0XHRcdFx0LCBsYWJlbDogdGVzdElkXG5cdFx0XHRcdCwgZmlsbENvbG9yOiBVdGlsLmNvbG9yVG9SZ2IoZmlsbENvbG9yKVxuXHRcdFx0XHQsIHN0cm9rZUNvbG9yOiBVdGlsLmNvbG9yVG9SZ2IoY29sb3IpXG5cdFx0XHR9KTtcblxuXHRcdFx0bGVnZW5kcy5wdXNoKHtcblx0XHRcdFx0bmFtZTogdGVzdElkXG5cdFx0XHRcdCwgY29sb3I6IFV0aWwuY29sb3JUb1JnYihjb2xvcilcblx0XHRcdFx0LHNhbXBsZTogc2FtcGxlXG5cdFx0XHRcdCx1cmw6ICcjcmVwb3J0LycrdGVzdElkXG5cdFx0XHRcdCxleHRyYVRleHQ6ICdTcGVlZCBJbmRleDogJysgc2FtcGxlLlNwZWVkSW5kZXggK1xuXHRcdFx0XHRcdCcsIE9wZW4gaW4gPGEgaHJlZj1cIicrXG5cdFx0XHRcdFx0J2h0dHA6Ly93d3cud2VicGFnZXRlc3Qub3JnL3ZpZGVvL2NvbXBhcmUucGhwP3Rlc3RzPScrc2FtcGxlLnRlc3RJZCsnJnRodW1iU2l6ZT0yMDAmaXZhbD0xMDAmZW5kPXZpc3VhbCNjb21wYXJlX3Zpc3VhbF9wcm9ncmVzcycgK1xuXHRcdFx0XHRcdCdcIj53ZWJwYWdldGVzdC5vcmc8L2E+J1xuXHRcdFx0fSk7IFxuXHRcdH0pO1xuXHRcdFxuXHRcdFxuXHRcdGZvciAodmFyIGkgPSBsYWJlbHMubGVuZ3RoOyBpIDwgbGFyZ2VzdERhdGEubGVuZ3RoOyBpKyspIFxuXHRcdHtcblx0XHRcdGxhYmVsc1tpXSA9IGxhcmdlc3REYXRhW2ldLnRpbWU7XG5cdFx0fVxuXHRcdGxhYmVscyA9IFV0aWwuY2hhcnRqc1NraXBMYWJlbHMobGFiZWxzLCAxMCk7IFxuXG5cdFx0dmFyIGNoYXJ0T3B0aW9ucyA9IHt9XG5cdFx0LFx0Y2hhcnREYXRhID0ge1xuXHRcdFx0XHRsYWJlbHM6IGxhYmVsc1xuXHRcdFx0LFx0ZGF0YXNldHM6IGRhdGFzZXRzXG5cdFx0XHR9XG5cdFx0LFx0Y2FudmFzID0gc2VsZi4kKGNvbmZpZy5jaGFydFNlbGVjdG9yICsgJyAuY2hhcnQtY2FudmFzJykuZ2V0KDApXG5cdFx0LFx0Y3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcblx0XHQsXHRteUxpbmVDaGFydCA9IG5ldyBDaGFydChjdHgpLkxpbmUoY2hhcnREYXRhLCBjaGFydE9wdGlvbnMpXG5cdFx0LFx0bGVnZW5kSHRtbCA9IFV0aWwuYnVpbGRMZWdlbmRIdG1sKGxlZ2VuZHMpOyBcblx0XHQvLyAsXHRsZWdlbmRIdG1sID0gJzxzcGFuIGNsYXNzPVwibGVnZW5kLXRpdGxlXCI+TGVnZW5kOiA8L3NwYW4+PHVsPic7XG5cdFx0Ly8gXyhsZWdlbmRzKS5lYWNoKGZ1bmN0aW9uKGxlZ2VuZClcblx0XHQvLyB7XG5cdFx0Ly8gXHR2YXIgdmlzdWFsUHJvZ3Jlc3NVcmwgPSAnaHR0cDovL3d3dy53ZWJwYWdldGVzdC5vcmcvdmlkZW8vY29tcGFyZS5waHA/dGVzdHM9JytsZWdlbmQuc2FtcGxlLnRlc3RJZCsnJnRodW1iU2l6ZT0yMDAmaXZhbD0xMDAmZW5kPXZpc3VhbCNjb21wYXJlX3Zpc3VhbF9wcm9ncmVzcyc7IFxuXHRcdC8vIFx0bGVnZW5kSHRtbCArPSAnPGxpPjxzcGFuIGNsYXNzPVwibGVnZW5kLWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOicgKyBsZWdlbmQuY29sb3IgKyBcblx0XHQvLyBcdFx0J1wiPjwvc3Bhbj48YSBocmVmPVwiI3JlcG9ydC8nK2xlZ2VuZC5uYW1lICsnXCI+JyArIGxlZ2VuZC5uYW1lICsgJzwvYT4uICcrXG5cdFx0Ly8gXHRcdCdTcGVlZCBJbmRleDogJysgbGVnZW5kLnNhbXBsZS5TcGVlZEluZGV4ICtcblx0XHQvLyBcdFx0JywgT3BlbiBpbiA8YSBocmVmPVwiJyt2aXN1YWxQcm9ncmVzc1VybCsnXCI+d2VicGFnZXRlc3Qub3JnPC9hPicrXG5cdFx0Ly8gXHRcdCc8L2xpPic7IFxuXHRcdC8vIH0pOyBcblx0XHQvLyBsZWdlbmRIdG1sICs9ICc8L3VsPic7XG5cdFx0c2VsZi4kKGNvbmZpZy5jaGFydFNlbGVjdG9yICsgJyAuY2hhcnQtbGVnZW5kJykuYXBwZW5kKGxlZ2VuZEh0bWwpO1xuXHR9XG5cbixcdHZpZXdGaXJzdFZpZXc6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG5cdFx0dmFyIG9wdGlvbnMgPSBoYXNoLmluZGV4T2YoJz8nKSE9PS0xID8gaGFzaC5zcGxpdCgnPycpWzFdIDogJyc7XG5cdFx0b3B0aW9ucyA9IFV0aWwucGFyc2VPcHRpb25zKG9wdGlvbnMpOyBcblx0XHRoYXNoID0gaGFzaC5zcGxpdCgnPycpWzBdOyBcblx0XHR2YXIgdmFsdWUgPSB0aGlzLiQoJ1tkYXRhLWFjdGlvbj1cInZpZXdGaXJzdFZpZXdcIl06Y2hlY2tlZCcpLnNpemUoKTsgXG5cdFx0b3B0aW9ucy52aWV3UmVwZWF0VmlldyA9IHZhbHVlO1xuXHRcdHZhciBuYXZpZ2F0ZUhhc2ggPSBoYXNoICsgJz8nICsgVXRpbC5vcHRpb25zVG9TdHJpbmcob3B0aW9ucyk7IFxuXHRcdGNvbnNvbGUubG9nKGhhc2gsIG9wdGlvbnMsIHZhbHVlLCBuYXZpZ2F0ZUhhc2gpOyBcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKG5hdmlnYXRlSGFzaCwge3RyaWdnZXI6IHRydWV9KTsgXG5cdH1cblxufSk7IiwiXG4vLyBAbW9kdWxlIHdwdGlucXVpcmVyLmh0bWwgQGNsYXNzIFJlc291cmNlQnJlYWtkb3duVmlldyBjb21wYXJlIHRoZSByZXNvdXJjZSBicmVha2Rvd24gb2YgdHdvIG9yIG1vcmUgdGVzdHMuIFxuLy8gVE9ETzogV0lQIC0gY3VycmVudGx5IHRoZSBzYW1wbGUgc2VsZWN0aW9uIGlzIGhhcmRjb2RlZCB0byBWaXN1YWxseUNvbXBsZXRlTm9uWmVyb1xuLy8gQGV4dGVuZHMgQWJzdHJhY3RWaWV3XG5cbnZhciBBYnN0cmFjdFZpZXcgPSByZXF1aXJlKCcuL0Fic3RyYWN0VmlldycpO1xudmFyIERhdGFFeHRyYWN0b3IgPSByZXF1aXJlKCcuL0RhdGFFeHRyYWN0b3InKTtcbnZhciBVdGlsID0gcmVxdWlyZSgnLi9VdGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RWaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICdyZXNvdXJjZUJyZWFrZG93bi5odG1sJ1xuXG4sXHRpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKVxuXHR7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMuYXBwbGljYXRpb24gPSBvcHRpb25zLmFwcGxpY2F0aW9uO1xuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnMub3B0aW9ucztcblxuXHRcdHRoaXMudGVzdElkcyA9IG9wdGlvbnMudGVzdElkcy5zcGxpdCgnLCcpO1xuXG5cdFx0dGhpcy5yZXNvdXJjZXMgPSBbJ2h0bWwnLCAnY3NzJywgJ2pzJywgJ2ltYWdlJywgJ2ZvbnQnLCAnb3RoZXInXTsgXG5cdFx0dGhpcy5jb2xvcnMgPSB7fTtcblx0XHRVdGlsLnJhbmRvbUNvbG9yUmVzZXQoKTtcblx0XHRfKHRoaXMucmVzb3VyY2VzKS5lYWNoKGZ1bmN0aW9uKHJlcylcblx0XHR7XG5cdFx0XHRzZWxmLmNvbG9yc1tyZXNdID0gVXRpbC5yYW5kb21Db2xvclJnYigpOyBcblx0XHR9KTsgXG5cdH1cblxuLFx0YWZ0ZXJSZW5kZXI6IGZ1bmN0aW9uKClcblx0e1x0XHRcblx0XHR0aGlzLnJlbmRlckhlYWRlcigpO1xuXHRcdHRoaXMuc2hvd0xvYWRpbmdTdGF0dXMoJ1tkYXRhLXR5cGU9XCJsb2FkaW5nLXNwaW5uZXJcIl0nLCB0cnVlKTsgXG5cdFx0dmFyIHNlbGYgPSB0aGlzOyBcblx0XHRzZWxmLmRhdGFFeHRyYWN0b3JzID0ge307XG5cblx0XHRVdGlsLmdldFRlc3RzRGF0YSh0aGlzLnRlc3RJZHMpLmRvbmUoZnVuY3Rpb24ob2JqKVxuXHRcdHtcblx0XHRcdHZhciBkYXRhID0ge307IFxuXHRcdFx0XyhvYmoudGVzdHMpLmVhY2goZnVuY3Rpb24odGVzdERhdGEpXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGFbdGVzdERhdGEudGVzdERlZmluaXRpb24udGVzdElkXSA9IHRlc3REYXRhOyBcblx0XHRcdFx0dmFyIGV4dHJhY3RvckNvbmZpZyA9IHtmaXJzdFZpZXc6ICFzZWxmLm9wdGlvbnMudmlld1JlcGVhdFZpZXd9O1xuXHRcdFx0XHRzZWxmLmRhdGFFeHRyYWN0b3JzW3Rlc3REYXRhLnRlc3REZWZpbml0aW9uLnRlc3RJZF0gPSBuZXcgRGF0YUV4dHJhY3Rvcih0ZXN0RGF0YSwgZXh0cmFjdG9yQ29uZmlnKTsgXG5cdFx0XHR9KTsgXG5cdFx0XHRzZWxmLmRhdGEgPSBkYXRhO1xuXG5cdFx0XHRzZWxmLnNob3dMb2FkaW5nU3RhdHVzKCdbZGF0YS10eXBlPVwibG9hZGluZy1zcGlubmVyXCJdJywgZmFsc2UpOyBcblxuXHRcdFx0c2VsZi5zaG93UmVzb3VyY2VCcmVha2Rvd24oKTtcblx0XHRcdHNlbGYucmVuZGVySGVhZGVyKCk7XG5cdFx0fSk7IFxuXHR9XG5cbixcdHNob3dSZXNvdXJjZUJyZWFrZG93bjogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHNlbGYucmVuZGVyKHRydWUpXG5cdFx0Xyh0aGlzLmRhdGEpLmVhY2goZnVuY3Rpb24oZGF0YSwgdGVzdElkKVxuXHRcdHtcblx0XHRcdHZhciBleHRyYWN0b3IgPSBzZWxmLmRhdGFFeHRyYWN0b3JzW3Rlc3RJZF07IFxuXHRcdFx0dmFyIGJyZWFrZG93biA9IGV4dHJhY3Rvci5nZXRNZWRpYW5TYW1wbGUoJ1Zpc3VhbGx5Q29tcGxldGVOb25aZXJvJykuc2FtcGxlLmJyZWFrZG93bjtcblx0XHRcdHZhciBjaGFydERhdGEgPSBbXTtcblx0XHRcdHZhciBsZWdlbmRzID0gW107IFxuXHRcdFx0XyhicmVha2Rvd24pLmVhY2goZnVuY3Rpb24oYiwgbmFtZSlcblx0XHRcdHtcblx0XHRcdFx0Y2hhcnREYXRhLnB1c2goe3ZhbHVlOiBiLmJ5dGVzLCBsYWJlbDogbmFtZSwgY29sb3I6IHNlbGYuY29sb3JzW25hbWVdfSk7XG5cdFx0XHRcdGxlZ2VuZHMucHVzaCh7bmFtZTogbmFtZSwgY29sb3I6IHNlbGYuY29sb3JzW25hbWVdfSk7XG5cdFx0XHR9KTsgXG5cblx0XHRcdHZhciBsZWdlbmRIdG1sID0gVXRpbC5idWlsZExlZ2VuZEh0bWwobGVnZW5kcyk7IFxuXHRcdFx0c2VsZi4kKCdbZGF0YS1sZWdlbmQ9XCInK3Rlc3RJZCsnXCJdJykuaHRtbChsZWdlbmRIdG1sKTtcblxuXHRcdFx0dmFyIGNhbnZhcyA9IHNlbGYuJCgnW2RhdGEtY2FudmFzLXRlc3QtaWQ9XCInK3Rlc3RJZCsnXCJdJykuZ2V0KDApO1xuXHRcdFx0dmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdFx0dmFyIG15UGllQ2hhcnQgPSBuZXcgQ2hhcnQoY3R4KS5QaWUoY2hhcnREYXRhLCB7fSk7XG5cdFx0fSk7IFxuXHRcdFxuXHR9XG59KTsiLCJ2YXIgUmVwb3J0VmlldyA9IHJlcXVpcmUoJy4vUmVwb3J0VmlldycpXG4sXHRIb21lVmlldyA9IHJlcXVpcmUoJy4vSG9tZVZpZXcnKVxuLFx0VXRpbCA9IHJlcXVpcmUoJy4vVXRpbCcpXG4sXHRSZXBvcnRDb21wYXJlVmlldyA9IHJlcXVpcmUoJy4vUmVwb3J0Q29tcGFyZVZpZXcnKVxuLFx0UmVwb3J0VmlzdWFsUHJvZ3Jlc3NDb21wYXJlVmlldyA9IHJlcXVpcmUoJy4vUmVwb3J0VmlzdWFsUHJvZ3Jlc3NDb21wYXJlVmlldycpXG4sXHRWaWRlb0ZyYW1lc1ZpZXcgPSByZXF1aXJlKCcuL1ZpZGVvRnJhbWVzVmlldycpXG4sXHRSZXNvdXJjZUJyZWFrZG93blZpZXcgPSByZXF1aXJlKCcuL1Jlc291cmNlQnJlYWtkb3duVmlldycpXG4gXG4vLyAsXHROZXR3b3JrVmlldyA9IHJlcXVpcmUoJy4vTmV0d29ya1ZpZXcnKTtcblxuLy9AbW9kdWxlIHdwdGlucXVpcmVyLmh0bWwgQGNsYXNzIFJvdXRlciBAZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuUm91dGVyLmV4dGVuZCh7XG5cdFxuXHRyb3V0ZXM6IHtcblx0XHQnJzogJ2hvbWUnXG5cblx0LFx0J3JlcG9ydC86dGVzdElkJzogJ3JlcG9ydCdcblx0LFx0J3JlcG9ydC86dGVzdElkPzpvcHRpb25zJzogJ3JlcG9ydCdcblxuXHQsXHQncmVwb3J0Q29tcGFyZS86dGVzdElkcyc6ICdyZXBvcnRDb21wYXJlJ1xuXHQsXHQncmVwb3J0Q29tcGFyZS86dGVzdElkcz86b3B0aW9ucyc6ICdyZXBvcnRDb21wYXJlJ1xuXG5cdCxcdCd2aXN1YWxQcm9ncmVzc0NvbXBhcmUvOnRlc3RJZHMnOiAndmlzdWFsUHJvZ3Jlc3NDb21wYXJlJ1xuXHQsXHQndmlzdWFsUHJvZ3Jlc3NDb21wYXJlLzp0ZXN0SWRzPzpvcHRpb25zJzogJ3Zpc3VhbFByb2dyZXNzQ29tcGFyZSdcblxuXHQsXHQncmVzb3VyY2VCcmVha2Rvd24vOnRlc3RJZHMnOiAncmVzb3VyY2VCcmVha2Rvd24nXG5cdCxcdCdyZXNvdXJjZUJyZWFrZG93bi86dGVzdElkcz86b3B0aW9ucyc6ICdyZXNvdXJjZUJyZWFrZG93bidcblxuXHQsXHQndmlkZW9GcmFtZXMvPzpvcHRpb25zJzogJ3ZpZGVvRnJhbWVzJ1xuXG5cdCxcdCduZXR3b3JrLzp0ZXN0SWRzJzogJ25ldHdvcmsnXG5cdCxcdCduZXR3b3JrLzp0ZXN0SWRzPzpvcHRpb25zJzogJ25ldHdvcmsnXG5cdH1cblxuLFx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oYXBwbGljYXRpb24pXG5cdHtcblx0XHR0aGlzLmFwcGxpY2F0aW9uID0gYXBwbGljYXRpb247XG5cdH1cblxuXHQvL0BtZXRob2QgaG9tZSBkaXNwYXRjaCB0aGUgLyB1cmwgdGhhdCBzaG93cyBhbGwgdGhlIHRlc3QgZGVmaW5pdGlvbnMgYW5kIGxldCB0aGUgdXNlciBkbyByZXBvcnRpbmcgYW5kIGluIHRoZSBmdXR1cmUgcmUtcnVuIGl0LlxuLFx0aG9tZTogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdC8vIFV0aWwuZ2V0VGVzdHNNZXRhZGF0YSgpLmRvbmUoZnVuY3Rpb24obWV0YWRhdGEpXG5cdFx0Ly8ge1x0XHRcdFxuXHRcdC8vIFx0dmFyIHZpZXcgPSBuZXcgSG9tZVZpZXcoe2FwcGxpY2F0aW9uOiBzZWxmLmFwcGxpY2F0aW9uLCBtZXRhZGF0YTogbWV0YWRhdGF9KTtcblx0XHQvLyBcdHNlbGYuYXBwbGljYXRpb24uc2hvd1ZpZXcodmlldyk7XG5cdFx0Ly8gfSk7IFxuXHRcdHZhciB2aWV3ID0gbmV3IEhvbWVWaWV3KHthcHBsaWNhdGlvbjogc2VsZi5hcHBsaWNhdGlvbn0pO1xuXHRcdHNlbGYuYXBwbGljYXRpb24uc2hvd1ZpZXcodmlldyk7XG5cdH1cblxuXHQvL0BtZXRob2QgcmVwb3J0IGRpc3BhdGNoIHRoZSAvcmVwb3J0IHVybCB0aGF0IHNob3dzIGEgcmVwb3J0IG9mIE9ORSBleGlzdGluZyB0ZXN0IGRlZmluaXRpb25cbixcdHJlcG9ydDogZnVuY3Rpb24odGVzdElkLCBvcHRpb25zKVxuXHR7XG5cdFx0dmFyIHBhcnNlZE9wdGlvbnMgPSBVdGlsLnBhcnNlT3B0aW9ucyhvcHRpb25zKTtcblx0XHR2YXIgdmlldyA9IG5ldyBSZXBvcnRWaWV3KHthcHBsaWNhdGlvbjogdGhpcy5hcHBsaWNhdGlvbiwgdGVzdElkOiB0ZXN0SWQsIG9wdGlvbnM6IHBhcnNlZE9wdGlvbnN9KTtcblx0XHR0aGlzLmFwcGxpY2F0aW9uLnNob3dWaWV3KHZpZXcpOyBcblx0fVxuXG5cdC8vQG1ldGhvZCByZXBvcnRDb21wYXJlIGRpc3BhdGNoIHRoZSAvcmVwb3J0Q29tcGFyZSB1cmwgdGhhdCBzaG93cyByZXBvcnRzIG51bWJlcnMgY29tcGFyaXNpb24gb2YgZGlmZmVyZW50IHZpZ2VuIHRlc3RzICBkZWZpbml0aW9uc1xuLFx0cmVwb3J0Q29tcGFyZTogZnVuY3Rpb24odGVzdElkcywgb3B0aW9ucylcblx0e1x0XHRcblx0XHR2YXIgcGFyc2VkT3B0aW9ucyA9IFV0aWwucGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciB2aWV3ID0gbmV3IFJlcG9ydENvbXBhcmVWaWV3KHthcHBsaWNhdGlvbjogdGhpcy5hcHBsaWNhdGlvbiwgdGVzdElkczogdGVzdElkcywgb3B0aW9uczogcGFyc2VkT3B0aW9uc30pO1xuXHRcdHRoaXMuYXBwbGljYXRpb24uc2hvd1ZpZXcodmlldyk7IFxuXHR9XG5cblx0Ly9AbWV0aG9kIHJlcG9ydENvbXBhcmUgZGlzcGF0Y2ggdGhlIC9yZXBvcnRDb21wYXJlIHVybCB0aGF0IHNob3dzIHJlcG9ydHMgbnVtYmVycyBjb21wYXJpc2lvbiBvZiBkaWZmZXJlbnQgdmlnZW4gdGVzdHMgIGRlZmluaXRpb25zXG4sXHRyZXNvdXJjZUJyZWFrZG93bjogZnVuY3Rpb24odGVzdElkcywgb3B0aW9ucylcblx0e1x0XHRcblx0XHR2YXIgcGFyc2VkT3B0aW9ucyA9IFV0aWwucGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciB2aWV3ID0gbmV3IFJlc291cmNlQnJlYWtkb3duVmlldyh7YXBwbGljYXRpb246IHRoaXMuYXBwbGljYXRpb24sIHRlc3RJZHM6IHRlc3RJZHMsIG9wdGlvbnM6IHBhcnNlZE9wdGlvbnN9KTtcblx0XHR0aGlzLmFwcGxpY2F0aW9uLnNob3dWaWV3KHZpZXcpOyBcblx0fVxuXHQvL0BtZXRob2QgcmVwb3J0Q29tcGFyZSBkaXNwYXRjaCB0aGUgL3JlcG9ydENvbXBhcmUgdXJsIHRoYXQgc2hvd3MgcmVwb3J0cyBudW1iZXJzIGNvbXBhcmlzaW9uIG9mIHZpc3VhbCBwcm9ncmVzcyBmb3IgZ2l2ZW4gdGVzdCBkZWZpbml0aW9uc1xuLFx0dmlzdWFsUHJvZ3Jlc3NDb21wYXJlOiBmdW5jdGlvbih0ZXN0SWRzLCBvcHRpb25zKVxuXHR7XG5cdFx0dmFyIHBhcnNlZE9wdGlvbnMgPSBVdGlsLnBhcnNlT3B0aW9ucyhvcHRpb25zKTtcblx0XHR2YXIgdmlldyA9IG5ldyBSZXBvcnRWaXN1YWxQcm9ncmVzc0NvbXBhcmVWaWV3KHthcHBsaWNhdGlvbjogdGhpcy5hcHBsaWNhdGlvbiwgdGVzdElkczogdGVzdElkcywgb3B0aW9uczogcGFyc2VkT3B0aW9uc30pO1xuXHRcdHRoaXMuYXBwbGljYXRpb24uc2hvd1ZpZXcodmlldyk7IFxuXHR9XG5cdC8vQG1ldGhvZCB2aWRlb0ZyYW1lcyBkaXNwYXRjaCB0aGUgL3ZpZGVvRnJhbWVzIHVybCB0aGF0IHNob3dzIGNvbXBhcmlzaW9uIGJldHdlZW4gdHdvIG9yIG1vcmUgc2FtcGxlcyB2aWRlbyBzdHJpcCBmcmFtZXMgaW4gdGltZVxuLFx0dmlkZW9GcmFtZXM6IGZ1bmN0aW9uKG9wdGlvbnMpXG5cdHtcblx0XHR2YXIgcGFyc2VkT3B0aW9ucyA9IFV0aWwucGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuXHRcdHZhciB2aWV3ID0gbmV3IFZpZGVvRnJhbWVzVmlldyh7YXBwbGljYXRpb246IHRoaXMuYXBwbGljYXRpb24sIG9wdGlvbnM6IHBhcnNlZE9wdGlvbnN9KTtcblx0XHR0aGlzLmFwcGxpY2F0aW9uLnNob3dWaWV3KHZpZXcpOyBcblx0fVxuXG59KTsgIiwiXG4vLyBAbW9kdWxlIHdwdGlucXVpcmVyLmh0bWwgQGNsYXNzIFJlcG9ydFZpc3VhbFByb2dyZXNzQ29tcGFyZVZpZXcgZGlzcGxheSBnaXZlbiB0ZXN0IGRlc2NyaXB0aW9uIC0gXG4vLyBjb21tb25seSB1c2VkIGFzIGEgc3Vidmlldy4gQGV4dGVuZHMgQWJzdHJhY3RWaWV3XG5cbnZhciBBYnN0cmFjdFZpZXcgPSByZXF1aXJlKCcuL0Fic3RyYWN0VmlldycpXG4sXHRVdGlsID0gcmVxdWlyZSgnLi9VdGlsJylcbixcdERhdGFFeHRyYWN0b3IgPSByZXF1aXJlKCcuL0RhdGFFeHRyYWN0b3InKTsgXG5cbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RWaWV3LmV4dGVuZCh7XG5cblx0dGVtcGxhdGU6ICd0ZXN0LWRlc2NyaXB0aW9uLmh0bWwnXG5cbixcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpXG5cdHtcblx0XHR0aGlzLmFwcGxpY2F0aW9uID0gb3B0aW9ucy5hcHBsaWNhdGlvbjtcblx0XHR0aGlzLnJlcG9ydElkID0gb3B0aW9ucy5yZXBvcnRJZDtcblx0XHQvLyB0aGlzLnRlc3RJZHMgPSBvcHRpb25zLnRlc3RJZHM7XG5cdFx0dGhpcy50ZXN0RGF0YSA9IG9wdGlvbnMudGVzdERhdGE7IFxuXHR9XG5cbi8vICxcdGFmdGVyUmVuZGVyOiBmdW5jdGlvbigpXG4vLyBcdHtcbi8vIFx0XHR2YXIgc2VsZiA9IHRoaXM7IFxuLy8gXHRcdHZhciBhVGVzdElkID0gdGhpcy50ZXN0SWRzWzBdO1xuLy8gXHRcdFV0aWwuZ2V0VGVzdERhdGEoYVRlc3RJZCkuZG9uZShmdW5jdGlvbihkYXRhKVxuLy8gXHRcdHtcbi8vIFx0XHRcdHNlbGYudGVzdERhdGEgPSBkYXRhO1xuLy8gXHRcdFx0c2VsZi5kYXRhRXh0cmFjdG9yID0gbmV3IERhdGFFeHRyYWN0b3IoZGF0YSk7XG4vLyBcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2VsZi5yZW5kZXIoKTt9LCAxNTAwKTsgXG4vLyBcdFx0fSk7IFx0XG4vLyBcdH1cbn0pOyAiLCIvLyBAbW9kdWxlIHdwdGlucXVpcmVyLmh0bWwgQGNsYXNzIFV0aWwgbWlzYyB1dGlsaXRpZXNcbm1vZHVsZS5leHBvcnRzID0ge1xuXHRcblxuXHRnZXRUZXN0c01ldGFkYXRhOiBmdW5jdGlvbigpXG5cdHtcblx0XHQvLyB0aGlzLmdldFRlc3RzTWV0YWRhdGFQcm9taXNlID0gdGhpcy5nZXRUZXN0c01ldGFkYXRhUHJvbWlzZSB8fCBqUXVlcnkuZ2V0SlNPTignLi4vdGVzdERhdGEvbWV0YWRhdGEuanNvbicpOyBcblx0XHQvLyByZXR1cm4gdGhpcy5nZXRUZXN0c01ldGFkYXRhUHJvbWlzZTsgXG5cblx0XHQvLyB0aGlzLmdldFRlc3RzTWV0YWRhdGFQcm9taXNlID0gdGhpcy5nZXRUZXN0c01ldGFkYXRhUHJvbWlzZSB8fCB7fTsgXG5cdFx0dmFyIHByb21pc2U7IFxuXHRcdGlmKHRoaXMuZ2V0VGVzdHNNZXRhZGF0YVByb21pc2UpXG5cdFx0e1xuXHRcdFx0cHJvbWlzZSA9IHRoaXMuZ2V0VGVzdHNNZXRhZGF0YVByb21pc2U7IFxuXHRcdH1cblx0XHRlbHNlIGlmKHdpbmRvdy5fd2VicGFnZXRlc3RpbnF1aXJlcl9kYXRhKVxuXHRcdHtcblx0XHRcdHByb21pc2UgPSBqUXVlcnkuRGVmZXJyZWQoKTtcblx0XHRcdHZhciBkYXRhID0gd2luZG93Ll93ZWJwYWdldGVzdGlucXVpcmVyX2RhdGEubWV0YWRhdGE7IFxuXHRcdFx0cHJvbWlzZS5yZXNvbHZlKGRhdGEpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cHJvbWlzZSA9IGpRdWVyeS5nZXRKU09OKCcuLi90ZXN0RGF0YS9tZXRhZGF0YS5qc29uJyk7IFxuXHRcdH1cblx0XHR0aGlzLmdldFRlc3RzTWV0YWRhdGFQcm9taXNlID0gcHJvbWlzZTsgXG5cdFx0cmV0dXJuIHByb21pc2U7IFxuXHR9XG5cblxuLFx0Z2V0VGVzdERhdGE6IGZ1bmN0aW9uKHRlc3RJZClcblx0e1xuXHRcdHRoaXMuZ2V0VGVzdERhdGFQcm9taXNlcyA9IHRoaXMuZ2V0VGVzdERhdGFQcm9taXNlcyB8fCB7fTsgXG5cdFx0dmFyIHByb21pc2U7IFxuXHRcdC8vIGRlYnVnZ2VyO1xuXHRcdGlmKHRoaXMuZ2V0VGVzdERhdGFQcm9taXNlc1t0ZXN0SWRdKVxuXHRcdHtcblx0XHRcdHByb21pc2UgPSB0aGlzLmdldFRlc3REYXRhUHJvbWlzZXNbdGVzdElkXTsgXG5cdFx0fVxuXHRcdGVsc2UgaWYod2luZG93Ll93ZWJwYWdldGVzdGlucXVpcmVyX2RhdGEpXG5cdFx0e1xuXHRcdFx0cHJvbWlzZSA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXHRcdFx0dmFyIGRhdGEgPSBbd2luZG93Ll93ZWJwYWdldGVzdGlucXVpcmVyX2RhdGEudGVzdHNbdGVzdElkXV07IFxuXHRcdFx0cHJvbWlzZS5yZXNvbHZlKGRhdGEpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cHJvbWlzZSA9IGpRdWVyeS5nZXRKU09OKCcuLi90ZXN0RGF0YS8nICsgdGVzdElkICsgJy9kYXRhLmpzb24nKTsgXG5cdFx0fVxuXHRcdHRoaXMuZ2V0VGVzdERhdGFQcm9taXNlc1t0ZXN0SWRdID0gcHJvbWlzZTsgXG5cdFx0cmV0dXJuIHByb21pc2U7IFxuXHR9XG5cbixcdGdldFRlc3RzRGF0YTogZnVuY3Rpb24odGVzdElkcylcblx0e1xuXHRcdHZhciBwcm9taXNlcyA9IFtdLCBzZWxmID0gdGhpcywgcHJvbWlzZSA9IGpRdWVyeS5EZWZlcnJlZCgpOyBcblx0XHRfKHRlc3RJZHMpLmVhY2goZnVuY3Rpb24odGVzdElkKVxuXHRcdHtcblx0XHRcdHByb21pc2VzLnB1c2goc2VsZi5nZXRUZXN0RGF0YSh0ZXN0SWQpKTtcblx0XHR9KTsgXG5cdFx0alF1ZXJ5LndoZW4uYXBwbHkoalF1ZXJ5LCBwcm9taXNlcykuZG9uZShmdW5jdGlvbigpXG5cdFx0e1xuXHRcdFx0dmFyIHRlc3RzID0gW107IFxuXHRcdFx0Xyhhcmd1bWVudHMpLmVhY2goZnVuY3Rpb24oYXJnKVxuXHRcdFx0e1xuXHRcdFx0XHR0ZXN0cy5wdXNoKGFyZ1swXSk7IFxuXHRcdFx0fSk7XG5cdFx0XHRwcm9taXNlLnJlc29sdmUoe3Rlc3RzOnRlc3RzfSk7XG5cdFx0fSk7IFxuXHRcdHJldHVybiBwcm9taXNlOyBcblx0fVxuXG4sXHRsb2FkVmlzOiBmdW5jdGlvbigpXG5cdHtcblx0XHR2YXIgcHJvbWlzZSA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXHRcdHRvYXN0KFxuXHRcdFx0J2xpYi92aXMvZGlzdC92aXMubWluLmpzJ1xuXHRcdCxcdCdsaWIvdmlzL2Rpc3QvdmlzLm1pbi5jc3MnXG5cdFx0LFx0ZnVuY3Rpb24oKVxuXHRcdFx0e1xuXHRcdFx0XHRwcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdH1cblx0XHQpOyBcblx0XHRyZXR1cm4gcHJvbWlzZTsgXG5cdH1cblxuXG4sXHRvcGVuSW5OZXdUYWI6IGZ1bmN0aW9uKHVybCkgXG5cdHtcblx0XHR2YXIgd2luID0gd2luZG93Lm9wZW4odXJsLCAnX2JsYW5rJyk7XG5cdFx0d2luLmZvY3VzKCk7XG5cdH1cblxuLFx0Y2hhcnRqc1NraXBMYWJlbHM6IGZ1bmN0aW9uKGxhYmVscywgc2tpcClcblx0e1xuXHRcdHZhciBuZXdMYWJlbHMgPSBbXTsgXG5cdFx0XyhsYWJlbHMpLmVhY2goZnVuY3Rpb24obGFiZWwsIGluZGV4KVxuXHRcdHtcblx0XHRcdGlmKGluZGV4ICUgc2tpcCAhPT0gMClcblx0XHRcdHtcblx0XHRcdFx0bmV3TGFiZWxzLnB1c2goJycpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRuZXdMYWJlbHMucHVzaChsYWJlbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG5ld0xhYmVsczsgXG5cdH1cblxuXG5cblxuXG5cblx0Ly9DT0xPUlNcblxuLFx0cmFuZG9tSW50OiBmdW5jdGlvbihtaW4sIG1heClcblx0e1xuXHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtYXgpICsgbWluOyBcblx0fVxuXG4sXHRyYW5kb21Db2xvcnNQYWxldHRlOiBbXG5cdFx0e3I6OTMsIGcgOiAxNjUsIGI6IDIxOH1cblx0LFx0e3I6MjUwLCBnOiAxNjQsIGI6IDU4fVxuXHQsXHR7cjogOTYsIGc6IDE4OSwgYjogMTA0fVxuXHQsXHR7cjogMjQxLCBnOiAxMjQsIGI6IDE3Nn1cblx0LFx0e3I6IDE3OCwgZzogMTQ1LCBiOiA0N31cblx0LFx0e3I6IDE3OCwgZzogMTE4LCBiOiAxNzh9XG5cdCxcdHtyOiAyMjIsIGc6IDIwNywgYjogNjN9XG5cdCxcdHtyOiAyNDEsIGc6IDg4LCBiOiA4NH1cblx0LFx0e3I6IDc3LCBnOiA3NywgYjogNzd9XG5cdF1cblxuLFx0cmFuZG9tQ29sb3JJbmRleDogMFxuXG4sXHRyYW5kb21Db2xvclJlc2V0OiBmdW5jdGlvbigpXG5cdHtcblx0XHR0aGlzLnJhbmRvbUNvbG9ySW5kZXggPSAwO1xuXHR9XG5cbixcdHJhbmRvbUNvbG9yUmdiOiBmdW5jdGlvbihhbHBoYSlcblx0e1xuXHRcdHZhciBjID0gdGhpcy5yYW5kb21Db2xvcihhbHBoYSk7IFxuXHRcdHJldHVybiB0aGlzLmNvbG9yVG9SZ2IoYyk7IFxuXHRcdFxuXHR9XG5cbixcdGNvbG9yVG9SZ2I6IGZ1bmN0aW9uKGMpXG5cdHtcblx0XHRpZihjLmEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICdyZ2JhKCcgKyBjLnIgKyAnLCcgKyAgYy5nICsgJywnICsgIGMuYiArICcsJyArIGMuYSArICcpJztcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHJldHVybiAncmdiKCcgKyBjLnIgKyAnLCcgKyAgYy5nICsgJywnICsgIGMuYiArICcpJztcblx0XHR9XG5cdH1cblxuLFx0cmFuZG9tQ29sb3I6IGZ1bmN0aW9uKGFscGhhKVxuXHR7XG5cdFx0dmFyIGMgPSB7cjogdGhpcy5yYW5kb21JbnQoMCwgMjU1KSwgZzogdGhpcy5yYW5kb21JbnQoMCwgMjU1KSwgYjogdGhpcy5yYW5kb21JbnQoMCwgMjU1KX07IFxuXHRcdGlmKHRoaXMucmFuZG9tQ29sb3JzUGFsZXR0ZS5sZW5ndGggPiB0aGlzLnJhbmRvbUNvbG9ySW5kZXgpXG5cdFx0e1xuXHRcdFx0YyA9IHRoaXMucmFuZG9tQ29sb3JzUGFsZXR0ZVt0aGlzLnJhbmRvbUNvbG9ySW5kZXhdOyBcblx0XHRcdHRoaXMucmFuZG9tQ29sb3JJbmRleCsrO1xuXHRcdH1cblx0XHRpZihhbHBoYSlcblx0XHR7XG5cdFx0XHRjLmEgPSBhbHBoYTsgXG5cdFx0fVxuXHRcdHJldHVybiBjO1xuXHR9XG5cblxuXG5cblxuXG5cdC8vIFVSTCBPUFRJT05TXG5cblx0Ly9AbWV0aG9kIHBhcnNlT3B0aW9ucyBAcmV0dXJuIHtPYmplY3Q8U3RyaW5nLFN0cmluZz59XG4sXHRwYXJzZU9wdGlvbnM6IGZ1bmN0aW9uKG9wdGlvbnMsIHByb3BTZXAsIHZhbHVlU2VwKVxuXHR7XG5cdFx0cHJvcFNlcCA9IHByb3BTZXAgfHwgJyYnOyBcblx0XHR2YWx1ZVNlcCA9IHZhbHVlU2VwIHx8ICc9JzsgXG5cdFx0aWYoIW9wdGlvbnMpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHt9OyBcblx0XHR9XG5cdFx0dmFyIHBhcmFtcyA9IHt9O1xuXHRcdF8ob3B0aW9ucy5zcGxpdChwcm9wU2VwKSkuZWFjaChmdW5jdGlvbihwKVxuXHRcdHtcblx0XHRcdHZhciBhID0gcC5zcGxpdCh2YWx1ZVNlcCk7IFxuXHRcdFx0aWYgKGEubGVuZ3RoID49IDIpXG5cdFx0XHR7XG5cdFx0XHRcdHBhcmFtc1thWzBdXSA9IGFbMV07IFxuXHRcdFx0XHRpZighYVsxXSB8fCBhWzFdPT09JzAnIHx8IGFbMV09PT0nZmFsc2UnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGFyYW1zW2FbMF1dID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTsgXG5cdFx0cmV0dXJuIHBhcmFtcztcblx0fVxuXG4sXHRnZXRPcHRpb25zRnJvbUhhc2g6IGZ1bmN0aW9uKGhhc2gpXG5cdHtcblx0XHRoYXNoID0gaGFzaCB8fCB3aW5kb3cubG9jYXRpb24uaGFzaDtcblx0XHR2YXIgb3B0aW9ucyA9IGhhc2guc3BsaXQoJz8nKTtcblx0XHRvcHRpb25zID0gb3B0aW9ucy5sZW5ndGg8MiA/ICcnIDogb3B0aW9uc1sxXTsgXG5cdFx0cmV0dXJuIHRoaXMucGFyc2VPcHRpb25zKG9wdGlvbnMpO1xuXHR9XG5cbixcdHNldE9wdGlvbnNUb0hhc2g6IGZ1bmN0aW9uKGhhc2gsIG5ld09wdGlvbnMpXG5cdHtcdFx0XG5cdFx0aGFzaCA9IGhhc2ggfHwgd2luZG93LmxvY2F0aW9uLmhhc2g7XG5cdFx0dmFyIG9wdGlvbnMgPSBoYXNoLnNwbGl0KCc/Jyk7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMubGVuZ3RoPDIgPyAnJyA6IG9wdGlvbnNbMV07IFxuXHRcdG9wdGlvbnMgPSB0aGlzLnBhcnNlT3B0aW9ucyhvcHRpb25zKTsgXG5cdFx0XyhvcHRpb25zKS5leHRlbmQobmV3T3B0aW9ucyk7XG5cdFx0cmV0dXJuIGhhc2guc3BsaXQoJz8nKVswXSArICc/JyArIHRoaXMub3B0aW9uc1RvU3RyaW5nKG9wdGlvbnMpOyBcblx0fVxuXG4sXHRvcHRpb25zVG9TdHJpbmc6IGZ1bmN0aW9uKG9wdGlvbnMsIHByb3BTZXAsIHZhbHVlU2VwKVxuXHR7XG5cdFx0cHJvcFNlcCA9IHByb3BTZXAgfHwgJyYnOyBcblx0XHR2YWx1ZVNlcCA9IHZhbHVlU2VwIHx8ICc9JzsgXG5cdFx0dmFyIGEgPSBbXTsgXG5cdFx0XyhvcHRpb25zKS5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpXG5cdFx0e1xuXHRcdFx0YS5wdXNoKGtleSArIHZhbHVlU2VwICsgdmFsdWUpOyBcblx0XHR9KTsgXG5cdFx0cmV0dXJuIGEuam9pbihwcm9wU2VwKTsgXG5cdH1cblxuXG5cblx0Ly9EQVRFU1xuXG4sXHRidWlsZFJlZmVyZW5jZURhdGU6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBkYXRlID0gbmV3IERhdGUoMCwwLDAsMCwwLDApO1xuXHRcdHJldHVybiBkYXRlO1xuXHR9XG5cbixcdGJ1aWxkUmVmZXJlbmNlTXNEYXRlOiBmdW5jdGlvbihtcylcblx0e1xuXHRcdHZhciBkYXRlID0gdGhpcy5idWlsZFJlZmVyZW5jZURhdGUoKTsgXG5cdFx0ZGF0ZS5zZXRNaWxsaXNlY29uZHMoZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSArIG1zKTsgXG5cdFx0cmV0dXJuIGRhdGU7XG5cdH1cblx0XG5cblxuXHQvLyBIVE1MIFxuXG4sXHRidWlsZExlZ2VuZEh0bWw6IGZ1bmN0aW9uKGxlZ2VuZHMpXG5cdHtcblx0XHR2YXIgbGVnZW5kSHRtbCA9ICc8c3BhbiBjbGFzcz1cImxlZ2VuZC10aXRsZVwiPkxlZ2VuZDogPC9zcGFuPjx1bCBjbGFzcz1cImxlZ2VuZHNcIj4nO1xuXHRcdF8obGVnZW5kcykuZWFjaChmdW5jdGlvbihsZWdlbmQpXG5cdFx0e1xuXG5cdFx0Ly8gY29uc29sZS5sb2coIGxlZ2VuZC5leHRyYVRleHQpXG5cdFx0XG5cdFx0XHR2YXIgaW5uZXIgPSBsZWdlbmQudXJsID8gXG5cdFx0XHRcdCgnPGEgaHJlZj1cIicrbGVnZW5kLnVybCsnXCI+JyArIGxlZ2VuZC5uYW1lICsgJzwvYT4nKSA6IFxuXHRcdFx0XHQoJzxzcGFuPicrbGVnZW5kLm5hbWUrJzwvc3Bhbj4nKTsgXG5cdFx0XHRpbm5lciA9IGlubmVyICsgKGxlZ2VuZC5leHRyYVRleHR8fCcnKTsgXG5cdFx0XHRsZWdlbmRIdG1sICs9ICc8bGk+PHNwYW4gY2xhc3M9XCJsZWdlbmQtY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6JyArIGxlZ2VuZC5jb2xvciArIFxuXHRcdFx0XHQnXCI+PC9zcGFuPicraW5uZXIrJzwvbGk+JzsgXG5cdFx0fSk7IFxuXHRcdGxlZ2VuZEh0bWwgKz0gJzwvdWw+Jztcblx0XHRyZXR1cm4gbGVnZW5kSHRtbDtcblx0fVxuXG59OyAiLCJcbi8vIEBtb2R1bGUgd3B0aW5xdWlyZXIuaHRtbCBAY2xhc3MgVmlkZW9GcmFtZXNWaWV3IHdpbGwgc2hvdyB0aGUgdmlkZW8gc3RyaXAgZnJhbWVzIG9mIGdpdmVuIHRlc3RzIGZyYW1lcy4gXG4vLyBVc2VkIGluIG90aGVyIHZpZXdzIGxpa2UgUmVwb3J0VmlzdWFscHJvZ3Jlc3NDb21wYXJlVmlldyBAZXh0ZW5kcyBBYnN0cmFjdFZpZXdcblxudmFyIEFic3RyYWN0VmlldyA9IHJlcXVpcmUoJy4vQWJzdHJhY3RWaWV3Jyk7XG52YXIgRGF0YUV4dHJhY3RvciA9IHJlcXVpcmUoJy4vRGF0YUV4dHJhY3RvcicpO1xudmFyIFV0aWwgPSByZXF1aXJlKCcuL1V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdFZpZXcuZXh0ZW5kKHtcblxuXHR0ZW1wbGF0ZTogJ3ZpZGVvRnJhbWVzLmh0bWwnXG5cbixcdGV2ZW50czoge1xuXHRcdCdjbGljayBbZGF0YS1pbWFnZS11cmxdJzogJ3Nob3dGaWxtU3RyaXBGcmFtZUluTW9kYWwnXG5cdCxcdCdjbGljayBbZGF0YS1hY3Rpb249XCJ2aWV3Rmlyc3RWaWV3XCJdJzogJ3ZpZXdGaXJzdFZpZXcnXG5cdCxcdCdjbGljayBbZGF0YS10eXBlPVwiaHRtbC1zbmlwcGV0XCJdJzogJ2h0bWxTbmlwcGV0J1xuXHR9XG5cbixcdGluaXRpYWxpemU6IGZ1bmN0aW9uKG9wdGlvbnMpXG5cdHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLmFwcGxpY2F0aW9uID0gb3B0aW9ucy5hcHBsaWNhdGlvbjtcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zLm9wdGlvbnM7XG5cdFx0dGhpcy50ZXN0RGF0YSA9IFV0aWwucGFyc2VPcHRpb25zKG9wdGlvbnMub3B0aW9ucy50ZXN0cywgJywnLCAnOicpO1xuXHRcdC8vIHRoaXMudGVzdERhdGEgPSBvcHRpb25zLm9wdGlvbnM7XHRcblxuXHRcdC8vaW5pdCB0aGUgZGF0YSBmb3IgdGhlIGNoYXJ0XG5cdFx0dGhpcy52aXN1YWxQcm9ncmVzc0NvbXBhcmVUZXN0cyA9IFtdO1xuXHRcdHRoaXMudGVzdERlZklkcyA9IFtdO1xuXHRcdHRoaXMud3B0VGVzdElkcyA9IFtdOyBcblx0XHR0aGlzLnRlc3RzID0gW107XG5cdFx0Xyh0aGlzLnRlc3REYXRhKS5lYWNoKGZ1bmN0aW9uKHdwdFRlc3RJZCwgdGVzdERlZklkKVxuXHRcdHtcblx0XHRcdHNlbGYudGVzdERlZklkcy5wdXNoKHRlc3REZWZJZCk7IFxuXHRcdFx0c2VsZi53cHRUZXN0SWRzLnB1c2god3B0VGVzdElkKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuZXh0cmFjdG9yQ29uZmlnID0ge307IFxuXHRcdGlmKHRoaXMub3B0aW9ucy52aWV3UmVwZWF0VmlldyAmJiB0aGlzLm9wdGlvbnMudmlld1JlcGVhdFZpZXcgIT09ICcwJylcblx0XHR7XG5cdFx0XHR0aGlzLmV4dHJhY3RvckNvbmZpZy5maXJzdFZpZXcgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuLFx0YWZ0ZXJSZW5kZXI6IGZ1bmN0aW9uKClcblx0e1x0XHRcblx0XHR0aGlzLnJlbmRlckhlYWRlcigpO1xuXHRcdHRoaXMuc2hvd0xvYWRpbmdTdGF0dXMoJ1tkYXRhLXR5cGU9XCJsb2FkaW5nLXNwaW5uZXJcIl0nLCB0cnVlKTsgXG5cblx0XHR2YXIgc2VsZiA9IHRoaXM7IFxuXHRcdFV0aWwuZ2V0VGVzdHNEYXRhKHRoaXMudGVzdERlZklkcykuZG9uZShmdW5jdGlvbihkYXRhKVxuXHRcdHtcblx0XHRcdFV0aWwubG9hZFZpcygpLmRvbmUoZnVuY3Rpb24oKVxuXHRcdFx0e1x0XHRcdFx0XG5cdFx0XHRcdHNlbGYudGVzdHMgPSBkYXRhLnRlc3RzOyBcblx0XHRcdFx0c2VsZi5zaG93TG9hZGluZ1N0YXR1cygnW2RhdGEtdHlwZT1cImxvYWRpbmctc3Bpbm5lclwiXScsIGZhbHNlKTsgXG5cdFx0XHRcdHNlbGYuc2hvd1ZpZGVvRnJhbWVzKCk7XG5cdFx0XHRcdHNlbGYuc2V0VXBGaWxtU3RyaXAoKTtcblx0XHRcdFx0c2VsZi5yZW5kZXIodHJ1ZSk7IFxuXHRcdFx0XHRzZWxmLiQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKHtodG1sOiB0cnVlfSlcblx0XHRcdFx0c2VsZi5yZW5kZXJUaW1lbGluZSgpO1xuXHRcdFx0XHRcblx0XHRcdFx0c2VsZi5yZW5kZXJIZWFkZXIoKTtcblx0XHRcdH0pOyBcblx0XHR9KTtcblx0fVxuXG4sXHRzaG93VmlkZW9GcmFtZXM6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHRoaXMuc2FtcGxlcyA9IHt9XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdF8oc2VsZi50ZXN0cykuZWFjaChmdW5jdGlvbih0ZXN0KVxuXHRcdHtcblx0XHRcdHZhciB0ZXN0RGVmSWQgPSB0ZXN0LnRlc3REZWZpbml0aW9uLnRlc3RJZCBcblx0XHRcdCxcdHdwdFRlc3RJZCA9IHNlbGYudGVzdERhdGFbdGVzdERlZklkXVxuXHRcdFx0LFx0YXJyID0gd3B0VGVzdElkLnNwbGl0KCctJylcblx0XHRcdCxcdHdwdFRlc3RSdW5JbmRleCA9IGFyclsxXTtcblx0XHRcdHdwdFRlc3RJZCA9IGFyclswXTsgXG5cdFx0XHR2YXJcdHRlc3RTYW1wbGUgPSBzZWxmLmZpbmRUZXN0U2FtcGxlKHRlc3QsIHdwdFRlc3RJZCwgd3B0VGVzdFJ1bkluZGV4LCBzZWxmLmV4dHJhY3RvckNvbmZpZyk7IFxuXHRcdFx0c2VsZi5zYW1wbGVzW3Rlc3REZWZJZF0gPSB7aWQ6IHdwdFRlc3RJZCwgc2FtcGxlOiB0ZXN0U2FtcGxlfTsgXG5cdFx0XHRzZWxmLnZpc3VhbFByb2dyZXNzQ29tcGFyZVRlc3RzLnB1c2godGVzdERlZklkKTsgXG5cdFx0fSk7XG5cdH1cblxuXG4sXHRyZW5kZXJUaW1lbGluZTogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIHNlbGYgPSB0aGlzLCB0ZW1wbGF0ZSA9IHRoaXMuYXBwbGljYXRpb24udGVtcGxhdGVzWyd2aWRlb0ZyYW1lc0ZyYW1lLmh0bWwnXTsgXG5cdFx0dmFyIGNvbnRhaW5lciA9IHRoaXMuJCgnW2RhdGEtdHlwZT1cInRpbWVsaW5lXCJdJykuZ2V0KDApOyBcblxuXHRcdHZhciBncm91cHMgPSBbXSwgZ3JvdXBDb3VudGVyID0gMSwgaXRlbXMgPSBbXSwgaXRlbUNvdW50ZXIgPSAwOyBcblx0XHRfKHRoaXMuc2FtcGxlcykuZWFjaChmdW5jdGlvbihzYW1wbGVzLCB0ZXN0SWQpXG5cdFx0e1xuXHRcdFx0Z3JvdXBzLnB1c2goe1xuXHRcdFx0XHRpZDogZ3JvdXBDb3VudGVyXG5cdFx0XHQsXHRjb250ZW50OiB0ZXN0SWQucmVwbGFjZSgvKFteYS14QS1YXSspL2csICc8YnIvPicpIC8vcHV0IHNvbWUgbGluZSBicmVha2luZ3MgdG8gc2F2ZSBzcGFjZSBcblx0XHRcdH0pOyBcblxuXHRcdFx0XyhzYW1wbGVzLnNhbXBsZS52aWRlb0ZyYW1lcykuZWFjaChmdW5jdGlvbihmcmFtZSlcblx0XHRcdHtcblx0XHRcdFx0aXRlbXMucHVzaCh7XG5cdFx0XHRcdFx0aWQ6IGl0ZW1Db3VudGVyXG5cdFx0XHRcdCxcdGNvbnRlbnQ6IGZyYW1lLlZpc3VhbGx5Q29tcGxldGUgKyAnJSdcblx0XHRcdFx0LFx0c3RhcnQ6IGZyYW1lLnRpbWVcblx0XHRcdFx0LFx0Z3JvdXA6IGdyb3VwQ291bnRlclxuXHRcdFx0XHQsXHRpbWFnZTogZnJhbWUuaW1hZ2Vcblx0XHRcdFx0LFx0VmlzdWFsbHlDb21wbGV0ZTogZnJhbWUuVmlzdWFsbHlDb21wbGV0ZVxuXHRcdFx0XHQsXHR0aW1lOiBmcmFtZS50aW1lXG5cdFx0XHRcdH0pOyBcblx0XHRcdFx0aXRlbUNvdW50ZXIrKztcblx0XHRcdFx0Y3VycmVudFZpc3VhbGx5Q29tcGxldGUgPSBmcmFtZS5WaXN1YWxseUNvbXBsZXRlO1x0XHRcblx0XHRcdH0pOyBcblx0XHRcdGdyb3VwQ291bnRlcisrO1x0XHRcdFxuXHRcdH0pOyBcblxuXHRcdC8vY2FsY3VsYXRlIHRoZSBzdGFydCBhbmQgZW5kIHRpbWVzIGZyb20gbXNcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSBcblx0XHR7XG5cdFx0XHR2YXIgaXRlbSA9IGl0ZW1zW2ldOyBcblx0XHRcdHZhciBkYXRlID0gVXRpbC5idWlsZFJlZmVyZW5jZU1zRGF0ZShpdGVtLnN0YXJ0KTsgXG5cdFx0XHQvLyB2YXIgZGF0ZSA9IGJ1aWxkUmVmZXJlbmNlRGF0ZSgpOyBcblx0XHRcdC8vIGRhdGUuc2V0TWlsbGlzZWNvbmRzKGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgKyBpdGVtLnN0YXJ0KTsgXG5cdFx0XHRpdGVtLnN0YXJ0ID0gZGF0ZTsgXG5cdFx0XHRpZihpIDwgaXRlbXMubGVuZ3RoLTEpXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGUgPSBVdGlsLmJ1aWxkUmVmZXJlbmNlTXNEYXRlKGl0ZW1zW2krMV0uc3RhcnQgfHwgMCk7IFxuXHRcdFx0XHQvLyBkYXRlID0gc2VsZi5idWlsZFJlZmVyZW5jZURhdGUoKTtcblx0XHRcdFx0Ly8gZGF0ZS5zZXRNaWxsaXNlY29uZHMoZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSArIGl0ZW1zW2krMV0uc3RhcnR8fDApO1xuXHRcdFx0XHRpdGVtLmVuZCA9IGRhdGU7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBpdGVtc0RhdGFzZXQgPSBuZXcgdmlzLkRhdGFTZXQoaXRlbXMpO1x0XHRcblx0XHR2YXIgb3B0aW9ucyA9IHtcblx0XHRcdC8vIHRpbWVBeGlzOiB7c2NhbGU6ICdtaWxsaXNlY29uZCd9XG5cdFx0XHQvLyB0ZW1wbGF0ZTogXygnPGRpdj5pbWFnZTogPGltZyBzcmM9XCI8JT0gaW1hZ2UlPlwiPjwvaW1nPjwvZGl2PicpLnRlbXBsYXRlKClcblx0XHR9O1xuXHRcdHZhciB0aW1lbGluZSA9IG5ldyB2aXMuVGltZWxpbmUoY29udGFpbmVyLCBudWxsLCBvcHRpb25zKTtcblxuXHRcdHRpbWVsaW5lLnNldEdyb3Vwcyhncm91cHMpO1xuXHRcdHRpbWVsaW5lLnNldEl0ZW1zKGl0ZW1zRGF0YXNldCk7XHRcblx0XHR0aW1lbGluZS5mb2N1cygxKTsgXG5cdFx0dGltZWxpbmUub24oJ3NlbGVjdCcsIGZ1bmN0aW9uIChzZWxlY3Rpb24pIFxuXHRcdHtcblx0XHRcdHZhciBzZWxlY3RlZEl0ZW0gPSBfKGl0ZW1zKS5maW5kKGZ1bmN0aW9uKGl0ZW0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBzZWxlY3Rpb24uaXRlbXNbMF0gPT09IGl0ZW0uaWQ7IFxuXHRcdFx0fSk7IFxuXHRcdFx0c2VsZi5zaG93RnJhbWVEZXRhaWxzSW5Nb2RhbChzZWxlY3RlZEl0ZW0pOyBcblx0XHR9KTtcblx0fVxuXG4sXHRzaG93RmlsbVN0cmlwRnJhbWVJbk1vZGFsOiBmdW5jdGlvbihlKVxuXHR7XG5cdFx0dmFyIGZyYW1lID0ge1xuXHRcdFx0aW1hZ2U6IGpRdWVyeShlLnRhcmdldCkuYXR0cignZGF0YS1pbWFnZS11cmwnKVxuXHRcdCxcdHRpbWU6IGpRdWVyeShlLnRhcmdldCkuYXR0cignZGF0YS1pbWFnZS10aW1lJylcblx0XHQsXHRWaXN1YWxseUNvbXBsZXRlOiBqUXVlcnkoZS50YXJnZXQpLmF0dHIoJ2RhdGEtaW1hZ2UtVmlzdWFsbHlDb21wbGV0ZScpXG5cdFx0fTtcblx0XHR0aGlzLnNob3dGcmFtZURldGFpbHNJbk1vZGFsKGZyYW1lKTtcblx0fVxuXG4sXHRzaG93RnJhbWVEZXRhaWxzSW5Nb2RhbDogZnVuY3Rpb24oZnJhbWUsIHRpdGxlKVxuXHR7XG5cdFx0dGl0bGUgPSB0aXRsZSB8fCAnZnJhbWUgaW1hZ2UnOyBcblx0XHR2YXIgdmlldyA9IG5ldyBBYnN0cmFjdFZpZXcoe1xuXHRcdFx0YXBwbGljYXRpb246IHRoaXMuYXBwbGljYXRpb25cblx0XHR9KTtcblx0XHRfKHZpZXcpLmV4dGVuZChmcmFtZSlcblx0XHR2aWV3LnRlbXBsYXRlID0gJ3ZpZGVvRnJhbWVzRnJhbWUuaHRtbCdcblxuXHRcdHRoaXMuYXBwbGljYXRpb24uc2hvd1ZpZXdJbk1vZGFsKHZpZXcsIHt0aXRsZTogdGl0bGV9KTtcblx0fVxuXG4sXHRnZXRNYXhTdHJpcExlbmd0aDogZnVuY3Rpb24oKVxuXHR7XG5cdFx0dmFyIG0gPSAwO1xuXHRcdF8odGhpcy5maWxtU3RyaXApLmVhY2goZnVuY3Rpb24oc3RyaXApe1xuXHRcdFx0bSA9IE1hdGgubWF4KG0sIHN0cmlwLmxlbmd0aCk7XG5cdFx0fSk7IFxuXHRcdHJldHVybiBtOyBcblx0fVxuXG4sXHRmaW5kVGVzdFNhbXBsZTogZnVuY3Rpb24odGVzdCwgd3B0VGVzdElkLCB3cHRUZXN0UnVuSW5kZXgpXG5cdHtcblx0XHR2YXIgc2FtcGxlRm91bmQsIHNlbGYgPSB0aGlzO1xuXG5cdFx0dmFyIGV4dHJhY3RvciA9IG5ldyBEYXRhRXh0cmFjdG9yKHRlc3QsIHRoaXMuZXh0cmFjdG9yQ29uZmlnKTtcblx0XHQvL1RPRE86IGltcGxlbWVudCBhIGZpbmRTYW1wbGUgbWV0aG9kXG5cdFx0ZXh0cmFjdG9yLml0ZXJhdGVTYW1wbGVzKGZ1bmN0aW9uKHNhbXBsZSlcblx0XHR7XG5cdFx0XHRpZihzYW1wbGUudGVzdElkID09PSB3cHRUZXN0SWQgJiYgc2FtcGxlLnJ1biA9PSBwYXJzZUludCh3cHRUZXN0UnVuSW5kZXgpKVxuXHRcdFx0e1xuXHRcdFx0XHRzYW1wbGVGb3VuZCA9IHNhbXBsZTtcblx0XHRcdH1cblx0XHR9KTsgXG5cdFx0cmV0dXJuIHNhbXBsZUZvdW5kOyAgXG5cdH1cblxuXHQvL0BtZXRob2Qgc2V0VXBGaWxtU3RyaXAgaW5pdCB0aGUgaGlnaCBsZXZlbCB0aGlzLmZpbG1TdHJpcCBkYXRhIHdpdGggZmlsbGVkIHRpbWVzXG4sXHRzZXRVcEZpbG1TdHJpcDogZnVuY3Rpb24oKVxuXHR7XHRcdFxuXHRcdHZhciBzZWxmID0gdGhpcztcblx0XHR0aGlzLmZpbG1TdHJpcCA9IHt9OyBcblx0XHRfKHRoaXMuc2FtcGxlcykuZWFjaChmdW5jdGlvbihzYW1wbGVzLCB0ZXN0SWQpXG5cdFx0e1xuXHRcdFx0c2VsZi5maWxtU3RyaXBbdGVzdElkXSA9IERhdGFFeHRyYWN0b3IucG9ibGF0ZVZpZGVvRnJhbWVzKHNhbXBsZXMuc2FtcGxlKTtcblx0XHR9KTtcblx0XHQvLyBkZWJ1Z2dlcjtcblx0fVxuXG4sXHR2aWV3Rmlyc3RWaWV3OiBmdW5jdGlvbigpXG5cdHtcblx0XHR2YXIgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXHRcdHZhciBvcHRpb25zID0gaGFzaC5pbmRleE9mKCc/JykhPT0tMSA/IGhhc2guc3BsaXQoJz8nKVsxXSA6ICcnO1xuXHRcdG9wdGlvbnMgPSBVdGlsLnBhcnNlT3B0aW9ucyhvcHRpb25zKTsgXG5cdFx0aGFzaCA9IGhhc2guc3BsaXQoJz8nKVswXTsgXG5cdFx0dmFyIHZhbHVlID0gdGhpcy4kKCdbZGF0YS1hY3Rpb249XCJ2aWV3Rmlyc3RWaWV3XCJdOmNoZWNrZWQnKS5zaXplKCk7IFxuXHRcdG9wdGlvbnMudmlld1JlcGVhdFZpZXcgPSB2YWx1ZTtcblx0XHR2YXIgbmF2aWdhdGVIYXNoID0gaGFzaCArICc/JyArIFV0aWwub3B0aW9uc1RvU3RyaW5nKG9wdGlvbnMpOyBcblx0XHRCYWNrYm9uZS5oaXN0b3J5Lm5hdmlnYXRlKG5hdmlnYXRlSGFzaCwge3RyaWdnZXI6IHRydWV9KTsgXG5cdH1cblxuLFx0aHRtbFNuaXBwZXQ6IGZ1bmN0aW9uKClcblx0e1xuXHRcdHZhciBodG1sID0gdGhpcy4kKCcuZmlsbXN0cmlwLWNvbXBhcmlzb24nKS5wYXJlbnQoKS5odG1sKClcblx0XHQsXHR2aWV3ID0gbmV3IEFic3RyYWN0Vmlldyh7YXBwbGljYXRpb246dGhpcy5hcHBsaWNhdGlvbn0pO1xuXHRcdHZpZXcudGVtcGxhdGUgPSBmdW5jdGlvbigpIHtyZXR1cm4gJzx0ZXh0YXJlYT4nK18oaHRtbCkuZXNjYXBlKCkrJzwvdGV4dGFyZWE+JzsgfVxuXHRcdC8vIHZpZXcuJGVsID0galF1ZXJ5KGh0bWwpOyBcblx0XHR0aGlzLmFwcGxpY2F0aW9uLnNob3dWaWV3SW5Nb2RhbCh2aWV3LCB7dGl0bGU6ICdmaWxtIHN0cmlwIGNvbXBhcmlzb24gaHRtbCBzbmlwcGV0ICd9KVxuXHR9XG5cbn0pOyJdfQ==
