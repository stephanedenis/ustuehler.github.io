/*\
title: $:/plugins/ustuehler/firebase/widgets/action-firebase-database.js
type: application/javascript
module-type: widget
caption: action-firebase-database

The action-firebase-database widget manipulates tiddlers in the Firestore Database

\*/
(function (global) {

'use strict';
/*jslint node: true, browser: true */
/*global $tw: false */

const DATABASE_TIDDLER_PREFIX = '/tiddlers/';

// Base widget class
var Widget = require('$:/core/modules/widgets/widget.js').widget;

// Constructor for this widget
var ActionFirebaseDatabaseWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

// Inherit from the base widget class
ActionFirebaseDatabaseWidget.prototype = new Widget();

/*
 * Render this widget into the DOM
 */
ActionFirebaseDatabaseWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();

  // Insert this widget and its children into the DOM
  this.renderChildren(parent, nextSibling);
};

/*
 * Compute the internal state of the widget
 */
ActionFirebaseDatabaseWidget.prototype.execute = function() {
  this.action = this.getAttribute('$action', ''); // required: 'get' or 'set'
  this.actionTiddler = this.getAttribute('$tiddler', this.getVariable('currentTiddler'));
  this.showSnackbar = this.getAttribute('$snackbar', false);

  // Compute the internal state of child widgets.
  this.makeChildWidgets();
};

/*
 * Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
 */
ActionFirebaseDatabaseWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();

  if (changedAttributes.action ||
      changedAttributes.actionTiddler) {
    this.refreshSelf();
    return true;
  }

  return this.refreshChildren(changedTiddlers);
};

/*
 * Fetch a tiddlers from the database
 */
var getTiddler = function(database, title) {
  return new Promise(function (resolve, reject) {
    return database.ref(DATABASE_TIDDLER_PREFIX + title)
      .once('value') // Read the value once
      .then(function(snapshot) {
        resolve(fields);
      });
  });
}

/*
 * Stores a tiddlers in the database
 */
var putTiddler = function(database, tiddler) {
  return new Promise(function(resolve, reject) {
    // FIXME: figure out how to use set() as a Primise
    database.ref(DATABASE_TIDDLER_PREFIX + tiddler.fields.title)
    .set(filterFields(itiddler.fields));

    resolve();
  });
}

/*
 * Removes internal tiddler fields
 */
var filterFields = function(fields) {
  // XXX: which fields should be hidden?

  var filtered = {};
  for (var field in fields) {
    if (fields.hasOwnProperty(field)) {
      filtered[field] = fields[field];
    }
  }
  return filtered;
}

/*
 * Invoke the action associated with this widget
 */
ActionFirebaseDatabaseWidget.prototype.invokeAction = function(triggeringWidget,event) {
  var self = this;
  var action = this.action;
  var actionTiddler = this.actionTiddler;
  var showSnackbar = function(message) {
    if (self.showSnackbar) {
      $tw.utils.showSnackbar(message);
    }
  };

  $tw.utils.firebase.initialise()
  .then(function() {
    showSnackbar('Preparing for Firebase Database action.');
    console.log('firebase:', firebase);
    var database = firebase.database();

    if (action === 'fetch') {
      getTiddler(database, actionTiddler).then(function(fields) {
        for (var field in fields) {
          $tw.wiki.setField(actionTiddler, field, undefined, fields[field]);
        }
      })
      .then(function() {
        showSnackbar('Fetched ' + actionTiddler);
      })
      .catch(function(error) {
        $tw.utils.error(error);
      });
    } else if (action === 'store') {
      var tiddler = $tw.wiki.getTiddler(actionTiddler);

      putTiddler(database, tiddler)
      .then(function() {
        showSnackbar('Stored ' + actionTiddler);
      })
      .catch(function(error) {
        $tw.utils.error(error);
      });
    } else {
      $tw.utils.error(new Error('Invalid action: "' + action + '" (expected one of: "fetch" or "store")'));
    }
  });

  return true; // Action was invoked
};

exports['action-firebase-database'] = ActionFirebaseDatabaseWidget;

})(this);
