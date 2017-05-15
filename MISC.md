

#Misc thoughts

Command line tool for doing webpagetest.org performance tests form the command line. 

Define and perform a performance test choosing the options internactively in the command line. 

Run already defined tests again and again and collect the data. 

Visualize the data in HTML charts and generate excel/json reports. 

Visuallize data evolution in time - how code changes affect the performance ? 

Compare two tests of two or more different sites. 

Stores tests data in folders using open formats - consumible by other technologies.



#webpagetest useful urls

run a test: 

http://www.webpagetest.org/runtest.php?url=google.com&location=Dulles_iOS%3AiPhone%204%20iOS%205.1.FIOS&runs=1&f=json&k=kajshd8768asd68a7s6dkajsdh87&video=1

this will return a response with a testid, so we later can query the test status (is it finnished?)

http://www.webpagetest.org/testStatus.php?f=json&test=150407_SK_1DA8

when it is finished we can fetch all the test result numbers like this:

http://www.webpagetest.org/results.php?test=150407_4X_1DEC&f=json
