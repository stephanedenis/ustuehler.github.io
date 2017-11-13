/*\
title: $:/plugins/ustuehler/github/index.js
type: application/javascript
module-type: library

The plugin's main logic

\*/
(function () {
  /* global $tw */

  var Component = require('$:/plugins/ustuehler/component').Component
  var Client = require('$:/plugins/ustuehler/github/modules/github.js').GitHub

  var GitHub = function () {
    // Anonymous access by default
    this.client = new Client()
    this.isSignedIn = false

    Component.call(this, 'GitHub')

    this.setErrorStatus(null)
  }

  GitHub.prototype = Object.create(Component.prototype)
  GitHub.prototype.constructor = GitHub

  GitHub.prototype.currentUser = function () {
    return getUserName()
  }

  GitHub.prototype.signIn = function (username, accessToken) {
    var self = this

    // When only an access token is provided (recommended)
    if (arguments.length < 2) {
      accessToken = username
      username = null
    }

    // Use the last known token, if none was given
    if (!accessToken) {
      accessToken = recallAccessToken()
    }

    // Use the new API client with the provided credentials
    var client = new Client(username, accessToken)

    // Try to get the user information for this access token
    return client.getUser().getProfile()
      .then(function (response) {
        return response.data
      })
      .then(function (profile) {
        var user = { login: profile.login }
        setUserName(user.login)
        rememberAccessToken(accessToken)
        self.isSignedIn = true
        self.client = client
        self.setErrorStatus(null)
        return user
      })
      .catch(function (err) {
        forgetAccessToken()
        self.isSignedIn = false
        self.setErrorStatus(err)
        return err
      })
  }

  GitHub.prototype.signOut = function () {
    forgetAccessToken()
    this.client = new Client()
    // Now we have only anonymous access, again
    return Promise.resolve()
  }

  GitHub.prototype.getUserProfile = function (username) {
    return this.client.getUser(username).getProfile().then(function (response) {
      return response.data
    })
  }

  GitHub.prototype.getUserKeys = function (username) {
    return this.client.getUserKeys(username)
  }

  GitHub.prototype.getUserRepos = function (username) {
    return new Promise(function (resolve, reject) {
      this.client.getUser(username).listRepos(function (err, repos) {
        if (err) {
          return reject(err)
        }
        resolve(repos)
      })
    })
  }

  // Updates the status tiddler's error field
  // XXX: should be lifted to the Status class
  GitHub.prototype.setErrorStatus = function (err) {
    this.setStatusFields(this.status.errorStatus(err))
  }

  // Updates the status tiddler's fields
  // XXX: parts of this should be lifted to the Status class
  GitHub.prototype.setStatusFields = function (fields) {
    var newFields = {
      signedIn: this.isSignedIn ? 'yes' : 'no'
    }

    Object.assign(newFields, this.status.fields)
    Object.assign(newFields, fields)

    newFields.signedIn = this.isSignedIn ? 'yes' : 'no'

    // TODO: update should allow a subset of status fields to be updated
    this.status.update(newFields)
  }

  const STATUS_USER_NAME = '$:/status/GitHub/UserName'
  const STATUS_ACCESS_TOKEN = '$:/temp/GitHub/AccessToken'

  function getUserName () {
    $tw.wiki.getTiddlerText(STATUS_USER_NAME)
  }

  function setUserName (login) {
    $tw.wiki.setText(STATUS_USER_NAME, 'text', null, login)
  }

  function recallAccessToken () {
    $tw.wiki.getTiddlerText(STATUS_ACCESS_TOKEN)
  }

  function rememberAccessToken (token) {
    $tw.wiki.setText(STATUS_ACCESS_TOKEN, 'text', null, token)
  }

  function forgetAccessToken () {
    $tw.wiki.deleteTiddler(STATUS_ACCESS_TOKEN)
  }

  var github = new GitHub()

  exports.currentUser = function () {
    return github.currentUser
  }

  exports.signIn = function (username, accessToken) {
    if (arguments.length < 2) {
      return github.signIn(username) // accessToken
    }
    return github.signIn(username, accessToken)
  }

  exports.signOut = function () {
    return github.signOut()
  }

  exports.getUserProfile = function (username) {
    return github.getUserProfile(username)
  }
})()
