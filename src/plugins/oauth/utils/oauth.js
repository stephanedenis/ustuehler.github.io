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

var github = null;

function getClient() {
	if (github) {
		return github;
	}

	let OAuth = require("$:/plugins/ustuehler/oauth/oauth2-client.js");

	github = new OAuth.Provider({
		id: 'github',
		authorization_url: 'https://github.com/login/oauth/authorize'
	});

	return github;
}

function requestToken() {
	// Create a new request
	var request = new OAuth.Request({
			client_id: 'my_client_id',  // required
			redirect_uri: 'http://my.server.com/auth-answer'
	});

	// Give it to the provider
	var uri = google.requestToken(request);

	// Later we need to check if the response was expected
	// so save the request
	google.remember(request);

	// Do the redirect
	window.location.href = uri;

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
