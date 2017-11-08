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

const X_FIREBASE_DELETED = 'x-firebase-deleted';  // accepts "yes" or "no"

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
  this.actionTimestamp = this.getAttribute('$timestamp', true);
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
 * Fetch a tiddler's fields from the database
 */
var fetchTiddlerFields = function(database, title) {
  var encodedTitle = encodeTitle(title);

  return new Promise(function (resolve, reject) {
    return database.ref(DATABASE_TIDDLER_PREFIX + encodedTitle)
      .once('value') // Read the value once
      .then(function(snapshot) {
        resolve(snapshot.val());
      });
  });
}

/*
 * Stores the tiddler's normal fields in the database
 */
var storeTiddler = function(database, tiddler) {
  return new Promise(function(resolve, reject) {
    var encodedTitle = encodeTitle(tiddler.fields.title);

    // FIXME: figure out how to use set() as a Promise
    database.ref(DATABASE_TIDDLER_PREFIX + encodedTitle)
    .set(filteredTiddlerFields(tiddler));

    resolve();
  });
}

/*
 * Removes internal tiddler fields
 */
var filteredTiddlerFields = function(tiddler) {
  var filtered = {};

  for (var field in tiddler.fields) {
    filtered[field] = tiddler.fields[field];
  }

  filtered['created'] = tiddler.getFieldString('created');
  filtered['modified'] = tiddler.getFieldString('modified');

  return filtered;
}

var encodeTitle = function(title) {
  if (title.startsWith('$:')) {
    title = title.replace('$:', 'system');
  } else {
    title = 'content/' + title;
  }
  return window.encodeURI(title);
};

/*
 * Constructs a new tiddler from the given fields
 */
var newTiddler = function(title, fields, actionTimestamp) {
  var creationFields,
    modificationFields;

  if (actionTimestamp) {
    creationFields = $tw.wiki.getCreationFields();
    modificationFields = $tw.wiki.getModificationFields();
  }

  var tiddler = new $tw.Tiddler(creationFields,fields,modificationFields,{title: title});
  return tiddler;
};

/*
 * Creates or replaces the named tiddler from the given fields
 */
var addTiddler = function(title, fields, actionTimestamp) {
  var tiddler = newTiddler(title, fields, actionTimestamp);

  $tw.wiki.addTiddler(tiddler);

  return tiddler;
};

/*
 * Fetches a tiddler from the database
 */
ActionFirebaseDatabaseWidget.prototype.fetchTiddler = function(database, actionTiddler, showSnackbar) {
  var actionTimestamp = this.actionTimestamp;

  return new Promise(function(resolve, reject) {
    fetchTiddlerFields(database, actionTiddler).then(function(fields) {
      return new Promise(function(resolve, reject) {
        // Add or replace the actionTiddler
        var tiddler = addTiddler(actionTiddler, fields, actionTimestamp);
        resolve(tiddler);
      });
    })
    .then(function(tiddler) {
      showSnackbar('Fetched ' + tiddler.fields.title);
      resolve(tiddler);
    })
    .catch(function(error) {
      $tw.utils.error(error);
    });
  });
};

/*
 * Stores a tiddler in the database
 */
ActionFirebaseDatabaseWidget.prototype.storeTiddler = function(database, actionTiddler, showSnackbar) {
  return new Promise(function(resolve, reject) {
    var tiddler = $tw.wiki.getTiddler(actionTiddler);

    storeTiddler(database, tiddler)
    .then(function() {
      showSnackbar('Stored ' + actionTiddler);
      resolve();
    })
    .catch(function(error) {
      $tw.utils.error(error);
    });
  });
};

/*
 * Delete a tiddler from the database. Actually, just mark it as deleted
 * because then we can support resurrection of the last version.  It also
 * makes synchronisation of deletions trivial.
 */
ActionFirebaseDatabaseWidget.prototype.deleteTiddler = function(database, actionTiddler, showSnackbar) {
  return new Promise(function(resolve, reject) {
    return fetchTiddlerFields(database, actionTiddler)
    .then(function(fields) {
      var deletedFields = { X_FIREBASE_DELETED: 'yes' };
      var deletedTiddler = newTiddler(actionTiddler, fields, deletedFields);

      storeTiddler(database, deleteTiddler);
      resolve([deletedTiddler, action]);
    });
  });
};

/*
 * Synchronises a tiddler with the database
 */
ActionFirebaseDatabaseWidget.prototype.syncTiddler = function(database, actionTiddler, showSnackbar) {
  var self = this;
  var tiddler = $tw.wiki.getTiddler(actionTiddler);

  fetchTiddlerFields(database, actionTiddler)
  .then(function(fields) {
    console.log('sync: prefetched fields:', fields);

    var snapshot = newTiddler(actionTiddler, fields, false);
    var action = 'noop';

    /*
     * Decide what to do to synchronise the local and remote tiddlers based on
     * the "modified" and "x-firebase-deleted" fields. The latter is a custom
     * field introduced by this plugin.
     */
    if (!tiddler) {
      console.log('!', tiddler);

      action = 'delete-remote';
    } else if (!snapshot.fields.modified || snapshot.fields.modified < tiddler.fields.modified) {
      console.log('!', snapshot.fields.modified);
      console.log(snapshot.fields.modified, '<', tiddler.fields.modified);

      action = 'store';
    } else if (snapshot.fields.modified > tiddler.fields.modified) {
      console.log(snapshot.fields.modified, '>', tiddler.fields.modified);

      if (snapshot.fields['x-firebase-deleted'] == 'yes') {
        console.log('snapshot.fields.deleted', snapshot.fields.deleted);

        action = 'delete-local';
      } else {
        action = 'fetch';
      }
    }

    return new Promise(function(resolve, reject) {
      console.log('syncTiddler: Resolved', actionTiddler, 'with', action, 'action');
      resolve([snapshot, action]);
    });
  })
  .then(function(v) {
    var snapshot = v[0], action = v[1];
    return new Promise(function(resolve, reject) {
      console.log('snapshot:', snapshot);
      console.log('action:', action);

      if (action == 'fetch') {
        // Local tiddler needs to be updated frmo database
        var op = self.fetchTiddler(database, actionTiddler, showSnackbar);
        return op.then(function(tiddler) {
           resolve([tiddler, action]);
        });
      } else if (action == 'store') {
        // Remote tiddler in database needs to be updated from local
        var op = self.storeTiddler(database, actionTiddler, showSnackbar);
        return op.then(function() {
          resolve([snapshot, action]);
        });
      } else if (action == 'delete-remote') {
        var op = self.deleteTiddler(database, actionTiddler, showSnackbar);
        return op.then(function(deletedTiddler) {
          resolve([deletedTiddler, action]);
        });
      } else if (action == 'delete-local') {
        $tw.wiki.deleteTiddler(actionTiddler);
        return resolve([snapshot, action]);
      } else {
        // Local tiddler was already up-to-date
        return resolve([snapshot, action]);
      }
    });
  })
  .then(function(v) {
    var tiddler = v[0], action = v[1];
    showSnackbar('Synchronised ' + tiddler.fields.title + ' with "' + action + '" action.');
  })
  .catch(function(error) {
    $tw.utils.error(error);
  });
};

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
    console.log('firebase:', firebase);
    var database = firebase.database();

    if (action === 'delete') {
      self.deleteTiddler(database, actionTiddler, showSnackbar);
    } else if (action === 'fetch') {
      self.fetchTiddler(database, actionTiddler, showSnackbar);
    } else if (action === 'store') {
      self.storeTiddler(database, actionTiddler, showSnackbar);
    } else if (action === 'sync') {
      self.syncTiddler(database, actionTiddler, showSnackbar);
    } else {
      $tw.utils.error(new Error(
        'Invalid action for action-firebase-database widget: "' + action
        + '" (expected one of: "delete", "fetch", "store" or "sync")'
      ));
    }
  });

  return true; // Action was invoked
};

exports['action-firebase-database'] = ActionFirebaseDatabaseWidget;

})(this);
