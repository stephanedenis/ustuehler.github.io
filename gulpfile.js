
/********************************************************************
* Imports
*******************************************************************/

var pump = require('pump'),
  gulp = require("gulp"),
	gutil = require("gulp-util"),
	clean = require('gulp-clean'),
	uglify = require("gulp-uglify"),
	nodemon = require('gulp-nodemon'),
	shell = require('gulp-shell'),
  runSequence = require('run-sequence').use(gulp),
  rename = require("gulp-rename"),
	dest = "editions/public/";

/********************************************************************
* Tasks
*******************************************************************/

gulp.task("clean", function (cb) {
  pump([
	  gulp.src([dest + "/themes", dest + "/plugins"], {read: false}),
    clean()
	  // no target
  ], cb);
});

gulp.task("clean", function (cb) {
  pump([
	  gulp.src([dest + "/themes", dest + "/plugins"], {read: false}),
    clean()
	  // no target
  ], cb);
});

gulp.task("tiddlers", function (cb) {
  pump([
		gulp.src(["src/**", "node_modules/tw5-material/src/**", "!**/*.js"]),
		gulp.dest(dest)
	], cb);
})

gulp.task("javascript", function (cb) {
  pump([
		gulp.src(["src/**/*.js", "node_modules/tw5-material/src/**/*.js"]),
		uglify({ compress: false, output: { comments: /^\\/ } }),
		gulp.dest(dest)
	], cb);
})

gulp.task("buildinfo", [], shell.task([
  "hack/buildinfo"
], { verbose: true }));

gulp.task("index.html", ['buildinfo', 'tiddlers', 'javascript'], shell.task([
  "tiddlywiki editions/public --build"
]));

gulp.task("build", [], function (cb) {
  runSequence('clean', ['buildinfo', 'tiddlers', 'javascript', 'index.html'], cb)
});

// ref: https://stackoverflow.com/questions/28048029/running-a-command-with-gulp-to-start-node-js-server
gulp.task('server', function() {
	nodemon({
    script: 'index.js',
		watch: ["*"]
	}).on('restart', ['build']);
});

gulp.task('hack', function() {
	nodemon({
    script: 'index.js',
		watch: ["*"]
	}).on('restart', ['build', 'hack.html', 'commit', 'push']);
});

gulp.task("hack.html", ['buildinfo', 'tiddlers', 'javascript'], shell.task([
  "tiddlywiki editions/hack-fs --build"
]));

gulp.task("commit", [], shell.task([
  "git add -A",
  "git commit -a -m wip"
]));

gulp.task("push", [], shell.task([
  "git push"
]));
