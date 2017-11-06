/*\
title: $:/plugins/ustuehler/github-api/utils/oauth.js
type: application/javascript
module-type: utils
caption: oauth

Provides OAuth utility functions under $tw.utils.oauth

\*/
(function (global) { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var urlParams;

var defaultConfig = {
  provider_id: 'github',
  client_id: 'e31081bbe6c4c22c45a5',
  client_secret: '419168692184321b9b3f5e0d2561f83e90255af5',
  authorization_url: 'https://github.com/login/oauth/authorize',
  redirect_uri: 'https://ustuehler.github.io/hack/#GitHubAuthCallback'
};

var OAuth2 = require('simple-oauth2');

function getClient() {
	return OAuth2;
}

console.log('Loaded simple-oauth2');
console.log(getClient());

var github = null;
var config = {};

// initialise may be called multiple times, but must be called before requestToken()
function initialise(options) {
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

  // Load OAuth2
  initialise();

  console.log("provider_id: " + config.provider_id);
  console.log("authorization_url: " + config.authorization_url);

  // TODO: use the querystring package (decode.js)
  var querystring = function() { return urlParams; };
	var client = getClient();

	github = client.create({
    client: {
      id: config.client_id,
      secret: config.client_secret
    },
    auth: {
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
      authorizePath: '/login/oauth/authorize'
    }
  });

	return github;
}

function requestToken() {
  var provider = getProvider();

	// Authorization uri definition
	var uri = provider.authorizationCode.authorizeURL({
		redirect_uri: config.redirect_uri,
		scope: 'gists,repo',
		state: '3(#0/!~',
	});

	// Do the redirect
	window.location.href = uri;
}

function callback() {
	// Using a browser window
	return;

  var provider = getProvider();
	var uri = window.location.href;
  //var response = provider.parse(window.location.href);

	console.log('GitHub called back to:');
	console.log(uri);

  provider.authorizationCode.getToken(options, function(error, result) {
    if (error) {
      console.error('Access Token Error', error.message);
			$tw.utils.showSnackbar('Authentication failed');
			return;
    }

    console.log('The resulting token: ', result);
    const token = provider.accessToken.create(result);

		$tw.wiki.setText('$:/temp/GitHub/Password', 'text', undefined, token);
		//$tw.wiki.setText('$:/temp/GitHub/UserName', 'text', undefined, );
		//$tw.wiki.setText('$:/status/OAuth/UserName', 'text', undefined, user.username);

		$tw.utils.showSnackbar('Signed in with GitHub.');
    return;
  });

/*
	provider.token.getToken(uri).then(function (user) {
		console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... } 

		// Make a request to the github API for the current user. 
		return popsicle.request(user.sign({
			method: 'get',
			url: 'https://api.github.com/user'
		})).then(function (res) {
			console.log(res) //=> { body: { ... }, status: 200, headers: { ... } } 

			if (res.status == 200) {
				$tw.wiki.setText('$:/temp/GitHub/Password', 'text', undefined, user.accessToken);
				$tw.wiki.setText('$:/status/OAuth/UserName', 'text', undefined, user.username);

				$tw.utils.showSnackbar('Signed in with GitHub.');
			} else {
				$tw.utils.showSnackbar('The access token is invalid.');
			}
		})
	})
*/
}

/*
// ref: https://www.npmjs.com/package/client-oauth2
window.oauth2Callback = function (uri) {
  var provider = getProvider();
  //var response = provider.parse(window.location.href);

	console.log('GitHub called back to:');
	console.log(uri);

	provider.token.getToken(uri).then(function (user) {
		console.log(user) //=> { accessToken: '...', tokenType: 'bearer', ... } 

		// Make a request to the github API for the current user. 
		return popsicle.request(user.sign({
			method: 'get',
			url: 'https://api.github.com/user'
		})).then(function (res) {
			console.log(res) //=> { body: { ... }, status: 200, headers: { ... } } 

			if (res.status == 200) {
				$tw.wiki.setText('$:/temp/GitHub/Password', 'text', undefined, user.accessToken);
				$tw.wiki.setText('$:/status/OAuth/UserName', 'text', undefined, user.username);

				$tw.utils.showSnackbar('Signed in with GitHub.');
			} else {
				$tw.utils.showSnackbar('The access token is invalid.');
			}
		})
	})
}
*/

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
	getClient: getClient,
	getProvider: getProvider, // only for inspection
  initialise: initialise,
  requestToken: requestToken,
  callback: callback,
  getUserName: getUserName
};

}})(this);
