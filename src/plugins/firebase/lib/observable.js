/*\
title: $:/plugins/ustuehler/firebase/lib/observable.js
type: application/javascript
module-type: library

Event dispatching and listener registration

\*/
(function () { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

var Observable = function() {
  this.listeners = {};
};

Observable.prototype.dispatchEvent = function(kind, event) {
  if (this.listeners[kind]) {
    for (var l in this.listeners[kind]) {
      l(event);
    }
  }
};

Observable.prototype.addEventListener = function(kind, l) {
  if (this.listeners[kind]) {
    this.listeners.push(l);
  } else {
    this.listeners[kind] = [l];
  }
};

Observable.prototype.removeEventListener = function(kind, l) {
  if (this.listeners[kind]) {
    var x = this.listeners[kind].indexOf(l);

    if (x >= 0) {
      this.listeners[kind].splice(x, 1);
    }
  }
};

/*
** Module exports
*/

exports.observable = Observable;

}})();
