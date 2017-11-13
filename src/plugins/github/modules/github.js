/*\
title: $:/plugins/ustuehler/github/modules/github.js
type: application/javascript
module-type: library

Provides the plugin's function library that wraps the GitHub API

\*/
(function () {
  var GitHub = function (username, accessToken) {
    window.GitHub.call(this, {
      username: username,
      token: accessToken
    })
  }

  GitHub.prototype = Object.create(window.GitHub.prototype)

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
