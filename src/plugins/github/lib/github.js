/*\
title: $:/plugins/ustuehler/github/lib/github.js
type: application/javascript
module-type: library

Provides the plugin's function library that wraps the GitHub API

\*/
(function () {
  /* global $tw */

  var Component = require('$:/plugins/ustuehler/component/index.js').Component

  var GitHub = function () {
    Component.call(this, 'GitHub')
  }

  GitHub.prototype = Object.create(Component.prototype)
  GitHub.prototype.constructor = GitHub

  GitHub.prototype.getSyncAdaptor = function () {
    return this.syncAdaptor
  }

  GitHub.prototype.getSetting = function (name, fallback) {
    return $tw.wiki.getTiddlerText('$:/plugins/ustuehler/github/settings/' + name) || fallback
  }

  GitHub.prototype.getTemporarySetting = function (name, fallback) {
    return $tw.wiki.getTiddlerText('$:/temp/GitHub/' + name) || fallback
  }

  GitHub.prototype.getClientUserName = function () {
    return this.getTemporarySetting('UserName', this.getSetting('username'))
  }

  GitHub.prototype.getClientPassword = function () {
    return this.getTemporarySetting('Password', this.getSetting('password'))
  }

  GitHub.prototype.getClient = function () {
    var username = this.getClientUserName()
    var password = this.getClientPassword()

    return new window.GitHub({
      username: username,
      password: password /* also acceptable: token: 'MY_OAUTH_TOKEN' */
    })
  }

  /*
   * Get the current user, if username is null, or the user with the given login name
   */
  GitHub.prototype.getUser = function (username) {
    return this.getClient().getUser(username)
  }

  /**
   * List a user's public keys
   * @see https://developer.github.com/v3/users/keys/#list-public-keys-for-a-user
   * @param {String} [username] - the username whose keys should be listed
   * @return {Promise} - the promise for the http request
   *
   * A function like this is missing in the official API client for JavaScript.
   * Check https://github.com/github-tools/github/blob/master/lib/User.js to see
   * if that was changed in the meantime.
   */
  GitHub.prototype.getUserKeys = function (username) {
    return new Promise(function (resolve, reject) {
      var u = this.getUser(username)

      u._request('GET', u.__getScopedUrl('keys'), null, function (err, data, response) {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  exports.GitHub = GitHub
})()
