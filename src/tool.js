var	_ = require('underscore')
,	Q = require('q')
,	colors = require('colors/safe')

,	args = require('yargs').argv
,	path = require('path')
,	shell = require('shelljs')
,	fs = require('fs'); 

// @module webpatetest.inquirer @class WebPageTestInquirer
// @constructor @param {String}apikey
var Tool = function(config)
{
	//@class WebPageTestInquirer.Config
	this.config = {
		// @property {String} apiKey
		apikey: config.apikey
		// @property {Number} waitTestEndTimePeriod ms to wait in the setInterval for checking a running test status.
	,	waitTestEndTimePeriod: 10000
		// @property {String} testDataFolder
	,	testDataFolder: config.testDataFolder || 'testData'
	}; 

	_(this.config).extend(config); 
	
	// @class WebPageTestInquirer
	// @property {Object} testDefinitionTemplate
	this.testDefinitionTemplate = {}; 
	this.initMetadata();
	this.checkForTemplate(); 
}; 


_(Tool.prototype).extend({

	//@method logError @param {String} msg @param {Boolean} exit
	logError: function (msg, exit)
	{
		console.log(colors.red(msg));
		if(exit)
		{
			process.exit(1); 
		}
	}

	//@method getPromise @param {String} state  ccan be 'pending', 'resolved', 'rejected'
	//@return {Deferred} a promise  in the state of the parameter. If parameter is falsy it will return a pending promise.
,	getPromise: function(state)
	{
		var deferred =  Q.defer(); 
		if(state==='resolved')
		{			
			deferred.resolve();	
		}
		return deferred.promise;
	}

,	getMetadataFilePath: function()
	{
		return path.join(this.config.testDataFolder, 'metadata.json'); 
	}

,	initMetadata: function()
	{
		var metadataFile = this.getMetadataFilePath();
		if(!shell.test('-f', metadataFile))
		{
			shell.mkdir('-p', this.config.testDataFolder); 
			fs.writeFileSync(metadataFile, '{}'); 
		}
		//@property {Object} metadata testids -> testDescription mapping stored in metadata.json file - contains all tests definitions
		this.metadata = JSON.parse(fs.readFileSync(metadataFile));
	}

,	addToTestMetadata: function(data)
	{		
		var testMetadata = _(data.testDefinition).clone();
		delete testMetadata.runtest_php_url; 
		this.metadata[data.testDefinition.testId] = testMetadata; 
		this.saveMetadata(); 
	}

	//@method saveMetadata saves current this.metadata to disk
,	saveMetadata: function()
	{
		fs.writeFileSync(this.getMetadataFilePath(), JSON.stringify(this.metadata)); 
	}

	//@method checkForTemplate if a --template is passed we sotore its test definition in this.testDefinitionTemplate
,	checkForTemplate: function()
	{
		if(args.template)
		{
			if(this.metadata[args.template])
			{
				//@property {Object} testDefinitionTemplate
				this.testDefinitionTemplate = this.metadata[args.template] || {}; 
			}
			else
			{
				console.log(colors.red('Template ' + args.template + ' not found, none used.')); 
			}
		}
	}

,	removeTestDefinition: function(testId)
	{
		delete this.metadata[testId];
		this.saveMetadata();
		// console.log(this.getTestDataFolder(testId))
		shell.rm('-rf', this.getTestDataFolder(testId));
		console.log(colors.green('Test definition "' + testId + '"" succesfully removed.')); 
	}

,	renameTestDefinition: function(testId, newTestId)
	{
		this.metadata[newTestId] = this.metadata[testId]; 
		delete this.metadata[testId]; 
		this.saveMetadata();
		var testData = this.getTestData(testId); 
		testData.testDefinition.testId = newTestId; 
		this.saveTestData(newTestId, testData); 		
		shell.rm('-rf', this.getTestDataFolder(testId));
	}

,	removeTestDefinitionRun: function(testId, run)
	{
		var testData = this.getTestData(testId); 
		testData.testResults.splice(run, 1);
		this.saveTestData(testId, testData); 
		console.log(colors.green('Test definition "' + testId + '"" run index ' + run + ' succesfully removed.')); 
	}

,	addToMetadata: function(testDataFolder)
	{
		var data = fs.readFileSync(path.join(testDataFolder, 'data.json'));
		data = JSON.parse(data); 
		this.metadata[data.testDefinition.testId] = data.testDefinition; 
		this.saveMetadata();
	}

});


module.exports = Tool;