var gulp = require('gulp'),
    cssmin = require('gulp-clean-css'),
    babel = require('gulp-babel'),
    browserSync = require("browser-sync"),
    watch = require('gulp-watch'),
    reload = browserSync.reload;

var path = {
  src: {
    pica: 'bower_components/pica/dist/pica.min.js',
    jsmain: 'src/scripts.js',
    css: 'src/style.css'
  },
  build: {
    pica: 'docs/js/',
    jsmain: 'docs/js/',
    css: 'docs/style/'
  },
  watch: {
    html: 'docs/*.html',
    jsmain: 'src/*.js',
    style: 'src/*.css'
  } 
};

var config = {
  server: {
      baseDir: "docs"
  },
  tunnel: true,
  host: 'localhost',
  port: 9000,
  logPrefix: "oh_well"
};

gulp.task('reload:html', function() {
  gulp.src(path.watch.html)
    .pipe(reload({stream: true}));
});

gulp.task('build:pica', function() {
  gulp.src(path.src.pica)
    .pipe(gulp.dest(path.build.pica))
    .pipe(reload({stream: true}));
});

gulp.task('build:jsmain', function() {
  gulp.src(path.src.jsmain)
    .pipe(babel({presets: ['babili']}))
    .pipe(gulp.dest(path.build.jsmain))
    .pipe(reload({stream: true}));
})

gulp.task('build:css', function () {
  gulp.src(path.src.css)
    .pipe(cssmin())
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});

gulp.task('watch', function(){
  watch([path.watch.html], function(event, cb) {
    gulp.start('reload:html');
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start('build:css');
  });
  watch([path.watch.jsmain], function(event, cb) {
    gulp.start('build:jsmain');
  });
  watch([path.src.pica], function(event, cb) {
    gulp.start('build:pica');
  });
});

gulp.task('webserver', function () {
  browserSync(config);
});

gulp.task('build', [
  'build:css',
  'build:jsmain',
  'build:pica'
]);

gulp.task('default', ['build', 'webserver', 'watch']);