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
};

/*
Compute the internal state of the widget
*/
GitHubUserKeysWidget.prototype.execute = function() {
  this.tiddler = this.getAttribute("tiddler", this.getVariable("currentTiddler"));
  this.field = this.getAttribute("field", "list");
  this.filter = this.getAttribute("filter", "");

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
GitHubUserKeysWidget.prototype.refresh = function(changedTiddlers) {
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
GitHubUserKeysWidget.prototype.invokeAction = function(triggeringWidget,event) {
  var username = this.getTemporarySetting("UserName", this.getSetting('username'));
  var password = this.getTemporarySetting("Password", this.getSetting('password')); 
  var title = this.tiddler;
  var field = this.field;
  var filter = this.filter;
  var self = this;

  console.log("GitHubUserKeysWidget.prototype.invokeAction");
  console.log(self);

  // TODO: move this code fragment to $tw.utils.github

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

    var repoNames = [];

    for (var i in repos) {
      var fullName = repos[i].full_name;
      repoNames.push(fullName);
    }

    var value = $tw.utils.stringifyList(repoNames);
    var options = {};

    // Reduce the list by a filter
    if (filter.length > 0) {
      repoNames = $tw.wiki.filterTiddlers(value + ' +' + filter);
      value = $tw.utils.stringifyList(repoNames);
      console.log('Reduced the list to ' + repoNames.length + ' repositories.');
    }

    console.log('Setting repository list to ' + value + '.');
    $tw.wiki.setText(title, field, undefined, value, options);

    var message = 'Found ' + repoNames.length + ' repositories.';
    if (repoNames.length != repos.length) {
      message = 'Found ' + repoNames.length + ' repositories matching the filter.';
    }

    $tw.utils.showSnackbar(message);
  });

  return true; // Action was invoked
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
