const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync');
const rename = require('gulp-rename');

// postcss
const postcss = require('gulp-postcss');
const mqpacker = require('css-mqpacker');

const imagemin = require('gulp-imagemin');

const pug = require('gulp-pug');
const prettify = require('gulp-html-prettify');
const typograf = require('gulp-typograf');

const uglify = require('gulp-uglify');

const cssbeautify = require('gulp-cssbeautify');

gulp.task('scripts', function() {
  return gulp.src(['./src/js/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'))
    .pipe(gulp.dest('./docs/js'))
});

gulp.task('fonts', function () {
  return gulp.src('./src/fonts/**/*')
    .pipe(gulp.dest('./public/fonts'))
    .pipe(gulp.dest('./docs/fonts'));
});

gulp.task('build', ['pretty', 'scripts', 'css', 'images-min', 'fonts'], function() {
  console.log('BUILD SUCCESS');
});

gulp.task('default', ['pretty', 'scripts', 'css', 'images-min', 'fonts', 'watch'], function () {
  browserSync({
    server: './public',
    // startPath: "/branding",
    open: false,
    logFileChanges: false,
    notify: false
  });
  gulp.watch(["./public/**/*.html", "./public/js/**/*"]).on('change', browserSync.reload);
});

gulp.task('stylefmt', function () {
  return gulp.src('src/css/style.css')
    // .pipe(cssbeautify({
    //     indent: '  ',
    //     // openbrace: 'separate-line',
    //     // autosemicolon: true
    // }))
    .pipe(postcss([
      require('stylefmt'),
      require('postcss-gradientfixer'),
      // require('postcss-pseudo-content-insert'),
      // require('postcss-pseudo-element-cases'),
      // require('postcss-pseudo-element-colons'),
      require('postcss-unprefix'), // косяк с before
      // require('postcss-default-unit'),
      // require('css-declaration-sorter')({order: 'smacss'}),
    ]))
    .pipe(gulp.dest('src/css'));
});

gulp.task('css', ['stylefmt'], function () {
  return gulp.src('./src/css/style.css')
    .pipe(postcss([
      require('postcss-percentage'),
      require('postcss-focus'),
      require('postcss-randomcolor/lib'),
      require('postcss-partial-import'),
      require('postcss-import'),
      require('postcss-center'),
      require('css-declaration-sorter')({order: 'smacss'}),
      require('postcss-simple-vars'),
      require('postcss-nested-ancestors'),
      require('postcss-nested'),
      require('postcss-font-display')({ display: 'swap', replace: false }),
      require('postcss-easing-gradients'),
      require('postcss-responsive-type'),
      require('postcss-combine-duplicated-selectors'),
      require('postcss-discard-duplicates'),
      require('stylefmt'),
      mqpacker({sort: true}),
    ]))
    // .pipe(cssbeautify({
    //     indent: '  ',
    //     // openbrace: 'separate-line',
    //     // autosemicolon: true
    // }))
    .pipe(gulp.dest('./src/css/compiled'))
    .pipe(postcss([
      require('stylelint'),
      require('postcss-normalize')({forceImport: true}),
      require('postcss-at2x'),
      require('postcss-list-style-safari-fix'),
      require('postcss-momentum-scrolling'),
      require('postcss-inline-svg')({
        'path': './src/inline'
      }),
      require('postcss-animation'),
      require('postcss-light-text'),
      require('postcss-browser-reporter'),
      require('autoprefixer'),
      require('cssnano')({
        preset: [
          'default', {
            reduceTransforms: false
          }
        ]
      })
    ]))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest('./public/css'))
    .pipe(gulp.dest('./docs/css'))
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
    .pipe(gulp.dest('./public'))
    .pipe(gulp.dest('./docs'));
});

gulp.task('pretty', ['pug'], function() {
  gulp.src('./public/*.html')
    .pipe(typograf({
      locale: ['ru', 'en-US'],
      htmlEntity: {
        type: 'name',
        onlyInvisible: true
      }
    }))
    .pipe(prettify({indent_size: 2}))
    .pipe(gulp.dest('./public'))
    .pipe(gulp.dest('./docs'));
});

gulp.task('images-clean', function () {
  return del([
    './public/img'
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
    .pipe(gulp.dest('./public/img'))
    .pipe(gulp.dest('./docs/img'));
});

gulp.task('watch', function() {
  gulp.watch(['src/css/**/*.css'], ['css']);
  gulp.watch(['src/js/**/*.js'], ['scripts']);
  gulp.watch(['src/pug/**/*.pug'], ['pretty']);
  gulp.watch(['src/img/*'], ['images-min']);
});
