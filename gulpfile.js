"use strict";
const { task, src, dest, watch, parallel, series } = require("gulp");

const sass = require("gulp-sass");
const fileinclude = require("gulp-file-include");
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const htmlbeautify = require("gulp-html-beautify");
const uglify = require('gulp-uglify');

var sassOptions = {
  outputStyle: "expanded"
};



function getPaths () {
  return {
    root: './',
    root_npm:'node_modules/',
    html : "*.html",
    js : "src/js/app.js", 
    html_master : {
      page: "src/html-master/html-page/**/*.html",
      partial: "src/html-master/html-partial/**/*.html"
    },
    scss: { 
      all: 'src/app/scss/**/*.scss', 
    },
    dest : {
      css: "src/app/css/",
      js: "src/app/js/"
    } 
  }
};

let paths = getPaths();
 
function browser(done) {
  browserSync.init({
    server: {
      baseDir: paths.root
    }
  });

  watch(paths.scss.all, series(cssbuild));
  watch(
    [
      paths.html_master.page,
      paths.html_master.partial
    ],
    series(htmlbuild, htmlformat)
  );
  //watch(paths.js, series(jsbuild));

  done();
}

function cssbuild(done) {
  return src(paths.scss.all)
    .pipe(sass(sassOptions).on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(dest(paths.dest.css))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(
      csso({
        restructure: true,
        sourceMap: false,
        debug: false
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(paths.dest.css))

    .pipe(browserSync.reload({ stream: true })); // prompts a reload after compilation
  done();
}

function jsbuild(done) {
  return src([  
    paths.root_npm+'jquery/dist/jquery.min.js',
    paths.root_npm+'jquery.easing/jquery.easing.min.js', 
    paths.root_npm+'uikit/dist/js/uikit.min.js',
    paths.root_npm+'uikit/dist/js/uikit-icons.min.js',
    paths.root_npm+'jquery-circle-progress/dist/circle-progress.min.js',
    paths.root_npm+'typed.js/lib/typed.min.js'
  ])
  .pipe(concat("plugins.min.js"))
  .pipe(dest("src/app/js"))
  .pipe(uglify())
  .pipe(dest("src/app/js"))
  .pipe(browserSync.reload({ stream: true }));
  done();
}

function htmlbuild(done) {
  return src([ 
    paths.html_master.page
  ])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
        context: {
          px: "yb",
          template_name: "Freda",
          template_desc: "Personal Resume / Portfolio / Blog / HTML Template",
          createdby: "yobithemes",
          urlauthor: "https://themeforest.net/user/yobithemes"
        }
      })
    )
    .pipe(dest(paths.root))
    .pipe(browserSync.reload({ stream: true }));
  done();
}

function htmlformat(done) {
  var options =  { "indent_size": 2 };
  return src([ 
    paths.html
  ])
    .pipe( htmlbeautify(options) )
    .pipe(dest(paths.root));
  done();
}
 
exports.css = series(cssbuild);
exports.js = series(jsbuild);
exports.html = series(htmlbuild); 
exports.htmlformat = series(htmlformat);
exports.default = series(cssbuild, jsbuild, htmlbuild, htmlformat, browser);