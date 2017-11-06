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
  return OAuth;
}

function popup() {
  getClient().popup()
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
