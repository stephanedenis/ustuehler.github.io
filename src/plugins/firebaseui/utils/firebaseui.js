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

// getUIConfig generates a configuration hash for Firebase UI
function getUIConfig() {
  var signInFlow = this.getSignInFlow();
  var signInSuccessUrl = this.getSignInSuccessUrl();
  var tosUrl = this.getTermsOfServiceUrl();

  return {
    signInFlow: signInFlow,
    signInSuccessUrl: signInSuccessUrl,
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID
      //firebase.auth.EmailAuthProvider.PROVIDER_ID,
      //firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    tosUrl: tosUrl
  };
}

// getBaseUrl infers the wiki's base URL from the current window location
function getBaseUrl() {
  // XXX: There is certainly a configuration parameter to set the base URL which we can read, or another function already in core that returns the base URL without looking at the window location.
  return window.location.href.replace(/\/*\?.*$/, '');
}

function getSignInSuccessUrl() {
  return this.getBaseUrl() + '#SignInSuccess';
}

function getTermsOfServiceUrl() {
  return this.getBaseUrl() + '#TermsOfService';
}

/*
 * getSignInFlow is supposed to determine whether the 'popup' or 'redierct'
 * flow should be used for sign-in. The redirect flow relies on Cross-Origin
 * Resource Sharing policy, which is sometimes hard to control, so we use
 * 'popup' instead until there's a reason to support 'redirect' as well.
 */
function getSignInFlow() {
  return 'popup';
}

function getUserName() {
  return $tw.wiki.getTiddlerText('$:/status/OAuth/UserName');;
}

// Wait until the firebase <script> tag is loaded
function initialise(options) {
  return new Promise(function(resolve, reject) {
    var tries = 120;
    var poll;

    poll = function() {
      if (typeof(firebase) !== 'undefined') {
        resolve();
      } else if (tries < 1) {
        reject('gave up waiting for firebaseui to load');
      } else {
        // Try again later...
        setTimeout(poll, 500);
        tries -= 1;
      }
    };

    // Set the initial timeout
    setTimeout(poll, 500);
  });
}

function registerAuthStateListener() {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			var displayName = user.displayName;
      var firstName = user.displayName.split(' ')[0];
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var uid = user.uid;
			var phoneNumber = user.phoneNumber;
			var providerData = user.providerData;

			user.getIdToken().then(function(accessToken) {
        $tw.wiki.setText('$:/temp/OAuth/Provider', 'type', undefined, 'text/plain');
        $tw.wiki.setText('$:/temp/OAuth/Provider', 'text', undefined, providerData);
        $tw.wiki.setText('$:/temp/OAuth/AccessToken', 'text', undefined, accessToken);

        $tw.wiki.setText('$:/status/OAuth/User', 'uid', undefined, uid);
        $tw.wiki.setText('$:/status/OAuth/User', 'email', undefined, email);
        $tw.wiki.setText('$:/status/OAuth/User', 'email-verified', undefined, emailVerified);
        $tw.wiki.setText('$:/status/OAuth/User', 'phone-number', undefined, phoneNumber);
        $tw.wiki.setText('$:/status/OAuth/User', 'photo-url', undefined, photoURL);
        $tw.wiki.setText('$:/status/OAuth/User', 'caption', undefined, displayName);
			});
		} else {
      $tw.wiki.deleteTiddler('$:/temp/OAuth/AccessToken');
      $tw.wiki.deleteTiddler('$:/temp/OAuth/Provider');
      $tw.wiki.deleteTiddler('$:/status/OAuth/User');
		}
	}, function(error) {
    console.log('Error in sign-in flow.')
		console.log(error);
	});
}

function startUI(selector) {
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  var uiConfig = getUIConfig();

  ui.start(selector, uiConfig);
}

initialise().then(function() {
  console.log("Starting auth state listener.");
  registerAuthStateListener();
});

exports.firebaseui = {
  initialise: initialise,
  start: function(selector) {
    initialise().then(function(selector) {
      startUI(selector);
    });
  },
};

}})(this);
