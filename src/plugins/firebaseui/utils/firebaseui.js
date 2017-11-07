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
  // 'https://ustuehler.girhub.io/#SignInSuccess'
  var signInSuccessUrl = window.location.href.replace(/\/*\?.*$/, '');
  signInSuccessUrl = signInSuccessUrl + '#SignInSuccess';

  // 'https://ustuehler.girhub.io/#SignInSuccess'
  var tosUrl = window.location.href.replace(/\/*\?.*$/, '');
  tosUrl = tosUrl + '#TermsOfService';

  return {
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
    // Terms of service url.
    tosUrl: tosUrl,
    signInFlow: 'popup'
  };
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
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var uid = user.uid;
			var phoneNumber = user.phoneNumber;
			var providerData = user.providerData;

			user.getIdToken().then(function(accessToken) {
        console.log('User is signed out.')
        console.log('Access token: ' + accessToken);

        /*
				document.getElementById('sign-in-status').textContent = 'Signed in';
				document.getElementById('sign-in').textContent = 'Sign out';
				document.getElementById('account-details').textContent = JSON.stringify({
					displayName: displayName,
					email: email,
					emailVerified: emailVerified,
					phoneNumber: phoneNumber,
					photoURL: photoURL,
					uid: uid,
					accessToken: accessToken,
					providerData: providerData
				}, null, '  ');
        */
			});
		} else {
      console.log('User is signed out.')

			//document.getElementById('sign-in-status').textContent = 'Signed out';
			//document.getElementById('sign-in').textContent = 'Sign in';
			//document.getElementById('account-details').textContent = 'null';
		}
	}, function(error) {
    console.log('Error in sign-in flow.')
		console.log(error);
	});
}

function start() {
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  var uiConfig = getUIConfig();
  var uiContainer = document.querySelector('#firebaseui-auth-container');

  uiContainer.style.display = 'block';
  ui.start('#firebaseui-auth-container', uiConfig);
}

initialise().then(function() {
  console.log("Starting auth state listener.");
  registerAuthStateListener();
});

exports.firebaseui = {
  initialise: initialise,
  start: start,

  show: function() {
    initialise().then(start);
  },

  hide: function() {
    var uiContainer = document.querySelector('#firebaseui-auth-container');

    uiContainer.style.display = 'none';
  }
};

}})(this);
