const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync');
const rename = require('gulp-rename');

const stylefmt = require('gulp-stylefmt');
const stylelint = require('stylelint');

// postcss
const postcss = require('gulp-postcss');
const atImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const messages = require('postcss-browser-reporter');
const cssnano = require('cssnano');
const combineDuplicates = require('postcss-combine-duplicated-selectors');
const discardDuplicates = require('postcss-discard-duplicates');
const pNormalize = require('postcss-normalize');

const imagemin = require('gulp-imagemin');

const pug = require('gulp-pug');
const prettify = require('gulp-html-prettify');
const typograf = require('gulp-typograf');

const uglify = require('gulp-uglify');

gulp.task('scripts', function() {
  return gulp.src(['./src/js/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./build/js'))
});

gulp.task('fonts', function () {
  return gulp.src('./src/fonts/**/*')
    .pipe(gulp.dest('./build/fonts'));
});

gulp.task('default', ['pretty', 'scripts', 'css', 'images-min', 'fonts', 'watch'], function () {
  browserSync({
    server: './build',
    // startPath: "/branding",
    open: false,
    logFileChanges: false,
    notify: false
  });
  gulp.watch(["./build/**/*.html", "./build/js/**/*"]).on('change', browserSync.reload);
});

gulp.task('stylefmt', function () {
  return gulp.src('src/css/style.css')
    .pipe(stylefmt())
    .pipe(gulp.dest('src/css'));
});

gulp.task('css', ['stylefmt'], function () {
  return gulp.src('./src/css/style.css')
    .pipe(postcss([
      require('postcss-partial-import'),
      require('postcss-simple-vars'),
      require('postcss-nested-ancestors'),
      require('postcss-nested'),
      atImport(),
      mqpacker({sort: true}),
      combineDuplicates(),
      discardDuplicates(),
      require('postcss-easing-gradients'),
    ]))
    .pipe(stylefmt())
    .pipe(gulp.dest('./src/css/compiled'))
    .pipe(postcss([
      stylelint(),
      pNormalize({forceImport: true}),
      require('postcss-colormin'),
      messages(),
      autoprefixer(),
      cssnano()
    ]))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});

function requireUncached(module){
  delete require.cache[require.resolve(module)]
  return require(module)
}

gulp.task('pug', function (){
  return gulp.src(['./src/pug/*.pug', '!./src/pug/layout.pug', '!./src/pug/metrics.pug', '!./src/pug/variables.pug'])
    .pipe(pug({
      pretty: false
    }))
    .pipe(gulp.dest('./build'));
});

gulp.task('pretty', ['pug'], function() {
  gulp.src('./build/*.html')
    .pipe(typograf({
      locale: ['ru', 'en-US'],
      htmlEntity: {
        type: 'name',
        onlyInvisible: true
      }
    }))
    .pipe(prettify({indent_size: 2}))
    .pipe(gulp.dest('./build'));
});

gulp.task('images-clean', function () {
  return del([
    './build/img'
  ]);
});

gulp.task('images-min', ['images-clean'], function() {
  return gulp.src('src/img/*')
    // .pipe(imagemin([
      // imagemin.gifsicle({interlaced: true}),
      // imagemin.jpegtran({progressive: true}),
      // imagemin.optipng({optimizationLevel: 5})
    // ], {
      // verbose: true
    // }))
    .pipe(gulp.dest('./build/img'));
});

gulp.task('watch', function() {
  gulp.watch(['src/css/**/*.css'], ['css']);
  gulp.watch(['src/js/**/*.js'], ['scripts']);
  gulp.watch(['src/pug/**/*.pug'], ['pretty']);
  gulp.watch(['src/img/*'], ['images-min']);
});
