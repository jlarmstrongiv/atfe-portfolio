// TODO images, fonts, gulp notifications
// add https://github.com/jonschlinkert/gulp-htmlmin
// fix gulp watch
// require gulp
const gulp = require('gulp');
const watch = require('gulp-watch');
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
// const sassGlob = require('gulp-sass-glob');
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
const IMAGES_DIST = DIST_PATH + '/**/*.{jpeg,jpg,png,svg,gif,tiff,tif}'
// src paths
const KIT_SRC = SRC_PATH + '/pages/**/*.kit'
const KIT_PARTIAL_SRC = SRC_PATH + '/components/**/*.kit'
const SCSS_SRC = SRC_PATH + '/{components,general}/**/*.scss';
const IMAGES_SRC = SRC_PATH + '/op-images/**/*.{jpeg,jpg,png,svg,gif,tiff,tif}'
const FONTS_SRC = SRC_PATH + '/fonts/**/*.{woff,woff2}'
// browsersync
gulp.task('browser-sync', () => {
  return browserSync.init({
    server: DIST_PATH,
    port: 9345,
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
    .pipe(sourcemaps.init())
    // .pipe(sassGlob())
    .pipe(sass({
      outputStyle: 'compressed'
    })).on('error', sass.logError)
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(flatten())
    .pipe(plumber.stop())
    .pipe(gulp.dest(SCSS_DIST))
});

// .pipe(sourcemaps.init())
// .pipe(sass().on('error', sass.logError))
// .pipe(sourcemaps.write({includeContent: false}))
// .pipe(sourcemaps.init({loadMaps: true}))
// .pipe(autoprefixer({ browser: ['last 2 version', '> 5%'] }))
// .pipe(sourcemaps.write('.'))
// .pipe(gulp.dest('./.temp/'));

// gulp.task('styles', () => {
//   return gulp.src([SCSS_SRC])
//     .pipe(plumber())
//     .pipe(sourcemaps.init())
//     // .pipe(sassGlob())
//     .pipe(autoprefixer({
//       browsers: ['last 2 versions'],
//       cascade: false
//     }))
//     .pipe(sass({
//       outputStyle: 'compressed'
//     })).on('error', sass.logError)
//     .pipe(flatten())
//     .pipe(sourcemaps.write())
//     .pipe(plumber.stop())
//     .pipe(gulp.dest(SCSS_DIST))
// });

// kits
gulp.task('kits', () => {
  return gulp.src([KIT_SRC])
    .pipe(plumber())
    .pipe(kit())
    .pipe(flatten())
    .pipe(plumber.stop())
    .pipe(gulp.dest(DIST_PATH))
    // .pipe(browserSync.reload())
});

// run styles and then kits
gulp.task('styles-kits', (done) => {
  return runSequence('styles', 'kits', () => {
    // console.log('Run something else');
    done();
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
  return runSequence(['clean'], ['styles-kits', 'images', 'fonts'], () => {
    // console.log('Run something else');
    done();
  });
});

// default
gulp.task('default', [], () => {

});

// gulpwatch
gulp.task('watch', ['once'], () => {
  gulp.watch([SCSS_SRC], ['styles-kits']);
  gulp.watch([KIT_SRC, KIT_PARTIAL_SRC], ['kits']);
  gulp.watch([IMAGES_SRC], ['images']);
  gulp.watch([FONTS_SRC], ['fonts']);
  gulp.start(['browser-sync']);
  gulp.watch(HTML_SRC).on('change', reload);
});
gulp.task('watch', ['once'], () => {
  watch([SCSS_SRC], () => {
    gulp.start(['styles-kits']);
  });
  watch([KIT_SRC, KIT_PARTIAL_SRC], () => {
    gulp.start(['kits']);
  });
  gulp.watch([IMAGES_SRC], () => {
    gulp.start(['images']);
  });
  gulp.watch([FONTS_SRC], ['fonts']);
  gulp.start(['browser-sync'])
  gulp.watch(HTML_SRC).on('change', reload);
  gulp.watch(IMAGES_DIST).on('change', reload);
});

// export zip folder
gulp.task('package', ['once'], () => {
  return gulp.src(PACKAGE_PATH)
    .pipe(plumber())
    .pipe(zip(PACKAGE))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./'))
});
