/*\
title: $:/plugins/ustuehler/github/githubadaptor.js
type: application/javascript
module-type: syncadaptor

A sync adaptor module for synchronising with GitHub

\*/
(function () {
  /* global $tw */

  var Client = require('$:/plugins/ustuehler/github/client').Client
  var SyncAdaptor = require('$:/plugins/ustuehler/component').SyncAdaptor
  var Tiddlers = require('$:/plugins/ustuehler/component').Tiddlers

  function GitHubAdaptor (options) {
    SyncAdaptor.call(this, 'GitHubAdaptor', 'github', options)

    this.tiddlers = new Tiddlers('GitHubAdaptor')
    this.config = {
      org: options['org'] || this.tiddlers.getConfigText('Org'),
      repo: options['repo'] || this.tiddlers.getConfigText('Repo'),
      branch: options['branch'] || this.tiddlers.getConfigText('Branch'),
      path: options['path'] || this.tiddlers.getConfigText('Path')
    }
    this.client = null
  }

  GitHubAdaptor.prototype = Object.create(SyncAdaptor.prototype)
  GitHubAdaptor.prototype.constructor = GitHubAdaptor

  GitHubAdaptor.prototype.start = function () {
    var client = new Client()

    return client.signIn().then(function (user) {
      this.client = client
    })
  }

  GitHubAdaptor.prototype.stop = function () {
    this.client = null
    return Promise.resolve()
  }

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

  // XXX: hope this won't hurt anybody, because the docs say we must not export anything else
  exports.GitHubAdaptor = GitHubAdaptor
})()
