/*\
title: $:/plugins/ustuehler/firebase/lib/component.js
type: application/javascript
module-type: library

Firebase plugin component

\*/
(function () { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Observable = require('$:/plugins/ustuehler/firebase/lib/observable.js').observable;
var Status = require('$:/plugins/ustuehler/firebase/lib/status.js').status;

var Component = function(name) {
  this.name = name; // plugin component name in CamelCase
  this.status = new Status();
};

Component.prototype = new Observable();

Component.prototype.initialise = function() {
  var status = this.status;
  var self = this;

  if (status.fields.ready) {
    // Prevent callers from initialising the component twice
    return Primise.resolve(self);
  }

  if (status.fields.initialising) {
    // Put caller on the waiting list
    return new Promise(function(resolve, reject) {
      self.addEventListener('ready', function(self) {
        resolve(self);
      });

      self.addEventListener('error', function(error) {
        reject(error);
      });
    });
  }

  status.update(status.initialisingStatus());

  self.dependenciesReady()
  .then(self.componentReady())
  .then(function() {
    status.update(status.readyStatus());
    // Notify the first caller
    resolve(self);
    // Notify other callers
    self.dispatchEvent('ready', self);
  })
  .catch(function(error) {
    // Disable this component of the plugin
    status.update(status.errorStatus(error));
    reject(error);
  });
};

// dependenciesReady should resolve when all dependencies of this component are ready
Component.prototype.dependenciesReady = function() {
  return Promise.resolve(); // This component has no dependencies
};

// componentReady should resolve when this component is ready to be used by others
Component.prototype.componentReady = function() {
  return Promise.resolve(); // This component is always ready
};

/*
** Module exports
*/

exports.component = Component;

}})();
