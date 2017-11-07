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

// Current status of the Firebase subsystem in this plugin
var status = {
  ok: true,
  ready: false
};

/*
 * Resolves as soon as all the scripts in the HTML head are ready. This is
 * necessary because this plugin adds <script> tags to the page template.
 *
 * Note that we ignore <link> tags here, so CSS may not be fully loaded yet.
 */
function allScriptsReady() {
}

exports.firebase = {
  getStatus: function() { return status; },
  initialise: function() {
    return new Promise(function(resolve, reject) {
      // FIXME: detect when firebase resources have finished loading
      resolve();
    });
  }
};

}})(this);
