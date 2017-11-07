/*\
title: $:/plugins/ustuehler/oauth/widgets/firebaseui-auth-container.js
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

	// The start method will wait until the DOM is loaded.
	ui.start('#firebaseui-auth-container', uiConfig);

  parent.insertBefore(domNode, nextSibling);
  this.renderChildren(domNode, null);
  this.domNodes.push(domNode);
};

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

exports["firebaseui-auth-container"] = FirebaseUIAuthContainerWidget;

})(this);
