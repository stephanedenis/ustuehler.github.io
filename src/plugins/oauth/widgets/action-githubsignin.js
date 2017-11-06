/*\
title: $:/plugins/ustuehler/oauth/widgets/action-githubsignin.js
type: application/javascript
module-type: widget
caption: action-githubsignin

Trigger the OAuth Flow to sign in with a GitHub account

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var GitHubSignInWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
GitHubSignInWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
GitHubSignInWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
GitHubSignInWidget.prototype.execute = function() {
  this.tiddler = this.getAttribute("tiddler", this.getVariable("currentTiddler"));
  this.field = this.getAttribute("field", "list");
  this.filter = this.getAttribute("filter", "");

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubSignInWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();

  if (changedAttributes.tiddler || changedAttributes.field || changedAttributes.filter) {
    this.refreshSelf();
    return true;
  }

  return this.refreshChildren(changedTiddlers);
};

/*
 * Invoke the action associated with this widget
 */
GitHubSignInWidget.prototype.invokeAction = function(triggeringWidget,event) {
  var username = this.getStatus("UserName", this.getConfig('username'));
  var password = this.getStatus("Password", this.getConfig('password')); 
  var title = this.tiddler;
  var field = this.field;
  var filter = this.filter;
  var self = this;

  console.log("GitHubSignInWidget.prototype.invokeAction");
  console.log(self);

  return true; // Action was invoked
};

GitHubSignInWidget.prototype.getStatus = function(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/status/OAuth/' + name) || fallback;
};

GitHubSignInWidget.prototype.getConfig = function(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/config/OAuth/' + name) || fallback;
};

/*
 * Don't allow actions to propagate, because we invoke actions ourself
 */
GitHubSignInWidget.prototype.allowActionPropagation = function() {
  return false;
};

exports["action-githubsignin"] = GitHubSignInWidget;

})(this);
