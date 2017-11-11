/*\
title: $:/plugins/ustuehler/firebase/lib/observable.js
type: application/javascript
module-type: library

Event dispatching and listener registration

\*/
(function () {
  var Observable = function () {
    this.listeners = {}
  }

  Observable.prototype.drainListeners = function (kind, event) {
    var listeners = this.listeners[kind]
    if (listeners) {
      while (listeners.length > 0) {
        var l = this.listeners.pop()
        l(event)
      }
    }
  }

  Observable.prototype.dispatchEvent = function (kind, event) {
    var listeners = this.listeners[kind]
    if (listeners) {
      for (var i in listeners) {
        var l = listeners[i]
        l(event)
      }
    }
  }

  Observable.prototype.addEventListener = function (kind, l) {
    var listeners = this.listeners[kind]
    if (listeners) {
      listeners.push(l)
    } else {
      this.listeners[kind] = [l]
    }
  }

  Observable.prototype.removeEventListener = function (kind, l) {
    if (this.listeners[kind]) {
      var x = this.listeners[kind].indexOf(l)

      if (x >= 0) {
        this.listeners[kind].splice(x, 1)
      }
    }
  }

  exports.Observable = Observable
})()
