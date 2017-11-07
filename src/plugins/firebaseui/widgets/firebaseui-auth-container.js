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

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var FirebaseUIAuthContainerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
 * Inherit from the base widget class
 */
FirebaseUIAuthContainerWidget.prototype = new Widget();

/*
 * Render this widget into the DOM
 */
FirebaseUIAuthContainerWidget.prototype.render = function(parent,nextSibling) {
  var self = this;
  var qualify = Date.now() + '';
  var id = 'firebaseui-auth-container-' + qualify;

	this.computeAttributes();
	this.execute();

  var domNode = document.createElement('div');
  domNode.setAttribute('id', id);

  parent.insertBefore(domNode, nextSibling);
  self.renderChildren(domNode, null);
  this.domNodes.push(domNode);
  this.domNode = domNode;

  $tw.utils.firebaseui.start('#firebaseui-auth-container-' + qualify);
};

/*
 * Compute the internal state of the widget
 */
FirebaseUIAuthContainerWidget.prototype.execute = function() {
  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
 * Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
 */
FirebaseUIAuthContainerWidget.prototype.refresh = function(changedTiddlers) {
  return this.refreshChildren(changedTiddlers);
};

exports["firebaseui-auth-container"] = FirebaseUIAuthContainerWidget;

})(this);
