var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');

gulp.task('default', ['uglify']);

gulp.task('browserify', function () {
	return (
		browserify().
		require('./lib/index.js', {
			expose: 'chessview'
		}).
		bundle().
		pipe(source('chessview.js')).
		pipe(gulp.dest('browser'))
	);
});

gulp.task('uglify', ['browserify'], function () {
	return (
		gulp.src('browser/chessview.js').
		pipe(uglify()).
		pipe(rename('chessview.min.js')).
		pipe(gulp.dest('browser'))
	);
});
