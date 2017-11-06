/*\
title: $:/plugins/ustuehler/oauth/widgets/github-auth-callback.js
type: application/javascript
module-type: widget
caption: github-auth-callback

Implement the complete flow of signing in with a GitHub account

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

  this.renderChildren(parent, nextSibling);
};

/*
Compute the internal state of the widget
*/
GitHubAuthCallback.prototype.execute = function() {
  /*
  this.errorTemplate = this.getAttribute("errorTemplate", this.getVariable("errorTemplate"));
  */

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubAuthCallback.prototype.refresh = function(changedTiddlers) {
  /*
  var changedAttributes = this.computeAttributes();

  if (changedAttributes.tiddler || changedAttributes.field || changedAttributes.filter) {
    this.refreshSelf();
    return true;
  }
  */

  return this.refreshChildren(changedTiddlers);
};

exports["github-auth-callback"] = GitHubAuthCallback;

})(this);
