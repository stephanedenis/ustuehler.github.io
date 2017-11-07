/*\
title: $:/plugins/ustuehler/github-api/utils/firebaseui.js
type: application/javascript
module-type: utils
caption: firebaseui

Provides FirebaseUI functions under $tw.utils.firebaseui

\*/
(function (global) { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

// FirebaseUI config.
function getUIConfig() {
  return {
    signInSuccessUrl: 'https://ustuehler.girhub.io/#SignInSuccess',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID
      //firebase.auth.EmailAuthProvider.PROVIDER_ID,
      //firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: 'https://ustuehler.girhub.io/#TermsOfService'
  };
}

function initialise(options) {
  return new Promise(function(resolve, reject) {
    var tries = 120;
    var poll;

    poll = function() {
      if (typeof(firebase) !== 'undefined') {
        resolve();
      } else if (tries < 1) {
        reject();
      } else {
        // Try again later...
        setTimeout(poll, 500);
      }
    }

};
setTimeout(loader, 500);
  });
}

function defaultRedirectURI() {
  var baseURI = window.location.href.replace(/\/*\?.*$/, '');

  return baseURI + '#GitHubAuthCallback';
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
  var redirect_uri = config.redirect_uri;
	var self = this;

  console.log('redirect_uri: ' + redirect_uri);

	// Authorization uri definition
	var uri = provider.authorizationCode.authorizeURL({
		redirect_uri: redirect_uri,
		scope: 'gists,repo',
		state: '3(#0/!~',
	});

	// Do the redirect
	//window.location.href = uri;

  // If it fails because of CORS (net::ERR_ABORTED)...

  /*
   * Workaround #1: Popup window
  */
	openPopup(uri, function(err, code) {
    if (err) {
      console.log('openPopup (oauth-open): ' + err);
    } else {
      console.log('openPopup callback fired:');
      console.log(code);

      //var base = window.location.href.replace(/\/*\?.*$/, '');
      //var uri = base + '?code=' + code.code;
      var uri = window.location.href;

      callback(uri);
    }
	});

  /*
   * Workaround #2: JSNOP
  var opts = { name: 'github' };

  var cancel = jsonp(uri, opts, function(err, data) {
    console.log("JSONP callback invoked");

    if (err) {
      console.log("Get error: " + err);
      return;
    }

    console.log("Got data:");
    console.log(data);
    // TODO:
    // window.location.assign(...)
    // callback()
  });
  */
}

/*
function jsonpRequest(uri) {
  return new Promise(function(resolve, reject) {
    var script;

    window.oauth2callback = function(response) {
      var meta = response.meta;
      var data = response.data;

      console.log('oauth2callback response meta + data:');
      console.log(meta);
      console.log(data);

      resolve(response);
      // TODO: on error: reject();
    }

    uri = uri + '&callback=oauth2callback';
    window.location.assign = uri;

    console.log('Redirect location: ' + uri);
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = uri;
  });
}
*/

function callback(uri) {
  var provider = getProvider();
  var options = {};

	uri = uri || window.location.href;
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

exports.firebaseui = {
  initialise: initialise
};

}})(this);
