/*\
title: $:/plugins/ustuehler/firebaseui/widgets/firebaseui-auth-container.js
type: application/javascript
module-type: widget
caption: firebaseui-auth-container

Implements the complete flow of signing in with a GitHub account

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

// FirebaseUI config.
var uiConfig = {
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

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var FirebaseUIAuthContainerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
FirebaseUIAuthContainerWidget.prototype = new Widget();

var initialized = false;

/*
Render this widget into the DOM
*/
FirebaseUIAuthContainerWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();

  var domNode = document.createElement('div');
  domNode.setAttribute('id', 'firebaseui-auth-container');

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());

	if (!initialized) {
		initialized = true;
		registerAuthStateListener();
	}

	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);

  parent.insertBefore(domNode, nextSibling);
  this.renderChildren(domNode, null);
  this.domNodes.push(domNode);
};

FirebaseUIAuthContainerWidget.prototype.registerAuthStateListener = function() {
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
			});
		} else {
			// User is signed out.
			document.getElementById('sign-in-status').textContent = 'Signed out';
			document.getElementById('sign-in').textContent = 'Sign in';
			document.getElementById('account-details').textContent = 'null';
		}
	}, function(error) {
		console.log(error);
	});
}

/*
Compute the internal state of the widget
*/
FirebaseUIAuthContainerWidget.prototype.execute = function() {
  /*
  this.errorTemplate = this.getAttribute("errorTemplate", this.getVariable("errorTemplate"));
  */

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
FirebaseUIAuthContainerWidget.prototype.refresh = function(changedTiddlers) {
  /*
  var changedAttributes = this.computeAttributes();

  if (changedAttributes.tiddler || changedAttributes.field || changedAttributes.filter) {
    this.refreshSelf();
    return true;
  }
  */

  return this.refreshChildren(changedTiddlers);
};

window.addEventListener('load', function() {
	registerAuthStateListener();
});


exports["firebaseui-auth-container"] = FirebaseUIAuthContainerWidget;

})(this);
