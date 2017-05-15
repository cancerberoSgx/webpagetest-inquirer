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