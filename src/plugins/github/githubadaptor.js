/*\
title: $:/plugins/ustuehler/github/githubadaptor.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for synchronising with GitHub

\*/
(function () {
  var SyncAdaptor = require('$:/plugins/ustuehler/component/index.js').SyncAdaptor
  var github = require('$:/plugins/ustuehler/github/index.js').github

  function GitHubAdaptor (options) {
    SyncAdaptor.call(this, 'GitHubAdaptor', options)

    console.log('GitHubAdaptor is using', github)
  }

  GitHubAdaptor.prototype = SyncAdaptor

  GitHubAdaptor.prototype.getTiddlerInfoFromStore = function (tiddler) {
    return {
      ref: tiddler.fields.ref
    }
  }
})()
