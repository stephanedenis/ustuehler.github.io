/*\
title: $:/plugins/ustuehler/github/githubadaptor.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for synchronising with GitHub

\*/
(function () {
  /* global $tw */

  var SyncAdaptor = require('$:/plugins/ustuehler/component').SyncAdaptor
  //var GitHub = require('$:/plugins/ustuehler/github/modules/github').GitHub

  function GitHubAdaptor (options) {
    SyncAdaptor.call(this, 'GitHubAdaptor', 'github', options)
    //this.github = new GitHub()
  }

  GitHubAdaptor.prototype = Object.create(SyncAdaptor.prototype)
  GitHubAdaptor.prototype.constructor = GitHubAdaptor

  GitHubAdaptor.prototype.getTiddlerInfoFromStore = function (tiddler) {
    return {
      ref: tiddler.fields.ref
    }
  }

  GitHubAdaptor.prototype.getLoggedInUser = function () {
    return Promise.resolve('') // TODO
  }

  GitHubAdaptor.prototype.getSkinnyTiddlersFromStore = function () {
    return Promise.resolve([]) // TODO
  }

  if ($tw.browser) {
    /* TODO: enable when ready
    exports.adaptorClass = GitHubAdaptor
    */
  }
})()
