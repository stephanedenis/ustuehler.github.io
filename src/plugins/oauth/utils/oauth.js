/*\
title: $:/plugins/ustuehler/github-api/utils/oauth.js
type: application/javascript
module-type: utils
caption: oauth

Provides OAuth utility functions under $tw.utils.oauth

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

function getClient() {
  var OAuth = require("$:/plugins/ustuehler/oauth/oauth2-client.js");
  var github = new OAuth.Provider({
    id: 'github',
    authorization_url: 'https://github.com/login/oauth/authorize'
  });

}

function popup() {
  getClient().popup('github')
  .done(function(result) {
    $tw.utils.showSnackbar(result.access_token);
  })
  .fail(function(err) {
    $tw.utils.showSnackbar(err);
  });
}

exports.oauth = {
  getClient: getClient,
  popup: popup
};

})(this);
