/*\
title: $:/plugins/ustuehler/github/widgets/action-githubwritefile.js
type: application/javascript
module-type: widget
caption: action-githubwritefile

Action widget that toggles the visibility of the first drawer found in the document

\*/
(function (global) {
  'use strict'
  /*jslint node: true, browser: true */
  /*global $tw: false */

  var Widget = require('$:/core/modules/widgets/widget.js').widget

  var GitHubWriteFileWidget = function (parseTreeNode, options) {
    this.initialise(parseTreeNode, options)
  }

  /*
Inherit from the base widget class
*/
  GitHubWriteFileWidget.prototype = new Widget()

  /*
Render this widget into the DOM
*/
  GitHubWriteFileWidget.prototype.render = function (parent, nextSibling) {
    this.computeAttributes()
    this.execute()
  }

  /*
Compute the internal state of the widget
*/
  GitHubWriteFileWidget.prototype.execute = function () {
    this.template = this.getAttribute('template')
    this.owner = this.getAttribute('owner')
    this.repo = this.getAttribute('repo')
    this.branch = this.getAttribute('branch')
    this.path = this.getAttribute('path')
    this.message = this.getAttribute('message')
    this.committerName = this.getAttribute('name', 'Uwe Stuehler')
    this.committerEmail = this.getAttribute('email', 'ustuehler@growit.io')

    // Compute the internal state of child widgets.
    this.makeChildWidgets()
  }

  /*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
  GitHubWriteFileWidget.prototype.refresh = function (changedTiddlers) {
    var changedAttributes = this.computeAttributes()

    if (changedAttributes.template ||
      changedAttributes.owner ||
      changedAttributes.repo ||
      changedAttributes.branch ||
      changedAttributes.path ||
      changedAttributes.message ||
      changedAttributes.committerName ||
      changedAttributes.committerEmail) {
      this.refreshSelf()
      return true
    }

    return this.refreshChildren(changedTiddlers)
  }

  /*
 * Invoke the action associated with this widget
 */
  GitHubWriteFileWidget.prototype.invokeAction = function (triggeringWidget, event) {
    var username = this.getTemporarySetting('UserName', this.getSetting('username'))
    var password = this.getTemporarySetting('Password', this.getSetting('password'))

    console.log('GitHubWriteFileWidget.prototype.invokeAction')
    console.log(this)

    // basic auth
    var gh = new GitHub({
      username: username,
      password: password
    /* also acceptable:
    token: 'MY_OAUTH_TOKEN'
    */
    })

    /*
  var me = gh.getUser(); // no user specified defaults to the user for whom credentials were provided
  me.listNotifications(function(err, notifications) {
    // do some stuff
    console.log(notifications);
  });
  me.listStarredRepos(function(err, repos) {
    // look at all the starred repos!
    console.log(repos);
  });
  */

    var tiddler = $tw.wiki.getTiddler(this.getVariable('currentTiddler'))

    var owner = this.owner || username
    var branch = this.branch || this.getTemporarySetting('Branch', this.getSetting('branch'))
    var repo = this.repo || (owner + '.github.io')
    var path = this.path || this.computePathFromTiddler(tiddler)

    var content = this.renderTemplate(this.template)
    var message = this.message || ('Update ' + tiddler.fields.title)

    var repository = gh.getRepo(owner, repo)

    var options = {
      committer: {
        name: this.committerName,
        email: this.committerEmail
      }
    }

    if (!password) {
      $tw.utils.error('Please set the password to a valid GitHub personal access token.')
      return true // Action was invoked
    }

    console.log('username: ' + username)
    console.log('password: ' + password.replace(/./g, '*'))
    console.log('owner: ' + owner)
    console.log('repo: ' + repo)
    console.log('branch: ' + branch)
    console.log('path: ' + path)
    console.log('committerName: ' + this.committerName)
    console.log('committerEmail: ' + this.committerEmail)
    console.log('message: ' + message)

    repository.writeFile(branch, path, content, message, options, function (err) {
      if (err) {
        $tw.utils.showSnackbar('Error from GitHub: ' + err)
      } else {
        $tw.utils.showSnackbar('File uploaded: ' + path)
      }
    })

    return true // Action was invoked
  }

  GitHubWriteFileWidget.prototype.renderTemplate = function (template) {
    var contentType = 'text/plain'
    var options = {}

    return this.wiki.renderTiddler(contentType, template, options)
  }

  GitHubWriteFileWidget.prototype.getTemporarySetting = function (name, fallback) {
    return $tw.wiki.getTiddlerText('$:/temp/GitHub/' + name) || fallback
  }

  GitHubWriteFileWidget.prototype.getSetting = function (name, fallback) {
    return $tw.wiki.getTiddlerText('$:/plugins/ustuehler/github/settings/' + name) || fallback
  }

  GitHubWriteFileWidget.prototype.computePathFromTiddler = function (tiddler) {
    var pathPrefix = tiddler.fields['github-path-prefix'] || 'hack/content/'

    if (tiddler.fields['github-path']) {
      return pathPrefix + tiddler.fields['github-path']
    }

    return pathPrefix + this.pathFromTitle(tiddler.fields.title)
  }

  GitHubWriteFileWidget.prototype.pathFromTitle = function (title) {
    var re = /[^$A-Za-z0-9_ -]/g
    return title.replace(re, '_') + '.tid'
  }

  GitHubWriteFileWidget.prototype.tiddlerContent = function (tiddler) {
    var fields = tiddler.fields
    var content = ''

    // https://stackoverflow.com/questions/921789/how-to-loop-through-plain-javascript-object-with-objects-as-members
    for (var field in fields) {
      // skip loop if the property is from prototype
      //if (!fields.hasOwnProperty(field)) continue;

      if (field != 'text' && field != 'created' && field != 'modified' && field != 'bag' && field != 'revision') {
        content += field + ': ' + tiddler.fields[field] + '\n'
      }
    }

    content += '\n' + tiddler.fields.text

    return content
  }

  /*
 * Don't allow actions to propagate, because we invoke actions ourself
 */
  GitHubWriteFileWidget.prototype.allowActionPropagation = function () {
    return false
  }

  exports['action-githubwritefile'] = GitHubWriteFileWidget
})(this)
