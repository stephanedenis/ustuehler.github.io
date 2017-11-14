/*\
title: $:/plugins/ustuehler/github/client.js
type: application/javascript
module-type: library

GitHub API client that can configure itself from tiddlers

\*/
(function () {
  var getWindowProperty = require('$:/plugins/ustuehler/component/utils').getWindowProperty
  var Tiddlers = require('$:/plugins/ustuehler/component').Tiddlers

  const CONFIG_USER_NAME = 'UserName'
  const CONFIG_ACCESS_TOKEN = 'AccessToken'

  var Client = function (username, accessToken) {
    if (arguments.length < 2) {
      accessToken = username
      username = null
    }

    this.config = new Tiddlers('GitHub')
    this.username = username || this.config.getStatusText(CONFIG_USER_NAME)
    this.accessToken = accessToken || this.config.getTempText(CONFIG_ACCESS_TOKEN)
  }

  /*
   * This method guarantees the proper sequence during initialisation, i.e.,
   * that the GitHub window property is available before we reference its value
   * to instantiate the API client object
   */
  Client.prototype.initialise = function () {
    var self = this

    if (this.github) {
      return Promise.resolve(this.github)
    }

    return getWindowProperty('GitHub').then(function (GitHub) {
      self.github = new GitHub({
        username: self.username,
        token: self.accessToken
      })
      return self.github
    })
  }

  /*
   * Sign in with the given accessToken. If the username is not null, then the
   * accessToken may be a password. Password-based sign-in will only succeed if
   * the user account does not have Two-Factor Authentication enabled.
   */
  Client.prototype.signIn = function (username, accessToken) {
    var self = this

    // When only an access token is provided (recommended)
    if (arguments.length < 2) {
      accessToken = username
      username = null
    }

    this.username = username || this.username || this.config.getStatusText(CONFIG_USER_NAME)
    this.accessToken = accessToken || this.accessToken || this.config.getTempText(CONFIG_ACCESS_TOKEN)
    this.github = null

    return this.initialise().then(function (github) {
      /*
       * Try to get the user profile for this access token. This API call
       * requires authentication, and so should be useful in determining if the
       * accsess token is valid.
       */
      return github.getUser().getProfile()
        .then(function (response) {
          return response.data
        })
        .then(function (profile) {
          self.user = { login: profile.login }
          return self.user
        })
    })
  }

  /**
   * List a user's public keys
   * @see https://developer.github.com/v3/users/keys/#list-public-keys-for-a-user
   * @param {String} [username] - the username whose keys should be listed
   * @return {Promise} - the promise for the user keys
   *
   * A function like this is missing in the official API client for JavaScript.
   * Check https://github.com/github-tools/github/blob/master/lib/User.js to see
   * if that was changed in the meantime.
   */
  Client.prototype.getUserKeys = function (username) {
    this.initialise().then(function (github) {
      return new Promise(function (resolve, reject) {
        var u = github.getUser(username)

        u._request('GET', u.__getScopedUrl('keys'), null, function (err, data, response) {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        })
      })
    })
  }

  exports.Client = Client
})()
