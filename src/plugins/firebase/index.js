/*\
title: $:/plugins/ustuehler/firebase/index.js
type: application/javascript
module-type: utils
caption: firebase

Provides utility functions under $tw.utils.firebase

\*/
(function (global) { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Component = require('$:/plugins/ustuehler/firebase/lib/component.js').component;

var app = require('$:/plugins/ustuehler/firebase/lib/app.js').app,
    database = require('$:/plugins/ustuehler/firebase/lib/database.js').database,
    storage = require('$:/plugins/ustuehler/firebase/lib/storage.js').storage;

var index = new Component('Firebase');

index.dependenciesReady = function() {
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
        reject(new Error('Firebase <script> tags were not loaded in time'));
      }
    };

    // Invoke the poller function once, and then via timeout, maybe
    poll();
  });
};

// Resolves to the global `firebase` object from the dependencies
index.componentReady = function() {
  return new Promise(function(resolve, reject) {
    resolve(window.firebase);
  });
};

var initialise = function() {
  return index.initialise().then(function(firebase) {
    return app.initialise(firebase);
  });
};

exports.firebase = {
  initialise: initialise,
  app: app,
  database: database,
  storage: storage
};

}})(this);
