/*\
title: $:/plugins/ustuehler/oauth/widgets/github-auth-callback.js
type: application/javascript
module-type: widget
caption: github-auth-callback

Trigger the OAuth Flow to sign in with a GitHub account

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var GitHubAuthCallback = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
GitHubAuthCallback.prototype = new Widget();

/*
Render this widget into the DOM
*/
GitHubAuthCallback.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
GitHubAuthCallback.prototype.execute = function() {
  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubAuthCallback.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();

  return this.refreshChildren(changedTiddlers);
};

exports["github-auth-callback"] = GitHubAuthCallback;

})(this);
