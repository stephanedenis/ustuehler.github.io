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
  this.tiddler = this.getAttribute("tiddler", this.getVariable("currentTiddler"));
  this.field = this.getAttribute("field", "list");
  this.filter = this.getAttribute("filter", "");

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubAuthCallback.prototype.refresh = function(changedTiddlers) {
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
GitHubAuthCallback.prototype.invokeAction = function(triggeringWidget,event) {
  var self = this;

  console.log("GitHubAuthCallback.prototype.invokeAction");
  console.log(self);

  /*
   * $tw.utils.oauth.initialize({
   *   ...
   * });
   */

  /*
   * Redirect to GitHub, let GitHub authenticate the user, and finally, let
   * GitHub redirect back to this TiddlyWiki.
   *
   * Next, the githubauthcallback widget should be rendered somewhere on the
   * page, which in turn invokes the callback() function in this module.
   */
  $tw.utils.oauth.requestToken();
  // notreached

  return true; // Action was invoked
};

/*
 * Invoked by the githubauthcallback widget
 */
function callback() {
  console.log("githubauthcallback called back! \\o/");

  // TODO: Set $:/status/OAuth/UserName et al
}

exports["github-auth-callback"] = GitHubAuthCallback;

})(this);
