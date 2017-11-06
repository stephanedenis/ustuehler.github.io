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

let OAuth = require("$:/plugins/ustuehler/oauth/oauth2-client.js");

var github = null;
var client_id = 'e31081bbe6c4c22c45a5';
var redirect_uri = 'https://ustuehler.github.io/#GitHubAuthCallback';

function initialize(options) {
  client_id = options.client_id;
  redirect_uri = options.redirect_uri;
}

function getProvider() {
	if (github) {
		return github;
	}

	github = new OAuth.Provider({
		id: 'github',
		authorization_url: 'https://github.com/login/oauth/authorize'
	});

	return github;
}

function requestToken() {
	// Create a new request
	var request = new OAuth.Request({
		client_id: client_id,
		redirect_uri: redirect_uri
	});

	// Give it to the provider
	var uri = github.requestToken(request);

	// Later we need to check if the response was expected
	// so save the request
	github.remember(request);

	// Do the redirect
	window.location.href = uri;
}

function callback() {
	console.log('GitHub called back!');
}

exports.oauth = {
	getProvider: getProvider, // only for inspection
  initialize: initialize,
  requestToken: requestToken,
  callback: callback
};

})(this);
