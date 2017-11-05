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
  return this.getTemporarySetting("UserName", this.getSetting("username"));
}

function getClientPassword() {
  return this.getTemporarySetting("Password", this.getSetting("password"));
}

function getClient() {
  return new GitHub(
    username: getClientUserName(),
    password: getClientPassword()
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
