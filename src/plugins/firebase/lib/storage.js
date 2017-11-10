/*\
title: $:/plugins/ustuehler/firebase/lib/storage.js
type: application/javascript
module-type: library

Firebase Storage plugin component

\*/
(function () { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Component = require('$:/plugins/ustuehler/firebase/lib/component.js').component;

var Storage = function() {
};

Storage.prototype = new Component(''); // empty name relates to how the status tiddler is named

Storage.prototype.initialise = function(firebase) {
  this.firebase = firebase;
  Component.prototype.initialise('FirebaseStorage');
};

Storage.prototype.componentReady = function() {
  // TODO: initialise Firebase Storage
  return Promise.resolve();
};

}})();
