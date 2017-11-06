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

var defaultConfig = {
  provider_id: 'github',
  client_id: 'e31081bbe6c4c22c45a5',
  authorization_url: 'https://github.com/login/oauth/authorize',
  redirect_uri: 'https://ustuehler.github.io/hack/#GitHubAuthCallback'
};

var OAuth = null;
var github = null;
var config = {};

function initialise(options) {
  if (!OAuth) {
    OAuth = require("$:/plugins/ustuehler/oauth/oauth2-client.js");
  }

  for (var attr in options) {
    if (options.hasOwnProperty(attr)) {
      config[attr] = options[attr];
    }
  }

  for (var attr in defaultConfig) {
    if (!config[attr] && defaultConfig.hasOwnProperty(attr)) {
      config[attr] = defaultConfig[attr];
    }
  }
}

function getProvider() {
	if (github) {
		return github;
	}

  console.log("provider_id: " + config.provider_id);
  console.log("authorization_url: " + config.authorization_url);

  // Force initialisation to ensure that the OAuth module is loaded
  initialise();

	github = new OAuth.Provider({
    id: config.provider_id,
    authorization_url: config.authorization_url
  });

	return github;
}

function requestToken() {
  var provider = getProvider();

	// Create a new request
	var request = new OAuth.Request({
		client_id: config.client_id,
		redirect_uri: config.redirect_uri
	});

	// Give it to the provider
	var uri = provider.requestToken(request);

	// Later we need to check if the response was expected, so save the request
	provider.remember(request);

	// Do the redirect
	window.location.href = uri;
}

function callback() {
  var provider = getProvider();
  var response = google.parse(window.location.hash);

	console.log('GitHub called back!');
	console.log(response);

  // TODO: Set $:/status/OAuth/UserName et al
}

exports.oauth = {
	getProvider: getProvider, // only for inspection
  initialise: initialise,
  requestToken: requestToken,
  callback: callback
};

})(this);
