var gulp = require('gulp');
var sass = require('gulp-sass');
var sassLint = require('gulp-sass-lint');
var browserSync = require('browser-sync').create();
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var pixrem = require('pixrem');
var nunjucksRender = require('gulp-nunjucks-render');

gulp.task('views', function() {
  var data = require('gulp-data');
  return gulp.src('src/views/pages/**/*.nunjucks')
  .pipe(data(function() {
      return require('./src/views/data/projects.json')
    }))
    .pipe(nunjucksRender({
      path: ['src/views/templates'] // String or Array
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('css', function(){
  var processors = [
    autoprefixer({browsers: 'last 2 versions', remove: false})/*,
    pixrem()*/
  ];
  return gulp.src('./build/assets/css/**/*.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('./build/assets/css'))
    .pipe(browserSync.stream());
});

gulp.task('copy', function () {
    gulp.src('./src/downloads/**/*.*')
      .pipe(gulp.dest('./build/downloads'));
    gulp.src('./src/images/**/*.*')
        .pipe(gulp.dest('./build/assets/images'));
    gulp.src('./src/js/**/*.*')
        .pipe(gulp.dest('./build/assets/js'));
});

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./build"
    });
    gulp.watch("src/views/**/*.+(json|nunjucks)", ['views']);
    gulp.watch("src/{images,js,downloads}/**/*.*", ['copy']);
    gulp.watch("src/scss/**/*.scss", ['sasslint', 'sass']);
    gulp.watch("src/*.html", ['copy']);
    gulp.watch("build/**/*.html").on('change', browserSync.reload);
});

gulp.task('sasslint', function() {
  return gulp.src([
        'src/scss/**/*.scss',
        '!src/scss/vendor/*.scss'
      ])
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

gulp.task('sass', function() {
  var processors = [
    autoprefixer({browsers: 'last 2 versions', remove: false}),
    pixrem()
  ];

  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest('./build/assets/css'))
    .pipe(browserSync.stream());
});

gulp.task('default', ['sasslint', 'sass','views','copy','serve']);
