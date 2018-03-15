[![Build Status](https://travis-ci.org/cancerberoSgx/webpagetest-inquirer.png?branch=master)](https://travis-ci.org/cancerberoSgx/webpagetest-inquirer)
[![Greenkeeper badge](https://badges.greenkeeper.io/cancerberoSgx/webpagetest-inquirer.svg)](https://greenkeeper.io/)
[![Dependencies](https://david-dm.org/cancerberosgx/webpagetest-inquirer.svg)](https://david-dm.org/cancerberosgx/webpagetest-inquirer)


# webpagetest inquirer

Agile definition of *define webpagetest.org tests* in the command line interactively and and *run* test multiple times, easily and programatically, all from the *command line* in a non interactively way.

Also it contains a html application that shows reports of the test results, with a big emphasis in comparing the visual progress of two or more tests.

Ideal for automation performance test resports and Continous Integration


# Why?

Initial page rendering is one of the most important things to optimize in a web page, specially in a single page app. webpagettest.org is definetely the best tool for diagnosing how a page is shown to a user when loding. This tool allow two things webpagetest don't offer out of the box and is:

 * Be able to store test results in your hard drive permanently and see results offline
 * accumulate more and more test results in a single 'test definition'
 * better comparision of visual progress (filmstrip view) and other relevant measures
 * more options of choosing the sample to show (median with respect of a certain measure, average)



# Setup

Make sure you have node, bower and gulp installed on your system, if unsure of the later, execute the following command (only once):

	sudo npm install -g bower gulp

Then download and setup webpagetest-inquirer:

	git clone https://github.com/cancerberoSgx/webpagetest-inquirer.git
	cd webpagetest-inquirer
	npm install
	bower install


# Using it: defining tests and run them in the cmd line

Define a new test definition with interactive questions

	node src/main.js --apikey=mywebpagetestapike

Run an existing test definition. You won't be asked anything here, the existing test definition runs and the data will be accumulated. The --test value is the id of aan existing test definition:

	node src/main.js --apikey=mywebpagetestapike --test=myproject_searchpage_mobile_2

Run a test but being asked to choose from all existing test definitions:

	node src/main.js --apikey=mywebpagetestapike --choose-test




# Using it: generating tests reports

Tests reports are displayed using an html application. First you must turn the server on with the command:

	gulp run

and then open the html application in the browser:

	firefox http://localhost:8080/html

Also you can generate a *static HTML file* that can be opened locally without running a server, this is nice for easy sharing results in a .zip file. Make sure you distribute the full folder, then others can open index-static.html locally with a browser. For generating this file just run:

	node src/main.js --static-html




# Using it: Test data administration

If you want to import existing tests from other workspace/folder:

	node src/main.js --add-to-metadata=../myotherworkspace/testData/google_2

If you want to remove a test definition from current workspace:

	node src/main.js --remove-test=my_site_test2

If you want to rename an existing test definition, if you want to change the name of existing test definition 'my_site2' to the name 'MySitePageZ' :

	node src/main.js --rename-test=my_site2,MySitePageZ

If you want to remove the first run of a test definition (because you have detected some problem in those measures) you can do it by:

	node src/main.js --removeTestRun=ngf_home_cxm_chrome,0


# Running unit tests

	node node_modules/jasmine/bin/jasmine.js --apikey=mywebpagetestapike

or declare the api key in an environment variable:

	exports APIKEY=lkasjdlajsdlj
	npm test
