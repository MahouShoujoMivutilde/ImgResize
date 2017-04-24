var gulp = require('gulp')

var path = {
  src: {
    pica: "bower_components/pica/dist/pica.min.js"
  },
  build: {
    pica: "js/"
  }
}

gulp.task('build:pica', function () {
  gulp.src(path.src.pica)
    .pipe(gulp.dest(path.build.pica))
});
