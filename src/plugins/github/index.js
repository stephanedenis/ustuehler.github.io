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
    var self = this

    // Anonymous access by default
    this.client = new Client()

    Component.call(this, 'GitHub').then(function () {
      self.status.update(signedOutStatus())
    })
  }

  GitHub.prototype = Object.create(Component.prototype)
  GitHub.prototype.constructor = GitHub

  GitHub.prototype.currentUser = function () {
    return getUserName()
  }

  GitHub.prototype.signIn = function (username, accessToken) {
    console.log('GitHub.signIn username:', username, 'accessToken:', accessToken, 'remembered accessToken:', recallAccessToken())

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

    // Create a new API client with the provided credentials
    var client = new Client(username, accessToken)

    /*
     * Try to get the user profile for this access token. This API call
     * requires authentication, and so should be useful in determining if the
     * accsess token is valid.
     */
    self.status.update(signingInStatus())
    return client.getUser().getProfile()
      .then(function (response) {
        return response.data
      })
      .then(function (profile) {
        var user = { login: profile.login }
        setUserName(user.login)
        rememberAccessToken(accessToken)
        self.client = client
        self.status.setError(null)
        self.status.update(signedInStatus())
        return user
      })
      .catch(function (err) {
        forgetAccessToken()
        self.status.setError(err)
        self.status.update(signedOutStatus())
        return err
      })
  }

  GitHub.prototype.signOut = function () {
    forgetAccessToken()
    this.client = new Client()
    this.status.update(signedOutStatus())
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

  const STATUS_USER_NAME = '$:/status/GitHub/UserName'
  const TEMP_ACCESS_TOKEN = '$:/temp/GitHub/AccessToken'

  function getUserName () {
    return $tw.wiki.getTiddlerText(STATUS_USER_NAME)
  }

  function setUserName (login) {
    $tw.wiki.setText(STATUS_USER_NAME, 'text', null, login)
  }

  function recallAccessToken () {
    return $tw.wiki.getTiddlerText(TEMP_ACCESS_TOKEN)
  }

  function rememberAccessToken (token) {
    $tw.wiki.setText(TEMP_ACCESS_TOKEN, 'text', null, token)
  }

  function forgetAccessToken () {
    $tw.wiki.deleteTiddler(TEMP_ACCESS_TOKEN)
  }

  function signedOutStatus () {
    return {
      'signed-in': false,
      'signing-in': false
    }
  }

  function signingInStatus () {
    return {
      'signed-in': false,
      'signing-in': true
    }
  }

  function signedInStatus () {
    return {
      'signed-in': true,
      'signing-in': false
    }
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
