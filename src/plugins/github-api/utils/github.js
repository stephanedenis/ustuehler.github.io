/*\
title: $:/plugins/ustuehler/github-api/utils/github.js
type: application/javascript
module-type: utils
caption: github

Provides GitHub utility functions under $tw.utils.github

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

function getSetting(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/plugins/ustuehler/github-api/settings/' + name) || fallback;
};

function getTemporarySetting(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/temp/GitHub/' + name) || fallback;
};

function getClientUserName() {
  return getTemporarySetting("UserName", getSetting("username"));
}

function getClientPassword() {
  return getTemporarySetting("Password", getSetting("password"));
}

function getClient() {
  var username = getClientUserName();
  var password = getClientPassword();

  return new GitHub({
    username: username,
    password: password,
    /* also acceptable:
    token: 'MY_OAUTH_TOKEN'
    */
  });
}

function getUser(username) {
  return getClient().getUser(username);
}

/**
 * List a user's public keys
 * @see https://developer.github.com/v3/users/keys/#list-public-keys-for-a-user
 * @param {Requestable.callback} [cb] - will receive the list of keys
 * @return {Promise} - the promise for the http request
 *
 * This function is missing in the official API client for JavaScript.
 * Check https://github.com/github-tools/github/blob/master/lib/User.js
 * to see if that has changed in the meantime.
 */
function getUserKeys(username, cb) {
	var u = getUser(username);
	return u._request('GET', u.__getScopedUrl('keys'), null, cb);
}

exports.github = {
  getSetting:          getSetting,
  getTemporarySetting: getTemporarySetting,
  getClientUserName:   getClientUserName,
  getClientPassword:   getClientPassword,
  getClient:           getClient,
  getUser:             getUser,
  getUserKeys:         getUserKeys
};

})(this);
