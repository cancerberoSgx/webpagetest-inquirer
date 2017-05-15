//Resposabilities in this file: Be the Main file (invocable) of the tool. Implement the 'command line api'.
// Dispatch a command line with parameters. 

var args = require('yargs').argv
,	Tool = require('./tool')
,	colors = require('colors')
,	_ = require('underscore'); 

require('./inquirer');
require('./results');
require('./tests');
require('./reports');
require('./html');

function checkOrDie(b, msg)
{	
	if(!b)
	{
		console.log(colors.red(msg));
		process.exit(1); 
	}
}

var tool = new Tool({apikey: args.apikey});

if(args.test)
{
	checkOrDie(args.apikey, 'Error: you must pass an apikey, example: --apikey=AB2C4D5E6F6G');
	tool.executeTest(args.test); 
}
else if(args.chooseTest)
{
	checkOrDie(args.apikey, 'Error: you must pass an apikey, example: --apikey=AB2C4D5E6F6G');
	tool.askTestDefinition().done(function(testId)
	{		
		tool.executeTest(testId); 
	});
}
else if(args.report)
{
	tool.runReport(args.report); 
}
else if(args.renameTest)
{
	tool.renameTestDefinition.apply(tool, args.renameTest.split(',')); 
}
else if(args.staticHtml)
{
	tool.generateStaticHtml(); 
}
else if(args.removeTest)
{
	tool.removeTestDefinition(args.removeTest); 
}
else if(args.removeTestRun)
{
	tool.removeTestDefinitionRun.apply(tool, args.removeTestRun.split(',')); 
}
else if(args.addToMetadata)
{
	tool.addToMetadata(args.addToMetadata); 
}

else if(args.dumpLocations)
{
	tool.getLocations().done(function(locations)
	{
		console.log('Available locations: ', _(locations).keys().join(', ')); 
		console.log('Available speeds: ', _(tool.speeds).keys().join(', '));
	}); 
}
else
{
	tool.inquireTest();
}