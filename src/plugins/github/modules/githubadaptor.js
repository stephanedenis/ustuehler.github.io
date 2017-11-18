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

    this.tiddlers = new Tiddlers('GitHub')
    this.config = {
      user: options['user'] || this.tiddlers.getConfigText('User'),
      repo: options['repo'] || this.tiddlers.getConfigText('Repo'),
      branch: options['branch'] || this.tiddlers.getConfigText('Branch'),
      path: options['path'] || this.tiddlers.getConfigText('Path')
    }
    this.client = null
  }

  GitHubAdaptor.prototype = Object.create(SyncAdaptor.prototype)
  GitHubAdaptor.prototype.constructor = GitHubAdaptor

  GitHubAdaptor.prototype.start = function () {
    if (this.client) {
      return Promise.resolve(this.client)
    }

    var client = new Client()

    return client.signIn().then(function (userInfo) {
      this.client = client

      return this.client
    })
  }

  GitHubAdaptor.prototype.stop = function () {
    this.client = null
    return Promise.resolve()
  }

  GitHubAdaptor.prototype.getTiddlerInfoFromStore = function (tiddler) {
    return {
      'github-url': tiddler.fields['github-url']
    }
  }

  GitHubAdaptor.prototype.getLoggedInUser = function () {
    return this.start().then(function (client) {
      return client.username
    })
  }

  GitHubAdaptor.prototype.getSkinnyTiddlersFromStore = function () {
    var user = this.config.user
    var repository = this.config.repo
    var branch = this.config.branch
    var self = this

    return this.start().then(function (client) {
      return client.initialise().then(function (github) {
        var repo = github.getRepo(user, repository)

        return repo.getRef('heads/' + branch)
          .then(function (response) {
            return response.data.object.sha
          })
          .then(function (sha) {
            return self.getSkinnyTiddlersFromTree(repo, sha)
          })
          .then(function () {
            return []
          })
      })
    })
  }

  GitHubAdaptor.prototype.getSkinnyTiddlersFromTree = function (repo, sha) {
    this.getTiddlerPathsFromTree(repo, sha).then(function (paths) {
      console.log('tiddler paths:', paths)
      return [] // TODO
    })
  }

  GitHubAdaptor.prototype.getTiddlerPathsFromTree = function (repo, sha, prefix) {
    return repo.getTree(sha).then(function (response) {
      var tree = response.data.tree
      var paths = []
      var subdirs = []

      prefix = prefix || ''

      console.log('Listing tiddlers at /' + prefix)
      for (var node in tree) {
        var path = prefix + node.path

        if (node.type === 'blob' && node.path.endsWith('.tid')) {
          paths.push(path)
        }

        if (node.type === 'tree') {
          var subdir = path + '/'
          var promise = self.getTiddlerPathsFromTree(repo, sha, subdir)
            .then(function (children) {
              paths = paths.concat(children)
              subdirs.splice(subdirs.indexOf(promise), 1)
            })
          subdirs.push(promise)
        }
      }

      return new Promise(function (resolve, reject) {
        var deadline = Date.now() + 30000 // 30 seconds
        var poll = function () {
          if (Date.now() >= deadline) {
            reject(new Error('Could not list /' + prefix + ' within 30 seconds'))
          } else if (subdirs.length > 0) {
            console.log('Waiting for ' + subdirs.length + ' subdirectory listings to complete')
            setTimeout(poll, 1000)
          } else {
            resolve(paths)
          }
        }
        poll()
      })
    })
  }

  if ($tw.browser) {
    /* TODO: enable when ready
    exports.adaptorClass = GitHubAdaptor
    */
  }

  // XXX: hope this won't hurt anybody, because the docs say we must not export anything else
  exports.GitHubAdaptor = GitHubAdaptor
})()
