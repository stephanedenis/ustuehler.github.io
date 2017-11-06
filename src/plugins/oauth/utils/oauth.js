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

var urlParams;

var defaultConfig = {
  provider_id: 'github',
  client_id: 'e31081bbe6c4c22c45a5',
  authorization_url: 'https://github.com/login/oauth/authorize',
  redirect_uri: 'https://ustuehler.github.io/hack/#GitHubAuthCallback'
};

var ClientOAuth2 = null;
var github = null;
var config = {};

// initialise may be called multiple times, but must be called before requestToken()
function initialise(options) {
  if (!ClientOAuth2) {
    ClientOAuth2 = require("$:/plugins/ustuehler/oauth/client-oauth2.js");
  }

	if (!urlParams) {
		urlParams = computeURLParams();
  }

  for (var attr in options) {
    if (options.hasOwnProperty(attr)) {
      config[attr] = options[attr];
    }
  }

  // Update hardcoded defaults to current configuration
  defaultConfig.client_id = $tw.wiki.getTiddlerText('$:/config/OAuth/ClientID') || defaultConfig.client_id;
  defaultConfig.redirect_uri = $tw.wiki.getTiddlerText('$:/config/OAuth/RedirectURI') || defaultRedirectURI();

  for (var attr in defaultConfig) {
    if (!config[attr] && defaultConfig.hasOwnProperty(attr)) {
      config[attr] = defaultConfig[attr];
    }
  }
}

function defaultRedirectURI() {
  var baseURI = window.location.href.replace(/\/*\?.*$/, '');

  return baseURI; // + '#GitHubAuthCallback';
}

function getProvider() {
	if (github) {
		return github;
	}

  console.log("provider_id: " + config.provider_id);
  console.log("authorization_url: " + config.authorization_url);

  // Load ClientOAuth2
  initialise();

	github = new ClientOAuth2.Provider({
    id: config.provider_id,
    authorization_url: config.authorization_url
  });

	return github;
}

function requestToken() {
  var provider = getProvider();

	// Create a new request
	var request = new ClientOAuth2.Request({
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
  var response = provider.parse(window.location.href);

	console.log('GitHub called back!');
	console.log(response);

  // TODO: Set $:/status/OAuth/UserName et al
  //$tw.wiki.setText('$:/status/OAuth/UserName', 'text', undefined, response.???);
}

function getUserName() {
  return $tw.wiki.getTiddlerText('$:/status/OAuth/UserName');;
}

// ref: https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function computeURLParams() {
	var match,
			pl     = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
			query  = window.location.search.substring(1);

	var urlParams = {};
	while (match = search.exec(query))
		 urlParams[decode(match[1])] = decode(match[2]);
	return urlParams;
}

exports.oauth = {
	getProvider: getProvider, // only for inspection
  initialise: initialise,
  requestToken: requestToken,
  callback: callback,
  getUserName: getUserName
};

})(this);
