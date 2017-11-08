/*\
title: $:/plugins/ustuehler/firebaseui/widgets/firebaseui-auth-container.js
type: application/javascript
module-type: widget
caption: firebaseui-auth-container

The firebaseui-auth-container widget renders the container element that is
required by FirebaseUI.

Attempting to render more than one occurrances of this widget anywhere in the
DOM will result in an error message being rendered for the second and all
following occurrances.

\*/
(function (global) {

'use strict';
/*jslint node: true, browser: true */
/*global $tw: false */

// HTML tag and attributes for the FirebaseUI auth container element
const FIREBASEUI_AUTH_CONTAINER_ELEMENT = 'div';
const FIREBASEUI_AUTH_CONTAINER_ID = 'firebaseui-auth-container';

// Base widget class
var Widget = require('$:/core/modules/widgets/widget.js').widget;

// Constructor for this widget
var FirebaseUIAuthContainerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

// Inherit from the base widget class
FirebaseUIAuthContainerWidget.prototype = new Widget();

/*
 * Render this widget into the DOM
 */
FirebaseUIAuthContainerWidget.prototype.render = function(parent,nextSibling) {
  var self = this;
  var domNode;

	this.computeAttributes();
	this.execute();

  // Create the FirebaseUI auth container element
  domNode = document.createElement(FIREBASEUI_AUTH_CONTAINER_ELEMENT);
  domNode.setAttribute('id', FIREBASEUI_AUTH_CONTAINER_ID);
	// XXX: set min-height to avoid layout changes, since the grid layout doesn't notice this change yet; should listen for child changes and notify the grid manager here, instead of cheating with style
  domNode.setAttribute('style', 'min-height: 40;');

  // Insert this widget and its children into the DOM
  parent.insertBefore(domNode, nextSibling);
  this.renderChildren(domNode, null);
  this.domNodes.push(domNode);

  /*
   * Start the FirebaseUI. This will insert additional DOM nodes into the
   * container element to allow the user to begin the sign-in flow, unless the
   * user is already signed in. To log out, another UI element must be created.
   */
  $tw.utils.firebaseui.startSignInFlow('#' + FIREBASEUI_AUTH_CONTAINER_ID);
	$tw.utils.firebaseui.addSignInSuccessListener(function() {
		self.domNodes[0].style.display = 'none';
	});
};

/*
 * Remove FirebaseUI nodes from the DOM
 */
FirebaseUIAuthContainerWidget.prototype.removeChildDomNodes = function() {
	var domNode = this.domNodes[0];

  $tw.utils.firebaseui.cancelSignInFlow('#' + FIREBASEUI_AUTH_CONTAINER_ID);

	// Delete all child nodes left over by FirebaseUI
	console.log('FirebaseUIAuthContainerWidget: Removing child DOM nodes');
	$tw.utils.each(domNode.childNodes,function(childNode) {
		console.log('FirebaseUIAuthContainerWidget: Removing left-over FirebaseUI element: ' + childNode.tag);
		domNode.removeChild(childNode);
	});

	$tw.utils.each(this.domNodes,function(domNode) {
		domNode.parentNode.removeChild(domNode);
	});
	this.domNodes = [];
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

exports['firebaseui-auth-container'] = FirebaseUIAuthContainerWidget;

})(this);
