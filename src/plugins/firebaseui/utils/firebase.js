/*\
title: $:/plugins/ustuehler/firebaseui/utils/firebase.js
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

// Current configuration of this plugin component
var config = {
};

// Current status of this plugin component
var status = {
  ok: true,
  ready: false
};

/*
 * allScriptsReady resolves as soon as the required Firebase components
 * referenced in the HTML <head> are loaded.  The promise applies only to
 * <script> tags, so non-Firebase CSS may not be fully loaded yet.
 */
var allScriptsReady = function() {
  var deadline = Date.now() + 60000; // one minute from now
  var interval = 500; // affects the polling frequency
  var scriptNodes = pluginScriptNodes();
  var allReady = function() {
    var r = true;
    scriptNodes.forEach(function(domNode) {
      r = r && domNode.ready;
    });
    return r;
  }

  if (scriptNodes.length == 0) {
    throw new Error('No <script> tags for Firebase in the DOM?');
  }

  return new Promise(function(resolve, reject) {
    var poller;
    // Invoke the poller function once, and then via timeout
    (poller = function() {
      var now = Date.now();
      if (allReady()) {
        resolve(scriptNodes);
      } else if (now < deadline) {
        setTimeout(poller, Math.min(deadline - now, interval));
      } else {
        reject(new Error('Firebase <script> tags could not be loaded in time'));
      }
    })();
  });
};

/*
 * initialise resolves as soon as the required Firebase components are loaded
 * and initialised
 */
var initialise = function() {
  return new Promise(function(resolve, reject) {
    allScriptsReady()
    .then(resolve)
    .catch(reject);
  });
};

/*
** Module exports and initialisation
*/

exports.firebase = {
  getStatus: function() { return status; },
  getConfig: function() { return config; },
  initialise: initialise
};

initialise().then(function() {
  console.log('Firebase initialised');
});

/*
** Private utility functions for this module
*/

// Returns the collection of <script> nodes that are related to this plugin
var pluginScriptNodes = function() {
  var domNodes = [];

  document.head
    .querySelectorAll('script')
    .forEach(function(x) {
      if (x.src.indexOf("/firebasejs/") > 0) {
        domNodes.push(x);
      }
    });

  return domNodes;
};

// ref: https://stackoverflow.com/questions/3393686/only-fire-an-event-once
var addEventListenerOnce = function(target, type, listener) {
  target.addEventListener(type, function fn(event) {
    target.removeEventListener(type, fn);
    listener(event);
  });
};

}})(this);
