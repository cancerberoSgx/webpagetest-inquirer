const Tool = require('../src/index');
const args = require('yargs').argv;
const _ = require('underscore');
const shell = require('shelljs');
// const async = require('async');
// const Q = require('q');
// const request = require('request');
// const path = require('path');
// const fs = require('fs');

describe('1', () => {
  const folderName = 'verifyText';
  const apikey = args.apikey;
  beforeEach(() => {
    // need to increase jasmine timeout to 5 mins to wait for wpt responses
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 60 * 1000;
  });

  it('hit google.com and wait until finish', (done) => {
    shell.rm('-rf', folderName);

    let config = {
      apikey,
			targetUrl: 'https://www.google.com.uy/',
			speed: 'FIOS',
			location: 'Dulles:Chrome',
			testId: 'verifyText',
			testCount: 1,
			fvonly: true, //first view only
			testDataFolder: folderName,

			wptConfig: {
        iq: 100, // no jpeg compression
      },
    };

    let tool = new Tool(config);

    tool.inquireTest((error) => {
			expect(error).toBe(undefined);
			done();
		});
  });


  it('should give us some results on expected folder', (done) => {
    let metadata = JSON.parse(shell.cat(`${folderName}/metadata.json`));
    expect(metadata.verifyText.testId).toBe('verifyText');
    expect(metadata.verifyText.location).toBe('Dulles:Chrome');
    expect(metadata.verifyText.speed).toBe('FIOS');

    let test_data = JSON.parse(shell.cat(`${folderName}/verifyText/data.json`));

    // expect(/chrome/i.test(test_data.testResults[0].runs[1].firstView.browser_name)).toBe(true);


    // console.log(test_data.testResults[0].runs[1].firstView.videoFrames)

    console.log(test_data);
    let videoFrames = test_data.testResults[0].runs[1].firstView.videoFrames,
			videoFramesKeys = _(videoFrames).keys(),
			lastVideoFrame = videoFrames[videoFramesKeys[videoFramesKeys.length - 1]];
    expect(lastVideoFrame.image.length > 0).toBe(true);
    console.log('lastVideoFrame', lastVideoFrame);

    done();
  });
});
