/*\
title: $:/plugins/ustuehler/firebase/lib/database/tiddlers.js
type: application/javascript
module-type: library

Provides a tiddler data store interface to a Firebase database

\*/
(function (global) { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var database = require('$:/plugins/ustuehler/firebase/lib/database.js');

// prefix for all tiddlers in the database
const TIDDLERS_REF = '/tiddlers/';

// field which marks a FirebaseTiddler as deleted
const DELETED_FIELD = 'x-firebase-deleted';  // accepts "yes" or "no"

/*
** Runtime state of this plugin component
*/

var state = {
  // database ref
  ref: null
};

/*
** Firebase Database Tiddler manipulation
*/

var ref() {
  return TIDDLERS_REF;
}

/*
 * Delete a tiddler from the database. Actually, just mark it as deleted
 * because then we can support resurrection of the last version.  It also
 * makes synchronisation of deletions trivial.
 */
var deleteTiddler = function(title) {
  return new Promise(function(resolve, reject) {
    return fetchTiddlerFields(title).then(function(fields) {
      fields[DELETED_FIELD] = 'yes';

      var deletedTiddler = newTiddler(title, fields, true);

      return storeTiddler(deletedTiddler);
    });
  });
};

/*
 * fetchTiddler resolves to a tiddler from the database
 */
var fetchTiddler = function(title) {
  var actionTimestamp = this.actionTimestamp;

  return fetchTiddlerFields(title).then(function(fields) {
    return newTiddler(title, fields, actionTimestamp);
  });
};

/*
 * Stores a tiddler in the database
 */
var storeTiddler = function(tiddler) {
  return storeTiddlerFields(tiddler.fields).then(function() {
    return tiddler;
  });
};

/*
 * syncTiddlerCompare determines the correct action to take in order to
 * synchronise a local tiddler and its corresponding tiddler in the database.
 * Whichever tiddler was modified later wins and resolves this promise.
 *
 * The promise resolves to a list of three objects: local tiddler, remote
 * tiddler, and a string for the sync action to take.
 */
var syncTiddlerCompare = function(local, remote) {
  var title = local.fields.title,
      action = 'noop';

  console.log('syncTiddlerCompare:', title, 'local:', local,
    'remote:', remote, 'remoteFields:', remoteFields);

  /*
   * Decide what to do to synchronise the local and remote tiddlers based on
   * the "modified" and "x-firebase-deleted" fields. The latter is a custom
   * field introduced by this plugin.
   */
  if (!local) {
    console.log('Local tiddler does not exist');

    if (remote.fields[DELETED_FIELD] == 'yes') {
      action = 'noop';
    } else {
      action = 'fetch';
    }
  } else if (!remote.fields.modified ||
    remote.fields.modified < local.fields.modified) {

    console.log('Local tiddler was modified more recently than remote');
    console.log(remote.fields.modified, '<', local.fields.modified);

    action = 'store';
  } else if (remote.fields.modified > local.fields.modified) {
    console.log('Snapshot tiddler was modified more recently than local');
    console.log(remote.fields.modified, '>', local.fields.modified);

    if (remote.fields[DELETED_FIELD] == 'yes') {
      console.log('remote.fields.deleted', remote.fields.deleted);

      action = 'delete-local';
    } else {
      action = 'fetch';
    }
  }

  console.log('syncTiddler: Resolved', title, 'with', action, 'action');
  return Promise.resolve([local, remote, action]);
};

// Execute the given sync action
var syncTiddlerExecute = function(values) {
  var local = values[0], remote = values[1], action = values[2];

  if (action == 'fetch') {
    // Local tiddler needs to be updated from database
    $tw.wiki.addTiddler(remote);
    return Promise.resolve([remote, action]);
  } else if (action == 'store') {
    // Remote tiddler in database needs to be updated from local
    return storeTiddler(local).then(function() {
      return Promise.resolve([local, action]);
    });
  }

  if (action == 'delete-remote') {
    return deleteTiddler(remote).then(function() {
      return Promise.resolve([null, action]);
    });
  }

  if (action == 'delete-local') {
    $tw.wiki.deleteTiddler(actionTiddler);
    return resolve([null, action]);
  }

  // Local and remote tiddlers were already in sync
  return resolve([local, action]);
};


/*
 * syncTiddler synchronises the local tlddler and its corresponding remote
 * database tiddler of the same name. It resolves to the resulting tiddler,
 * and the action that was taken.
 */
var syncTiddler = function(localTiddler) {
  var title = localTiddler.fields.title;

  return fetchTiddlerFields(title)
  .then(function(remoteFields) {
    var remoteTitle = remoteFields.title;
    var remoteTiddler = newTiddler(remoteTitle, remoteFields, false);

    return syncTiddlerCompare(localTiddler, remoteTiddler);
  })
  .then(function(localTiddler, remoteTiddler, action) {
    return syncTiddlerExecute(localTiddler, remoteTiddler, action);
  })
};

/*
 * initialise resolves to a firebase.database().ref() where all tiddlers are stored
 *
 * The hierarchy is as follows:
 *
 *   /tiddlers/
 *     $kind/          'content' or 'system'
 *       $refTitle$     encodeURIComponent(title)
 */
var initialise = function() {
  updateStatus(initialisingStatus());

  return $tw.utils.firebase.initialise()
    .then(function(firebase) {
      var ref = firebase.database().ref(DATABASE_REF);

      // TODO: validate `ref`
      state.ref = ref;

      updateStatus(readyStatus());
      return Promise.resolve(ref);
    });
};

/*
** Module exports and initialisation
*/

var ref = function(path) {
  return this.app.database().ref(path);
}

exports.tiddlers = {
  allTitles: function(sync) {
    return initialise().then(fetchAllTitles());
  },

  deleteTiddler: function(title) {
    return initialise().then(deleteTiddler(title));
  },

  // returns null if the tiddler doesn't exist
  getTiddler: function(title) {
    return initialise().then(fetchTiddler(title));
  },

  // also replaces an existing tiddler
  addTiddler: function(tiddler) {
    return initialise().then(storeTiddler(tiddler));
  },

  syncTiddler: function(tiddler) {
    return initialise().then(syncTiddler(tiddler));
  }
};

/*
** Internal module functions
*/

// Fetch a tiddler's fields from the database
function fetchTiddlerFields(title) {
  var encodedTitle = encodeTitle(title);

  return new Promise(function (resolve, reject) {
    return database.ref(DATABASE_REF + encodedTitle)
      .once('value') // Read the value once
      .then(function(snapshot) {
        var fields = snapshot.val();

        resolve(fields);
      });
  });
}

// Stores the tiddler's normal fields in the database
function databaseStore(database, tiddler) {
  return new Promise(function(resolve, reject) {
    var encodedTitle = encodeTitle(tiddler.fields.title);

    // FIXME: figure out how to use set() as a Promise
    database.ref(DATABASE_DATABASE_REF + encodedTitle)
    .set(filteredTiddlerFields(tiddler));

    resolve(tiddler);
  });
}

function filteredTiddlerFields(tiddler) {
  var filtered = {};

  for (var field in tiddler.fields) {
    filtered[field] = tiddler.fields[field];
  }

  filtered['created'] = tiddler.getFieldString('created');
  filtered['modified'] = tiddler.getFieldString('modified');

  return filtered;
}

/*
 * Avoids naming limitations on Firebase and serves to create a shallow
 * hierarchy based on tiddler kind
 */
function encodeTitle(title) {
  if (title.startsWith('$:')) {
    // System tiddlers
    title = title.replace('$:', 'system');
  } else {
    // Regular tiddlers
    title = 'content/' + title;
  }
  return window.encodeURIComponent(title);
};

/*
 * Constructs a new tiddler from the given fields
 */
// TODO: rename to newWikiTiddler
function newTiddler(title, fields, actionTimestamp) {
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
// TODO: rename to addWikiTiddler
function addTiddler(title, fields, actionTimestamp) {
  var tiddler = newTiddler(title, fields, actionTimestamp);

  $tw.wiki.addTiddler(tiddler);

  return tiddler;
};

}})(this);
