var Tool = require('../src/index')
,	args = require('yargs').argv
,	_ = require('underscore')
,	shell = require('shelljs')
,	async = require('async')
,	Q = require('q')
,	request = require('request')
,	path = require('path')
,	wget = require('wget')
,	fs = require('fs')

describe('1', function()
{
	var folderName = 'fromJasmine1Data'; 
	var apikey = args.apikey; 
	beforeEach(function()
	{
		// need to increase jasmine timeout to 5 mins to wait for wpt responses
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 60 * 1000;
	}); 

	// it('hit google.com and wait until finish', function(done)
	// {
	// 	shell.rm('-rf', folderName);

	// 	var config = {
	// 		apikey: apikey
	// 	,	targetUrl: 'https://www.google.com.uy/'
	// 	,	speed: 'FIOS'
	// 	,	location: 'Dulles:Chrome'
	// 	,	testId: 'fromJasmine1'
	// 	,	testCount: 1
	// 	,	fvonly: true //first view only
	// 	,	testDataFolder: folderName
	// 	}; 

	// 	var tool = new Tool(config); 

	// 	// // // _(tool.config).extend(config);

	// 	tool.inquireTest(function(error)
	// 	{
	// 		// console.log('ERROR: '+JSON.stringify(error))
	// 		// console.log('test ended!!', error)
	// 		// console.trace("Here I am!")
	// 		// throw error;

	// 		expect(error).toBe(undefined);
	// 		done();
	// 	});
	// }); 

	// it('should give us some results on expected folder', function(done)
	// {
	// 	// console.log('second it', shell.cat(folderName+'/metadata.json'))
	// 	var metadata = JSON.parse(shell.cat(folderName+'/metadata.json'));
	// 	expect(metadata.fromJasmine1.testId).toBe('fromJasmine1');
	// 	expect(metadata.fromJasmine1.location).toBe('Dulles:Chrome');
	// 	expect(metadata.fromJasmine1.speed).toBe('FIOS');

	// 	var test_data = JSON.parse(shell.cat(folderName+'/fromJasmine1/data.json'));

	// 	expect(/chrome/i.test(test_data.testResults[0].runs[1].firstView.browser_name)).toBe(true); 


	// 	// console.log(test_data.testResults[0].runs[1].firstView.videoFrames)

	// 	var videoFrames = test_data.testResults[0].runs[1].firstView.videoFrames
	// 	,	videoFramesKeys = _(videoFrames).keys()
	// 	,	lastVideoFrame = videoFrames[videoFramesKeys[videoFramesKeys.length-1]]; 
	// 	expect(lastVideoFrame.image.length>0).toBe(true); 
	// 	// console.log('lastVideoFrame', lastVideoFrame); 

	// 	done();
	// }); 












	// just an experiment to see if we can get all the screenshots using different desktop-browsers
	// Dulles_iOS, Dulles_IE8, Dulles_IE9, Dulles_IE10, Dulles_IE11, 
	// Dulles:Chrome, Dulles:Canary, Dulles:Firefox, Dulles:Firefox Nightly, 
	// Dulles:Safari, Dulles_Chrome40,


	var locations = {
		'Dulles:Chrome': {name: 'chrome'}
	,	'Dulles_IE8': {name: 'ie8'}
	,	'Dulles_IE9': {name: 'ie9'}
	,	'Dulles_IE10': {name: 'ie10'}
	};

	var defaultConfig = {
		apikey: apikey
	,	targetUrl: 'https://www.google.com.uy/'
	,	speed: 'FIOS'
	,	location: 'Dulles:Chrome'
	,	testId: 'fromJasmine1'
	,	testCount: 1
	,	fvonly: true //first view only
	,	testDataFolder: folderName
	}; 

	function performTestCommon1(userConfig, callback)
	{
		var config = _(defaultConfig).clone();
		_(config).extend(userConfig);
		var tool = new Tool(config); 
		// _(tool.config).extend(config);
		tool.inquireTest(function(error)
		{
			expect(error).toBe(undefined);
			callback();
		});
	}

	// it('perform the tests in all desktop browsers', function(done)
	// {
	// 	shell.rm('-rf', folderName);

	// 	// if for some reason we need to do it parallel use forEachOfSeries
	// 	async.forEachOf(locations, function (value, key, callback) 
	// 	{
	// 		var config = {
	// 			apikey: apikey
	// 		,	targetUrl: 'https://www.google.com.uy/'
	// 		,	location: key
	// 		,	testId: value.name
	// 		}; 
	// 		console.log('Start test for browser ', key); 
	// 		performTestCommon1(config, callback); 

	// 	}, function (err) 
	// 	{
	// 		console.log('End test for browser ', key); 
	// 		expect(err).toBe(undefined);
	// 		if (err) console.error(err.message);
	// 		done();
	// 	})
	// }); 

	// }); 



	function getFinalVideoFrameUrl(folder, testId)
	{
		var test_data = JSON.parse(shell.cat(folder+'/'+testId+'/data.json'))
		,	videoFrames = test_data.testResults[0].runs[1].firstView.videoFrames
		,	videoFramesKeys = _(videoFrames).keys()
		,	lastVideoFrame = videoFrames[videoFramesKeys[videoFramesKeys.length-1]]; 
		return lastVideoFrame.image;
	}

	//retrieve given test image and save it to filesystem returning its path.@return {Deferred}
	function getFinalVideoFrameImage(folder, testId, outputFolder)
	{
		var url = getFinalVideoFrameUrl(folder, testId)
		,	self = this
		,	deferred = Q.defer();

		var imagePath = path.join(outputFolder, 'myBinaryFile_' + testId + '.jpg');
		var pipe = request(url).pipe(fs.createWriteStream(imagePath));
		pipe.on('close', function()
		{
			console.log('end', imagePath)
			deferred.resolve(imagePath); 
		}); 


		// var download = wget.download(url, imagePath, {});
		// download.on('error', function(err) 
		// {
		// 	console.log('wget '+url+' error: ', err)
		// 	var error_msg = 'HTTP error requesting image url '+url+', error: '+ err; 
		// 	deferred.reject(new Error(error_msg));
		// });
		// download.on('end', function(output) 
		// {
		// 	console.log(output);
		// 	deferred.resolve(imagePath); 
		// });


		// var requestOptions = {
		// 	url:url
		// ,	headers: {
		// 		'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36'
		// 	}
		// }

		// , function (error, response, body)
		// {
		// 	console.log('requesting', url)
		// 	if (error || response.statusCode !== 200)
		// 	{
		// 		var error_msg = 'HTTP error requesting '+locations_url+', status: ' +response.statusCode; 
		// 		deferred.reject(new Error(error_msg));
		// 	}
		// 	else
		// 	{
		// 		// console.log(body.length+' BYTES\n\n')
		// 		var imagePath = path.join(outputFolder, 'myBinaryFile_'+testId+'.jpg');
		// 		var stream = fs.createWriteStream(imagePath);	
		// 		body.pipe(stream);
		// 		// stream.write(body);// var buffer = crypto.randomBytes(100);
				
		// 		// stream.on("end", function() {
		// 		// 	stream.end();
		// 		// });

		// 		// fs.writeFileSync(imagePath, body)

		// 		deferred.resolve(imagePath); 
		// 	}
		// });
		return deferred.promise; 
	}

	var outputFolder = 'outputFolder'; 

	it('get all video frame images', function(done)
	{
		shell.rm('-rf', outputFolder);
		shell.mkdir(outputFolder); 

		async.forEachOf(locations, function (value, key, cb) 
		{
			getFinalVideoFrameImage(folderName, value.name, outputFolder)
			.then(function(image)
			{
				cb();
			})
			.catch(function(err)
			{
				console.log('Error downloading images', err); 
				cb();
			}); 
		}, function (err) 
		{
			console.log('End downloading images'); 
			expect(err).not.toBeTruthy();
			if (err) console.error('ERROR: ', err);
			done();
		})
	}); 

		
















	// it('perform the same but by ourself', function()
	// { //: TODO


	// tool.startTest()
	// 	.then(function()
	// 	{	
	// 		return self.waitTestEnd(); 
	// 	})
	// 	.then(function()
	// 	{	
	// 		return self.getTestResult(); 
	// 	})
	// 	.then(function()
	// 	{	
	// 		return self.verifyTestResult(); 
	// 	})
	// 	.then(function()
	// 	{	
	// 		self.saveTestResult(); 
	// 		return self.getPromise('resolved');
	// 	})
	// 	.catch(function(error)
	// 	{
	// 		cb(error);
	// 		if(error !== 'LEGAL_ESCAPE_EXCEPTION')
	// 		{
	// 			self.logError(error); 
	// 			throw error;
	// 		}			
	// 	})
	// 	.done(function()
	// 	{
	// 		console.log(colors.green('All work done successfully!')); 
	// 		cb();
		// });


	// }); 


});