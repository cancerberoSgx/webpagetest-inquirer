//Responsabilities in this file: ask the user questions to define a test. Orchestrate the user by asking data workflow.
var Tool = require('./tool')
,	inquirer = require('inquirer')
,	_ = require('underscore')
,	request = require('request')
,	colors = require('colors/safe')
,	args = require('yargs').argv
,	Q = require('q');

// @module webpatetest.inquirer @class WebPageTestInquirer
_(Tool.prototype).extend({

	
	// @method inquireTest main method that will start inquire the user for the data to define a new test 
	// and then run it and save the results. In the future the same kind of test can be invoked directly 
	// by referencing it by its testId.
	inquireTest: function (cb)
	{
		var self = this; 

		cb = cb || function(){}; 

		this.checkForTemplate(); 

		this.askTestId()

		.then(function()
		{
			return self.getLocations(); 
		})
		.then(function(locations)
		{
			return self.askLocations(locations); 
		})
		.then(function()
		{
			return self.askSpeed(); 
		})

		.then(function()
		{
			return self.askTestCount(); 
		})
		
		.then(function()
		{
			return self.askTargetUrl(); 
		})
		.then(function()
		{
			if(!args.apikey)
			{
				self.saveTestResult(); 
				console.log(colors.yellow('Test definition successfully done. Test instance not created because no apikey was passed. ')); 
				throw 'LEGAL_ESCAPE_EXCEPTION'; 
			}
			return self.startTest(); 
		})
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
			return self.verifyTestResult(); 
		})
		.then(function()
		{	
			self.saveTestResult(); 
			return self.getPromise('resolved');
		})
		.catch(function(error)
		{
			cb(error);
			if(error !== 'LEGAL_ESCAPE_EXCEPTION')
			{
				self.logError(error); 
				throw error;
			}			
		})
		.done(function()
		{
			console.log(colors.green('All work done successfully!')); 
			cb();
		});
	}

	//@method askTestId @returns {Deferred}
,	askTestId: function()
	{
		if(this.config.testId)
		{
			return this.getPromise('resolved');
		}
		//TODO: verify already used test id
		var deferred = Q.defer(), self = this;
		inquirer.prompt({
			//@class WebPageTestInquirer.Config @property {String} testId @required @class WebPageTestInquirer
			name: 'testId'
			, message: 'New Test ID'
			, 'default': this.testDefinitionTemplate.testId || undefined
			, validate: function(val){return val ? true : 'Required'; }
		}, function(answers) 
		{
			_(self.config).extend(answers);
			deferred.resolve(answers);
		});
		return deferred.promise; 		
	}

	//@method askTargetUrl @returns {Deferred}
,	askTargetUrl: function()
	{
		if(this.config.targetUrl)
		{
			return this.getPromise('resolved');
		}
		var deferred = Q.defer(), self = this;
		inquirer.prompt({
			name: 'targetUrl'
			, message: 'Target URL'
			, validate: function(val){return val ? true : 'Required'; }
			, 'default': this.testDefinitionTemplate.targetUrl || undefined
		}, function(answers) 
		{
			_(self.config).extend(answers);
			deferred.resolve(answers);
		});
		return deferred.promise; 		
	}

	//@method askSpeed @returns {Deferred}
,	askSpeed: function()
	{
		if(this.config.speed)
		{
			return this.getPromise('resolved');
		}
		var deferred = Q.defer() 
		,	speedsChoices = []
		,	self = this;
		_(this.speeds).each(function(val, key)
		{
			speedsChoices.push({
				name: key
			,	value: key
			});
		});
		inquirer.prompt({
			//@class WebPageTestInquirer.Config @property {String} speed @required @class WebPageTestInquirer
			name: 'speed'
			, message: 'Connectivity Speed'
			, type: 'list'
			, choices: speedsChoices
			, 'default': this.testDefinitionTemplate.speed || undefined
		}, function(answers) 
		{
			_(self.config).extend(answers);
			deferred.resolve(answers);
		});
		return deferred.promise;
	}

	//@method askTestCount @returns {Deferred}
,	askTestCount: function()
	{
		if(this.config.testCount)
		{
			return this.getPromise('resolved');
		}
		var deferred = Q.defer() 
		,	testCountChoices = []		
		,	self = this;

		for (var i = 1; i < 10; i++) 
		{
			testCountChoices.push({
				name: i + ''
			,	value: i + ''
			}); 
		}
		inquirer.prompt({
			name: 'testCount'
			, message: 'Number of Tests to Run'
			, type: 'list'
			, choices: testCountChoices
			, 'default': this.testDefinitionTemplate.testCount || undefined
		}, function(answers) 
		{
			_(self.config).extend(answers);
			deferred.resolve(answers);
		});
		return deferred.promise;
	}

	//@method askLocations @param {Array} locations @returns {Deferred}
,	askLocations: function(locations)
	{
		if(this.config.location)
		{
			return this.getPromise('resolved');
		}
		var deferred = Q.defer()
		,	self = this 
		,	location_choices = _(locations).map(function(l, key)
		{
			return {
				name: key + ' - ' + l.Label
			,	value: l.location + ':' + l.Browser
			}; 
		}); 
		inquirer.prompt({
			name: 'location'
			, message: 'Location'
			, type: 'list'
			, choices: location_choices
			, 'default': this.testDefinitionTemplate.location || undefined
		}, function(answers) 
		{
			_(self.config).extend(answers);
			deferred.resolve(answers);
		});
		return deferred.promise;
	}

	// @method askTestDefinition ask the user to choose one of existing test definitions --choose-text argument @returns {Deferred}
,	askTestDefinition: function()
	{
		var deferred = Q.defer() 
		,	testDefinitionChoices = []
		,	self = this;
		_(this.metadata).each(function(val, key)
		{
			testDefinitionChoices.push({
				name: key
			,	value: key
			});
		});
		inquirer.prompt({
			name: 'testDefinition'
			, message: 'Existing test definitions'
			, type: 'list'
			, choices: testDefinitionChoices
		}, function(answers) 
		{
			deferred.resolve(answers.testDefinition);
		});
		return deferred.promise;
	}

});


module.exports = Tool;