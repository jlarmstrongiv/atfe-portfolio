// TODO images, fonts, gulp notifications, gulp watch, page-wrapper for navy bg, move pdf to its own folder, remove sourcemaps in final build
// require gulp
const gulp = require('gulp');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const runSequence = require('run-sequence');
const concat = require('gulp-concat');
const flatten = require('gulp-flatten');
const del = require('del');
const browserSync = require('browser-sync'); //.create();
const reload = browserSync.reload;
const kit = require('gulp-kit');
const zip = require('gulp-zip');
const htmlmin = require('gulp-htmlmin');
// require scss
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const minifyCss = require('gulp-minify-css');
// top level paths
const DIST_PATH = 'dist';
const SRC_PATH = 'src';
const COMPILED_TO_INCLUDE = SRC_PATH + '/compiled-to-include'
const PACKAGE_PATH = DIST_PATH + '/*'
const PACKAGE = 'jlarmst-atfe-portfolio.zip'
// dest paths
const KIT_DIST = DIST_PATH;
const HTML_SRC = KIT_DIST + '/**/*.html'
const SCSS_DIST = COMPILED_TO_INCLUDE + '/css'
const CSS_SRC = SCSS_DIST + '/**/*.css';
const IMAGES_DIST = DIST_PATH + '/**/*.{jpeg,jpg,png,svg,gif,tiff,tif,pdf}'
// src paths
const KIT_SRC = SRC_PATH + '/pages/**/*.kit'
const KIT_PARTIAL_SRC = SRC_PATH + '/components/**/*.kit'
const SCSS_SRC = SRC_PATH + '/{components,general}/**/*.scss';
const IMAGES_SRC = SRC_PATH + '/op-images/**/*.{jpeg,jpg,png,svg,gif,tiff,tif,pdf}'
const FONTS_SRC = SRC_PATH + '/fonts/**/*.{woff,woff2}'

// browsersync
gulp.task('browser-sync', () => {
  return browserSync.init({
    server: DIST_PATH,
    port: 9345,
    reloadOnRestart: false,
    ui: {
      port: 9346
    },
    weinre: {
      port: 9347
    },
    notify: {
      styles: {
        top: 'auto',
        bottom: 0,
        borderRadius: 0
      }
    }
  });
});

// styles
gulp.task('styles', () => {
  return gulp.src([SCSS_SRC])
    .pipe(plumber())
    // .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    })).on('error', sass.logError)
    // .pipe(sourcemaps.write({includeContent: false}))
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    // .pipe(sourcemaps.write('.'))
    .pipe(flatten())
    .pipe(plumber.stop())
    .pipe(gulp.dest(SCSS_DIST))
});

// kits
gulp.task('kits', () => {
  return gulp.src([KIT_SRC])
    .pipe(plumber())
    .pipe(kit())
    .pipe(flatten())
    .pipe(htmlmin({
      caseSensitive: true,
      collapseWhitespace: true,
      collapseInlineTagWhitespace: false,
      // preserveLineBreaks: true,
      // preventAttributesEscaping: true,
      keepClosingSlash: true,
      removeComments: true,
      removeEmptyAttributes: false
    }))
    .pipe(plumber.stop())
    .pipe(gulp.dest(DIST_PATH))
});
// run kits and then reload
gulp.task('kits-reload', (done) => {
  return runSequence('kits', () => {
    browserSync.reload();
    return done();
  });
});
// run styles and then kits-reload
gulp.task('styles-kits-reload', (done) => {
  return runSequence('styles', 'kits-reload', () => {
    // console.log('Run something else');
    return done();
  });
});

// images
gulp.task('images', () => {
  return gulp.src(IMAGES_SRC)
    .pipe(plumber())
    .pipe(flatten())
    .pipe(plumber.stop())
    .pipe(gulp.dest(DIST_PATH))
});

// fonts
gulp.task('fonts', () => {
  return gulp.src(FONTS_SRC)
    .pipe(plumber())
    .pipe(flatten())
    .pipe(plumber.stop())
    .pipe(gulp.dest(DIST_PATH))
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
  return runSequence(['clean'], ['styles-kits-reload', 'images', 'fonts'], () => {
    // console.log('Run something else');
    return done();
  });
});

// default
gulp.task('default', [], () => {

});

gulp.task('watch', ['once'], () => {
  watch([SCSS_SRC], () => {
    gulp.start(['styles-kits-reload']);
  });
  watch([KIT_SRC, KIT_PARTIAL_SRC], () => {
    gulp.start(['kits-reload']);
  });
  watch([IMAGES_SRC], () => {
    gulp.start(['images']);
  });
  watch([FONTS_SRC], () => {
    gulp.start(['fonts']);
  });
  gulp.start(['browser-sync'])
});

// export zip folder
gulp.task('package', ['once'], () => {
  return gulp.src(PACKAGE_PATH)
    .pipe(plumber())
    .pipe(zip(PACKAGE))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./'))
});
