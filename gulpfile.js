
/********************************************************************
* Imports
*******************************************************************/

// var pump = require('pump')
var gulp = require('gulp')
// var gutil = require('gulp-util')
// var clean = require('gulp-clean')
// var uglify = require('gulp-uglify')
var nodemon = require('gulp-nodemon')
var shell = require('gulp-shell')
var runSequence = require('run-sequence').use(gulp)
// var rename = require('gulp-rename')
// var dest = 'editions/public/'

/********************************************************************
* Tasks
*******************************************************************/

gulp.task('buildinfo', [], shell.task([
  'hack/buildinfo'
], { verbose: true }))

gulp.task('index.html', ['buildinfo'], shell.task([
  'node index.js editions/public --build'
]))

gulp.task('hack.html', ['buildinfo'], shell.task([
  'node index.js editions/hack-fs --build'
]))

gulp.task('build', ['index.html'])

gulp.task('deploy', [], function (cb) {
  runSequence('build', ['hack.html'], cb)
})

// ref: https://stackoverflow.com/questions/28048029/running-a-command-with-gulp-to-start-node-js-server
gulp.task('hack', ['build'], function () {
  nodemon({
    script: 'index.js',
    watch: ['*']
  }).on('restart', ['build'])
})

gulp.task('wip', ['build'], function () {
  nodemon({
    script: 'index.js',
    watch: ['*']
  }).on('restart', ['build', 'commit', 'pull', 'push'])
})

gulp.task('commit', [], shell.task([
  'git add -A',
  'git commit -a -m wip'
]))

gulp.task('pull', [], shell.task([
  'git pull --rebase'
]))

gulp.task('push', [], shell.task([
  'git push'
]))
