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

function getClient() {
  var username = this.getTemporarySetting("UserName", this.getSetting("username"));
  var password = this.getTemporarySetting("Password", this.getSetting("password"));

  return new GitHub(
    username: username,
    password: password
    /* also acceptable:
    token: 'MY_OAUTH_TOKEN'
    */
  );
}

function getUser() {
}

exports.github = {
  getClient: getClient,
  getUser: getUser
};

})(this);
