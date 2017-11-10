/*\
title: $:/plugins/ustuehler/firebase/lib/status.js
type: application/javascript
module-type: library

Firebase plugin component status

\*/
(function () { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Observable = require('$:/plugins/ustuehler/firebase/lib/observable.js').observable;

const STATUS_TIDDLER_BASE = '$:/status/Firebase';

var Status = function(component, fields) {
  // plugin component name in CamelCase; appened to STATUS_TIDDLER_BASE
  this.component = component;

  // fields to set on the status tiddler
  if (fields) {
    this.update(fields);
  } else {
    this.update(this.uninitialisedStatus());
  }
};

Status.prototype = new Observable();

Status.prototype.update = function(fields) {
  this.fields = fields;
  this.updateTiddler();
  this.notifyChangeEventListeners();
};

Status.prototype.uninitialisedStatus = function() {
  return {
    ok: true,
    ready: false,
    error: null,
    initialising: false
  };
};

Status.prototype.initialisingStatus = function() {
  return {
    ok: status.ok,
    ready: status.ready,
    error: status.error,
    initialising: true
  };
};

Status.prototype.readyStatus = function() {
  return {
    ok: true,
    ready: true,
    error: null,
    initialising: false
  };
};

Status.prototype.errorStatus = function(error) {
  return {
    ok: false,
    ready: false,
    initialising: false,
    error: error
  };
};

Status.prototype.updateTiddler = function() {
  // XXX: find out when and why $tw.wiki.setText may be undefined here and review this
  if (typeof $tw.wiki.setText === 'undefined') {
    console.log('Skipping this status tiddler update because $tw.wiki.setText is undefined');
    return;
  }

  var tiddler = $tw.Tiddler({
    type: 'application/json',
    text: JSON.stringify(status, undefined, '  ')
  }, this.fields, {
    title: STATUS_TIDDLER_BASE + this.component
  });

  $tw.wiki.addTiddler(tiddler);
};

Status.prototype.notifyChangeEventListeners = function() {
  var event = {
    component: this.component,
    status: {}
  };
  assign(event.status, this.fields);
  this.dispatchEvent('change', event);
};

Status.prototype.addChangeEventListener = function(l) {
  this.addEventListener('change', l);
};

Status.prototype.removeChangeEventListener = function(l) {
  this.removeEventListener('change', l);
};

/*
** Module exports
*/

exports.status = Status;

/*
** Module utility functions
*/

function assign(to, from) {
  for (var p in from) {
    if (from.hasOwnProperty(p)) {
      to[p] = from[p];
    }
  }
}

}})();
