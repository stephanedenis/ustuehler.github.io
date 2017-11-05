/*\
title: $:/plugins/ustuehler/github-api/widgets/action-githublistrepos.js
type: application/javascript
module-type: widget
caption: action-githublistrepos

Action widget that toggles the visibility of the first drawer found in the document

\*/
(function (global) {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var GitHubListReposWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
GitHubListReposWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
GitHubListReposWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
GitHubListReposWidget.prototype.execute = function() {
  this.tiddler = this.getAttribute("tiddler", this.getVariable("currentTiddler"));
  this.field = this.getAttribute("field", "list");

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubListReposWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();

  if (changedAttributes.tiddler || changedAttributes.field) {
    this.refreshSelf();
    return true;
  }

  return this.refreshChildren(changedTiddlers);
};

/*
 * Invoke the action associated with this widget
 */
GitHubListReposWidget.prototype.invokeAction = function(triggeringWidget,event) {
  var username = this.getTemporarySetting("UserName", this.getSetting('username'));
  var password = this.getTemporarySetting("Password", this.getSetting('password')); 
  var title = this.tiddler;
  var field = this.field;
  var self = this;

  console.log("GitHubListReposWidget.prototype.invokeAction");
  console.log(self);

  // basic auth
  var gh = new GitHub({
    username: username,
    password: password
    /* also acceptable:
    token: 'MY_OAUTH_TOKEN'
    */
  });

  var me = gh.getUser(); // no user specified defaults to the user for whom credentials were provided

  console.log('Listing GitHub repositories for authenticated user.');
  me.listRepos(function(err, repos) {
    if (err) {
      $tw.utils.showSnackbar("Error from GitHub: " + err);
      return;
    }

    console.log('Found ' + repos.length + ' repositories.');
    console.log(repos);

    var value = $tw.utils.stringifyList(repos);
    var options = {};

    console.log('Setting repository list to ' + value + '.');
    $tw.wiki.setText(title, field, undefined, value, options);
    $tw.utils.showSnackbar('Repository list updated.');
  });

  return true; // Action was invoked
};

GitHubListReposWidget.prototype.renderTemplate = function(template) {
  var contentType = 'text/plain'
  var options = {};

  return this.wiki.renderTiddler(contentType,template,options);
};

GitHubListReposWidget.prototype.getTemporarySetting = function(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/temp/GitHub/' + name) || fallback;
};

GitHubListReposWidget.prototype.getSetting = function(name, fallback) {
  return $tw.wiki.getTiddlerText('$:/plugins/ustuehler/github-api/settings/' + name) || fallback;
};

GitHubListReposWidget.prototype.computePathFromTiddler = function(tiddler) {
  var pathPrefix = tiddler.fields['github-path-prefix'] || 'hack/content/';

  if (tiddler.fields['github-path']) {
    return pathPrefix + tiddler.fields['github-path'];
  }

  return pathPrefix + this.pathFromTitle(tiddler.fields.title);
};

GitHubListReposWidget.prototype.pathFromTitle = function(title) {
  var re = /[^$A-Za-z0-9_ -]/g;
  return title.replace(re, '_') + '.tid';
};

GitHubListReposWidget.prototype.tiddlerContent = function(tiddler) {
  var fields = tiddler.fields;
  var content = '';

  // https://stackoverflow.com/questions/921789/how-to-loop-through-plain-javascript-object-with-objects-as-members
	for (var field in fields) {
		// skip loop if the property is from prototype
		//if (!fields.hasOwnProperty(field)) continue;

		if (field != 'text' && field != 'created' && field != 'modified' && field != 'bag' && field != 'revision') {
			content += field + ': ' + tiddler.fields[field] + "\n";
		}
	}

  content += "\n" + tiddler.fields.text;

  return content;
};

/*
 * Don't allow actions to propagate, because we invoke actions ourself
 */
GitHubListReposWidget.prototype.allowActionPropagation = function() {
  return false;
};

exports["action-githublistrepos"] = GitHubListReposWidget;

})(this);
