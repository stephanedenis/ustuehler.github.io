/*\
title: $:/plugins/ustuehler/firebase/utils/firebase.js
type: application/javascript
module-type: utils
caption: firebase

Provides utility functions under $tw.utils.firebase, handles the initialisation
of Firebase, and dispatches Firebase-related events such as auth state changes.

This module is only available if the window variable is defined, because it
doesn't serve any useful purpose, otherwise.

\*/
(function (global) { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

/*
** Constants
*/

const STATUS_TIDDLER = '$:/status/Firebase';
const STATUS_TEMPLATE = '$:/plugins/ustuehler/firebase/StatusTemplate';

/*
** Firebase application configuration
*/

/*
 * The configuration for this app can be found on the Authentication screen in
 * the Firebase Console at https://console.firebase.google.com. Use the "Web
 * Setup" button to reveal it, then copy & paste the values below.
 */
var config = {
  apiKey: "AIzaSyBi0evv3BXi4d34P85PcDxlBLnvmjZuEZI",
  authDomain: "tw5-github.firebaseapp.com",
  databaseURL: "https://tw5-github.firebaseio.com",
  projectId: "tw5-github",
  storageBucket: "tw5-github.appspot.com",
  messagingSenderId: "898278138051"
};

/*
** Current status of this plugin component
*/

var status = {
  ok: true,
  ready: false,
  error: null,
  initialising: false
};

var initialisingStatus = function() {
  return {
    ok: status.ok,
    ready: status.ready,
    initialising: true,
    error: status.error
  };
};

var readyStatus = function() {
  return {
    ok: true,
    ready: true,
    initialising: false,
    error: null
  };
};

var errorStatus = function(error) {
  return {
    ok: false,
    ready: false,
    initialising: false,
    error: error
  };
};

var updateStatusTiddler = function() {
  if (typeof $tw.wiki.setText === 'undefined') {
    console.log('Skipping this status tiddler update because $tw.wiki.setText is undefined');
    return;
  }

  var statusText = JSON.stringify(status, undefined, '  ');

  $tw.wiki.setText(STATUS_TIDDLER, 'type', undefined, 'application/json');
  $tw.wiki.setText(STATUS_TIDDLER, 'text', undefined, statusText);

  // Duplicate status in fiends for convenience
  for (var field in status) {
    if (status.hasOwnProperty(field)) {
      $tw.wiki.setText(STATUS_TIDDLER, field, undefined, status[field]);
    }
  }
};

var updateStatus = function(newStatus) {
  status = newStatus;
  updateStatusTiddler();
};

/*
** Module functions
*/

// Resolves when all required Firebase components are loaded
var requireFirebase = function() {
  // TODO
};

// ref: https://stackoverflow.com/questions/3393686/only-fire-an-event-once
var addEventListenerOnce = function(target, type, listener) {
  target.addEventListener(type, function fn(event) {
    target.removeEventListener(type, fn);
    listener(event);
  });
};

// firebaseIsReady resolves as soon as the firebase-app.js script is loaded
var firebaseIsReady = function() {
  var deadline = Date.now() + 60000; // one minute from now
  var interval = 500; // affects the polling frequency
  var allReady = function() {
    return typeof window.firebase !== 'undefined';
  }

  return new Promise(function(resolve, reject) {
    var poll = function() {
      var now = Date.now();
      if (allReady()) {
        resolve();
      } else if (now < deadline) {
        setTimeout(poll, Math.min(deadline - now, interval));
      } else {
        reject(new Error('Firebase <script> tags was not loaded in time'));
      }
    };

    // Invoke the poller function once, and then via timeout, maybe
    poll();
  });
};

var readyEventListeners = [];

var addReadyEventListener = function(listener) {
  readyEventListeners.push(listener);
};

var dispatchReadyEvent = function() {
  while (readyEventListeners.length > 0) {
    var listener = readyEventListeners.pop();
    listener();
  }
};

/*
 * initialise resolves as soon as the required Firebase components are loaded
 * and initialised
 */
var initialise = function() {
  return new Promise(function(resolve, reject) {
    if (status.ready) {
      // Prevent caller from initialising Firebase again
      resolve(firebase);
      return;
    }

    if (status.initialising) {
      // Put caller on the waiting list
      addReadyEventListener(function() {
        resolve(firebase);
      });
      return;
    }

    updateStatus(initialisingStatus());
    firebaseIsReady()
    .then(function() {
      // Initialise Firebase
      firebase.initializeApp(config); // XXX: only once?
      updateStatus(readyStatus());
      resolve(firebase);
      // Notify other callers of initialise
      dispatchReadyEvent();
    })
    .catch(function(err) {
      // Disable this component of the plugin
      updateStatus(errorStatus(err));
      reject(err);
    });
  });
};

/*
** Module exports and initialisation
*/

exports.firebase = {
  initialise: initialise,

  // for debugging
  updateStatus: function() { updateStatus(status); },
  status: function() { return status; }
};

}})(this);
