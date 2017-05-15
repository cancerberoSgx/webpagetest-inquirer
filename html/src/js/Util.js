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