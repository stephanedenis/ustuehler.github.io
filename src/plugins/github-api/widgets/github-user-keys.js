/*\
title: $:/plugins/ustuehler/github-api/widgets/github-user-keys.js
type: application/javascript
module-type: widget
caption: github-user-keys

Widget that renders the public keys for a given GitHub user

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var GitHubUserKeysWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
GitHubUserKeysWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
GitHubUserKeysWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();

  // This widget is invisible, but it can have visible children
  this.renderChildren(parent, nextSibling);
};

/*
Compute the internal state of the widget
*/
GitHubUserKeysWidget.prototype.execute = function() {
  var defaultUser = this.getTemporarySetting("UserName", this.getSetting("username"));

  this.user = this.getAttribute("user", defaultUser);

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubUserKeysWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();

  if (changedAttributes.user) {
    this.refreshSelf();
    return true;
  }

  return this.refreshChildren(changedTiddlers);
};

// TODO: move getTemporarySetting and getSetting to $tw.utils.github

GitHubUserKeysWidget.prototype.getTemporarySetting = function(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/temp/GitHub/' + name) || fallback;
};

GitHubUserKeysWidget.prototype.getSetting = function(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/plugins/ustuehler/github-api/settings/' + name) || fallback;
};

exports["github-user-keys"] = GitHubUserKeysWidget;

})(this);
