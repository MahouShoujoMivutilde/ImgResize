var gulp = require('gulp'),
    cssmin = require('gulp-clean-css'),
    babel = require('gulp-babel');

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
};

gulp.task('build:pica', function() {
  gulp.src(path.src.pica)
    .pipe(gulp.dest(path.build.pica))
});

gulp.task('build:jsmain', function() {
  gulp.src(path.src.jsmain)
    .pipe(babel({presets: ['babili']}))
    .pipe(gulp.dest(path.build.jsmain))
})

gulp.task('build:css', function () {
  gulp.src(path.src.css)
    .pipe(cssmin())
    .pipe(gulp.dest(path.build.css))
});

gulp.task('build', [
    'build:css',
    'build:jsmain',
    'build:pica'
]);

gulp.task('default', ['build']);