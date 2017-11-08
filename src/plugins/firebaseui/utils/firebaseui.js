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

/*
** Current state of this plugin component
*/

var state = {
	readyEventListeners: [],
	signInSuccessListeners: [],
  authUI: null
};

function getAuthUI() {
  if (!state.authUI) {
    state.authUI = new firebaseui.auth.AuthUI(firebase.auth());
  }
  return state.authUI;
}

function addSignInSuccessListener(listener) {
	state.signInSuccessListeners.push(listener);
}

function dispatchSignInSuccessEvent() {
	while (state.signInSuccessListeners.length > 0) {
		var cb = state.signInSuccessListeners.pop();
		cb();
	}
	state.signInSuccessListeners = [];
}

var addReadyEventListener = function(listener) {
  state.readyEventListeners.push(listener);
};

var dispatchReadyEvent = function() {
  while (state.readyEventListeners.length > 0) {
    var listener = state.readyEventListeners.pop();
    listener();
  }
};

/*
** FirebaseUI configuration
*/

// getUIConfig generates a configuration hash for Firebase UI
function getUIConfig() {
  var signInFlow = getSignInFlow();
  var signInSuccessUrl = getSignInSuccessUrl();
  var tosUrl = getTermsOfServiceUrl();

  return {
		callbacks: {
			signInSuccess: function() {
				dispatchSignInSuccessEvent();
				return true;
			}
		},
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

/*
 * getSignInSuccessUrl returns the URL to which the user will be redirected
 * after she signed in.
 */
function getSignInSuccessUrl() {
  return getBaseUrl() + '#SignInSuccess';
}

/*
 * getTermsOfServiceUrl returns the URL for the "Terms of Service" link in
 * Firebase UI.
 */
function getTermsOfServiceUrl() {
  return getBaseUrl() + '#TermsOfService';
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

/*
** Current operational status of this plugin component
*/

var status = {
  ok: true,
  ready: false,
  error: null,
  initialising: false
};

var initialisingStatus = function() {
  return {
    ok: status.ok,
    ready: status.ready,
    initialising: true,
    error: status.error
  };
};

var readyStatus = function() {
  return {
    ok: true,
    ready: true,
    initialising: false,
    error: null
  };
};

var errorStatus = function(error) {
  return {
    ok: false,
    ready: false,
    initialising: false,
    error: error
  };
};

/*
** Module functions
*/

function getUserName() {
  return $tw.wiki.getTiddlerText('$:/status/OAuth/UserName');;
}

// Check if all initialisation preconditions are fullfilled
function dependenciesReady() {
  return typeof(firebase) !== 'undefined' && typeof(firebaseui) !== 'undefined';
}

/*
 * registerAuthStateListener observes Auth State Changed events from Firebase
 * and reflects the changes in a set of system tiddlers.
 */
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
    console.log('Error in sign-in flow reported by FirebaseUI:')
		console.log(error);
	});
}

// Reveal FirebaseUI and begin the sign-in flow if the user is signed out
function startUI(selector, config) {
  var ui = getAuthUI();

  config = config || getUIConfig();

  console.log('Starting the sign-in flow');
  ui.start(selector, config);
}

// If possible, remove FirebaseUI from the DOM or at least hide the UI
function removeUI(selector) {
  console.log('Canceling the sign-in flow');
  // TODO: find out how to shut down FirebaseUI, or if it's needed
}

/*
** Module exports and initialisation
*/

exports.firebaseui = {
  initialise: initialise,
  addReadyEventListener: addReadyEventListener,
  addSignInSuccessListener: addSignInSuccessListener,
  startSignInFlow: function(selector, config) {
    initialise().then(function() {
      startUI(selector, config);
    });
  },
  cancelSignInFlow: function(selector) {
    initialise().then(function() {
      removeUI(selector);
    });
  },
};

// firebaseuiIsReady resolves as soon as firebaseui.js is loaded
var firebaseuiIsReady = function() {
  var deadline = Date.now() + 60000; // one minute from now
  var interval = 500; // affects the polling frequency
  var allReady = function() {
    return typeof window.firebaseui !== 'undefined';
  }

  return new Promise(function(resolve, reject) {
    var poll = function() {
      var now = Date.now();
      if (allReady()) {
        resolve();
      } else if (now < deadline) {
        setTimeout(poll, Math.min(deadline - now, interval));
      } else {
        reject(new Error('FirebaseUI <script> tags was not loaded in time'));
      }
    };

    // Invoke the poller function once, and then via timeout, maybe
    poll();
  });
};

/*
 * initialise resolves when the FirebaseUI script is loaded and the startUI
 * utility function is ready to be used
 */
function initialise(options) {
  return new Promise(function(resolve, reject) {
    if (status.initialising) {
      addReadyEventListener(resolve);
      return;
    }

    status = initialisingStatus();
    firebaseuiIsReady()
    .then($tw.utils.firebase.initialise())
    .then(function() {
      status = readyStatus();
      resolve(firebaseui);
      // Notify other callers of initialise
      dispatchReadyEvent();
    })
    .catch(function(err) {
      // Disable this component of the plugin
      status = errorStatus(err);
      reject(err);
    });
  });
}

/*
 * Register a global listener for auth state change events. The listener will
 * mirror any auth state changes in a set of system tiddlers.  Initialisation
 * has to complete first, as that guarantees that the symbols "firebase" and
 * "firebaseui" are defined everywhere.
 */
initialise().then(function() {
  console.log('FirebaseUI initialised');
});

}})(this);
