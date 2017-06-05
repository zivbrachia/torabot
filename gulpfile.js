var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jsFiles = ['*.js', 'src/**/*.js'];

var nodemon = require('gulp-nodemon');

gulp.task('style', function () {
    return gulp.src(jsFiles).pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe('jscs()');
});

gulp.task('inject', function () {

    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');
    var injectSrc = gulp.src(['./public/css/*.css'
        , './public/js/*.js']
        , { read: false });
    var injectOptions = {
        ignorepath: '/public'
    };
    var options = {
        bowerJson: require('./bower.json'),
        directory: './public/lib',
        ignorepath: '../../public'
    };
    return gulp.src('./src/views/*.html')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./src/views'));

});

gulp.task('serve', ['style', 'inject'], function () {
    var options = {
        script: 'server.js',
        delay: 1,
        env: {
            'PORT': 5000
        },
        watch: jsFiles
    };
    return nodemon(options)
        .on('restart', function (ev) { console.log('restarting..'); });
});