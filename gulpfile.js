'use strict';

var browserify = require('browserify')
,   gulp = require('gulp')
,   source = require('vinyl-source-stream')
,   buffer = require('vinyl-buffer')
,   gutil = require('gulp-util')
,   uglify = require('gulp-uglify')
,   sourcemaps = require('gulp-sourcemaps')
,   reactify = require('reactify')

,	template = require('gulp-template-compile')
,	concat = require('gulp-concat');


gulp.task('javascript', function () {

	gulp.watch('./html/src/js/*.js', ['javascript']); 

	// set up the browserify instance on a task basis
	var b = browserify({
		entries: './html/src/js/Application.js',
		debug: true,
		// defining transforms here will avoid crashing your stream
		transform: [reactify]
	});

	return b.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
			// .pipe(sourcemaps.init({loadMaps: true}))
			// Add transformation tasks to the pipeline here.
			// .pipe(uglify())
			.on('error', gutil.log)
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./html/dist/'));
});


 
gulp.task('templates', function () 
{	
	var glob = './html/src/templates/**/*.html';
	gulp.watch(glob, ['templates']); 
	gulp.src(glob)
		.pipe(template())
		.pipe(concat('templates.js'))
		.pipe(gulp.dest('./html/dist'));
});


var Static = require('node-static')
,	colors = require('colors');

gulp.task('run', ['templates', 'javascript'], function () 
{	
	console.log(colors.green('Application started at http://localhost:8080/html'));
	var file = new Static.Server('.');
	require('http').createServer(function (request, response) {
		request.addListener('end', function () {
			file.serve(request, response);
		}).resume();
	}).listen(8080);
});




gulp.task('default', ['templates', 'javascript'], function () {
});