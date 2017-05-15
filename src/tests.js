//
var Tool = require('./tool')
,	_ = require('underscore')
,	request = require('request')
,	colors = require('colors/safe')
,	Q = require('q')
,	path = require('path')
,	fs = require('fs')
,	querystring = require('querystring');

// @module webpatetest.inquirer @class WebPageTestInquirer
_(Tool.prototype).extend({

	//@method startTest uses the information in this.config and hit webpagetest to run a test. @returns {Deferred} resolved when the response arrives.
	startTest: function() 
	{
		var deferred = Q.defer()
		,	self = this

			//@class WebPageTestInquirer.Config it mostly contains high level names for the 'Submitting test requests' configuration object in https://sites.google.com/a/webpagetest.org/docs/advanced-features/webpagetest-restful-apis 
		,	queryObj = _({

				// @property {String} targetUrl the url we want to hit @required
				url: this.config.targetUrl

				// @property {String} location @required @property {String} speed @required
			,	location: this.config.location + '.' + this.config.speed

				// @property {Number} testCount
			,	runs: this.config.testCount || 1

				// @property {String} apikey wpt apikey @required
			,	k: this.config.apikey

			,	f: 'json'
			,	video: 1
			,	noopt: 1 //Set to 1 to disable optimization checks (for faster testing)

				// @property {Boolean} fvonlyif true then only perform the first view. By default the repeat view is always taken place.
			,	fvonly: this.config.fvonly || undefined

				// @property {Object} wptConfig the pure wptConfig properties, if any given this will have priority
			}).extend(this.config.wptConfig || {})
			//@class WebPageTestInquirer

		,	query = querystring.stringify(queryObj)

		,	url = 'http://www.webpagetest.org/runtest.php?' + query; 

		self.config.runtest_php_url = url; 
		request(url, function(error, response)
		{
			//check for error , .i.e api key usage exceeded
			try
			{
				var body = JSON.parse(response.body); 
				if(body.statusCode === 400)
				{
					console.log(colors.red('ERROR in test request: ' + body.statusText)); 
					deferred.reject(body.statusText); 
				}
			}catch(ex){}
			

			if (error)
			{
				deferred.reject(error); 
			}
			var runTestResponse = JSON.parse(response.body);
			_(self.config).extend({runTestResponse: runTestResponse.data});
			deferred.resolve(runTestResponse); 
		});
		return deferred.promise; 
	}

	//@method iteratively hits testStatus.php to consult a running test status @return {Deferred} resolved when test finnished or reject it on any error.
,	waitTestEnd: function()
	{
		// we will polling to an url like the following till the test has ended: http://www.webpagetest.org/testStatus.php?f=json&test=150407_SK_1DA8
		var deferred = Q.defer()
		,	self = this
		,	test_id = self.config.runTestResponse.testId
		,	query = querystring.stringify({
				test: test_id,
				f: 'json'
			})
		,	url = 'http://www.webpagetest.org/testStatus.php?' + query; 
		
		self.config.test_status_php_url = url; 
		
		console.log('Test has started, waiting it to end. Status URL: ' + url); 

		var	timer_id = setInterval(function()
		{
			request(url, function(error, response)
			{
				if (error)
				{
					deferred.reject(error); 
				}
				if(!response)
				{					
					console.log(colors.red('ERROR in test request: ' + arguments)); 
					deferred.reject(arguments); 
					return;
				}
				var testStatusResponse = JSON.parse(response.body);
				// console.log('testStatus.php response statusCode', testStatusResponse.statusCode); 
				if(testStatusResponse.statusCode === 400) //invalid test id
				{
					clearInterval(timer_id);
					deferred.reject(testStatusResponse.statusText); 
				}
				if(testStatusResponse.statusCode !== 200) //test in the queue
				{
					console.log(colors.yellow(testStatusResponse.statusText)); 
				}
				if(testStatusResponse.statusCode === 200) //test in the queue
				{
					console.log(colors.green(testStatusResponse.statusText)); 
					_(self.config).extend({testStatusResponse: testStatusResponse.data});
					clearInterval(timer_id);
					deferred.resolve(testStatusResponse.data); 
				}
			});

		}, this.config.waitTestEndTimePeriod); 		
		return deferred.promise; 
	}

	// @method executeTest execute an already defined test given its id. @param {String} testId
,	executeTest: function(testId)
	{
		var self = this
		,	jsonFile = path.join(this.config.testDataFolder, testId, 'data.json')
		,	content = fs.readFileSync(jsonFile)
		,	parsed = JSON.parse(content); 

		_(this.config).extend(parsed.testDefinition);

		this.startTest()
		.then(function()
		{
			return self.waitTestEnd(); 
		})
		.then(function()
		{	
			return self.getTestResult(); 
		})
		.then(function()
		{	
			self.saveTestResult(); 
			return self.getPromise('resolved');
		})
		.catch(function(error)
		{
			// console.log('catch self.config', self.config);
			self.logError(error); 
			throw error;
		})
		.done(function()
		{
			// console.log('done self.config', self.config)
		});
	}



	//@method getLocations static method to get wpt locations array @returns {Deferred}
,	getLocations: function()
	{
		//TODO: cache
		var deferred = Q.defer()
		,	locations_url = 'http://www.webpagetest.org/getLocations.php?f=json';

		request(locations_url, function (error, response, body)
		{
			if (error || response.statusCode !== 200)
			{
				var error_msg = 'HTTP error requesting '+locations_url+', status: ' +response.statusCode; 
				deferred.reject(new Error(error_msg));
			}
			else
			{
				var payload = JSON.parse(body)
				,	locations = payload.data;
				deferred.resolve(locations); 
			}
		});
		return deferred.promise; 
	}

	// @property {Object<String,String>} speeds the hardcoded webpagetest supported speeds
,	speeds: {
		'DSL': 'DSL - 1.5 Mbps down, 384 Kbps up, 50 ms first-hop RTT, 0% packet loss'
	,	'Cable': 'Cable - 5 Mbps down, 1 Mbps up, 28ms first-hop RTT, 0% packet loss'
	,	'FIOS': '20 Mbps down, 5 Mbps up, 4 ms first-hop RTT, 0% packet loss (not all locations will get the full bandwidth)'
	,	'Dial': 'Dial - 49 Kbps down, 30 Kbps up, 120 ms first-hop RTT, 0% packet loss'
	,	'3G': '3G - 1.6 Mbps down, 768 Kbps up, 300 ms first-hop RTT, 0% packet loss'
	,	'3GFast': '3GFast - 1.6 Mbps down, 768 Kbps up, 150 ms first-hop RTT, 0% packet loss'
	,	'Native': 'Native - No synthetic traffic shaping applied'
	,	'custom': 'custom - Custom profile, bandwidth and latency must also be specified using the bwIn, bwOut, latency and plr parameters'
	}

});


module.exports = Tool;