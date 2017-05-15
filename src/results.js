// Responsabilities in this file: fetch tests results and save tests results into filesystem in folder 
// named with the testId.
var Tool = require('./tool')
,	shell = require('shelljs')
,	path = require('path')
,	request = require('request')
,	_ = require('underscore')
,	Q = require('q')
,	fs = require('fs'); 

_(Tool.prototype).extend({

	//@method getTestResult @return {Deferred}
	getTestResult: function()
	{		
		var deferred = Q.defer()
		,	self = this
		,	testResultUrl = self.config.runTestResponse.jsonUrl;
		request(testResultUrl, function(error, response)
		{
			if (error)
			{
				deferred.reject(error); 
			}
			var testResultResponse = JSON.parse(response.body);
			_(self.config).extend({testResultResponse: testResultResponse.data});
			deferred.resolve(testResultResponse); 
		});
		return deferred.promise;
	}

,	verifyTestResult: function(data)
	{
		var deferred = Q.defer(); 
		data = data || this.config.testResultResponse; 

		//sometimes it happens that the last test state message is 'Completed 2 of 9 test' and then just 'test finish' and it has some null runs...
		_(data.runs).each(function(run)
		{
			if(!run.firstView)
			{				
				deferred.reject('Data verification Error: One or more run samples are empty. Aborting. ');//{fatalError: false, msg: 'Data verification Error: One or more run samples are empty. '}); 
				return;
			}
			if(!run.firstView.videoFrames || !_(run.firstView.videoFrames).keys())
			{
				var inquirer = require('inquirer');
				inquirer.prompt({
					name:'acceptCorruptData'
					,type:'list'
					,choices:['Accept','Abort']
					,message:'Corrupt videoFrames detected in one or more samples, accept corrupt data sample or abort?'
				}, function(answers) 
				{
					if(answers.acceptCorruptData === 'Abort')
					{
						deferred.reject('Corrupt videoFrames detected in one or more samples, Aborting. '); 
					}
				});
			}
		});
		deferred.resolve(data);
		return deferred.promise; 
	}

	//@method saveTestResult
,	saveTestResult: function()
	{
		var testData = this.getTestData(this.config.testId); 
		testData.testResults = testData.testResults || []; 
		if(this.config.testResultResponse)
		{
			// delete the median property because it is a duplicate of a run, we don't use it and we want to reduce output size
			delete this.config.testResultResponse.median; 
			
			testData.testResults.push(this.config.testResultResponse);
		}
		testData.testDefinition = testData.testDefinition || {
				testId: this.config.testId
			,	location: this.config.location
			,	speed: this.config.speed
			,	testCount: this.config.testCount
			,	targetUrl: this.config.targetUrl
			,	runtest_php_url: this.config.runtest_php_url
			}; 
		var dataJsonFile = path.join(this.getTestDataFolder(this.config.testId), 'data.json');
		fs.writeFileSync(dataJsonFile, JSON.stringify(testData));
		this.addToTestMetadata(testData);
	}

	// @method getTestData @returns {TestData} all the data of all the tests run for this testId
,	getTestData: function(testId)
	{
		testId = testId || this.config.testId; 
		this.initTestData();
		var jsonFile = path.join(this.getTestDataFolder(testId), 'data.json');
		var content = fs.readFileSync(jsonFile); 
		return JSON.parse(content); 
	}

	//@method saveTestData @param {String} testId @param {TestData} testData
,	saveTestData: function(testId, testData)
	{
		testId = testId || this.config.testId; 
		this.initTestData();
		var content = JSON.stringify(testData); 
		var jsonFile = path.join(this.getTestDataFolder(testId), 'data.json');
		fs.writeFileSync(jsonFile, content);
	}

,	getTestDataFolder: function(testId)
	{
		return path.join(this.config.testDataFolder, testId);
	}

	// @method initTestData initialize the folder and json file for current test id	
,	initTestData: function()
	{
		if(!shell.test('-d', this.config.testDataFolder))
		{
			shell.mkdir(this.config.testDataFolder); 
		}
		if(this.config.testId)
		{
			var testFolder = this.getTestDataFolder(this.config.testId);
			if(!shell.test('-d', testFolder))
			{
				shell.mkdir('-p', testFolder); 
				fs.writeFileSync(path.join(testFolder, 'data.json'), '{"testResults": []}'); 
			}	
		}
	}

});

// @class TestData it is the data stored in the data.json file for each test. It contains the test definition and also the test results that is an array with all the webpagetests tests executed
// @property {Object} testDefinition @property {Array<Object>}testResults

module.exports = Tool; 