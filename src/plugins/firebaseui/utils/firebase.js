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

// Current configuration of the Firebase component in this plugin
var config = {
};

// Current status of the Firebase component in this plugin
var status = {
  ok: true,
  ready: false
};

/*
 * allScriptsReady is a promise which resolves as soon as all the scripts in
 * the HTML head are ready.  It's made necessary because this plugin adds new
 * <script> tags to the HTML page <head> element.  This promise only looks for
 * <script> tags, so CSS may not be fully loaded yet.
 */
function allScriptsReady() {
}

exports.firebase = {
  getStatus: function() { return status; },
  getConfig: function() { return config; },
  initialise: function() {
    return new Promise(function(resolve, reject) {
      allScriptsReady()
      .then(resolve)
      .catch(reject);
    });
  }
};

}})(this);
