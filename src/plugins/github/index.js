/*\
title: $:/plugins/ustuehler/github/index.js
type: application/javascript
module-type: library

Provides high-level access to GitHub API functions

\*/
(function () {
  var GitHub = require('$:/plugins/ustuehler/github/lib/github.js').GitHub

  var github

  // Returns an initialised GitHub singleton
  exports.github = function () {
    if (!github) {
      github = new GitHub()
    }
    return github
  }
})()
