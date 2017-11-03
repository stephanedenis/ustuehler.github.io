/*\
title: $:/plugins/ustuehler/github-api/widgets/github.js
type: application/javascript
module-type: widget

Invisible GitHub API widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var GitHubWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
GitHubWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
GitHubWidget.prototype.render = function(parent,nextSibling) {
	// Compute attributes and execute state
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
};

GitHubWidget.prototype.readSetting = function(name) {
  self.wiki.setText('$:/plugins/ustuehler/github-api/settings/username','text',undefined,attribute,options);
};

/*
Compute the internal state of the widget
*/
GitHubWidget.prototype.execute = function() {
	// Get attributes
	this.username = this.getAttribute("username", this.getAttributeSetting("username"));
	this.password = this.getAttribute("password", this.getAttributeSetting("password"));

  if (!this.username) {
    this.username = this.getAttributeStatus("UserName");
  }
  if (!this.password) {
    this.password = this.getAttributeStatus("Password");
  }

  this.setVariable('github-username', this.username);
  this.setVariable('github-password', this.password);

  // XXX: wrong place to modify tiddlers!
  //this.setAttributeStatus('UserName', this.username);
  //this.setAttributeStatus('Password', this.password);

	// Make child widgets
	this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if (changedAttributes.username || changedAttributes.password) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
 * Get the default value for an attribute from a settings tiddler
 */
GitHubWidget.prototype.getAttributeSetting = function(name) {
  var settingsTiddler = '$:/plugins/ustuehler/github/settings/' + name;
  return $tw.wiki.getTiddlerText(settingsTiddler);
}

GitHubWidget.prototype.getAttributeStatus = function(name) {
  var settingsTiddler = '$:/status/GitHub/' + name;
  return $tw.wiki.getTiddlerText(settingsTiddler);
}

GitHubWidget.prototype.setAttributeStatus = function(name, value) {
  var statusTiddler = '$:/status/GitHub/' + name;
  var options = {};

  return $tw.wiki.setText(statusTiddler, 'text', undefined, value, options);
}

exports.github = GitHubWidget;

})();
