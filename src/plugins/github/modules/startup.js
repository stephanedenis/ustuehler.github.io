/*\
title: $:/plugins/ustuehler/github/modules/startup.js
type: application/javascript
module-type: startup

Register event handlers for the GitHub plugin

\*/
(function () {
  /* global $tw */

  exports.name = 'github'
  exports.platforms = ['browser']
  exports.after = ['startup']
  exports.synchronous = false

  exports.startup = function (callback) {
    var github = require('$:/plugins/ustuehler/github')

    $tw.rootWidget.addEventListener('tm-github-sign-in', function (event) {
      var username = event.paramObject.username
      var accessToken = event.paramObject.accessToken

      github.signIn(username, accessToken)
    })

    $tw.rootWidget.addEventListener('tm-github-sign-out', function (event) {
      github.signOut()
    })

    callback()
  }
})()
