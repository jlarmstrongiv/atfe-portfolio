// TODO images

// require gulp
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const runSequence = require('run-sequence');
const concat = require('gulp-concat');
const flatten = require('gulp-flatten');
const del = require('del');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const kit = require('gulp-kit');
const zip = require('gulp-zip');
// require scss
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const minifyCss = require('gulp-minify-css');
// top level paths
const DIST_PATH = './dist';
const SRC_PATH = './src';
const COMPILED_TO_INCLUDE = SRC_PATH + '/compiled-to-include'
const PACKAGE = 'jlarmst-atfe-portfolio.zip'
// dest paths
const KIT_DIST = DIST_PATH;
const HTML_SRC = KIT_DIST + '/**/*.html'
const SCSS_DIST = COMPILED_TO_INCLUDE + '/css'
const CSS_SRC = SCSS_DIST + '/**/*.css';
// src paths
const KIT_SRC = SRC_PATH + '/pages/**/*.kit'
const KIT_PARTIAL_SRC = SRC_PATH + '/components/**/*.kit'
const SCSS_SRC = SRC_PATH + '/{components,general}/**/*.scss';
const IMAGES_SRC = SRC_PATH + '/img/**/*.{jpeg,jpg,png,svg,gif}'

// browsersync
gulp.task('browser-sync', () => {
  return browserSync.init({
    server: DIST_PATH,
    port: 9345,
    ui: {
      port: 9346
    }
  });
});

// styles
gulp.task('styles', () => {
  return gulp.src([SCSS_SRC])
    .pipe(plumber((err) => {
      console.log('styles task error');
      console.log(err);
      this.emit('end');
    }))
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(flatten())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(SCSS_DIST))
});

// kits
gulp.task('kits', () => {
  return gulp.src([KIT_SRC])
    .pipe(plumber((err) => {
      console.log('kit task error');
      console.log(err);
      this.emit('end')
    }))
    .pipe(kit())
    .pipe(gulp.dest(DIST_PATH))
    // .pipe(browserSync.reload())
});

// run styles and then kits
gulp.task('styles-kits', (done) => {
  runSequence('styles', 'kits', () => {
    // console.log('Run something else');
    done();
  });
});

// images
gulp.task('images', () => {

});

// clean and delete dist folder
gulp.task('clean', () => {
  return del.sync([
    DIST_PATH,
    COMPILED_TO_INCLUDE,
    PACKAGE
  ])
});

// run once
gulp.task('once', (done) => {
  runSequence('clean', 'styles', 'kits', () => {
    // console.log('Run something else');
    done();
  });
});

// default
gulp.task('default', [], () => {

});

// gulpwatch
gulp.task('watch', ['once', 'browser-sync'], () => {
  gulp.watch([SCSS_SRC], ['styles-kits']);
  gulp.watch([KIT_SRC, KIT_PARTIAL_SRC], ['kits']);
  gulp.watch(HTML_SRC).on('change', reload);
});

// export zip folder
gulp.task('package', () => {
  return gulp.src(DIST_PATH)
    .pipe(zip(PACKAGE))
    .pipe(gulp.dest('./'))
});
