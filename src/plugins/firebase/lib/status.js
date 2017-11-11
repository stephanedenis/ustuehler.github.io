/*\
title: $:/plugins/ustuehler/firebase/lib/status.js
type: application/javascript
module-type: library

Firebase plugin component status

\*/
(function () {
  /* global $tw */

  var Observable = require('$:/plugins/ustuehler/firebase/lib/observable.js').Observable
  var assign = require('$:/plugins/ustuehler/firebase/utils/firebase.js').assign

  const STATUS_TIDDLER_BASE = '$:/status/'

  var Status = function (component, fields) {
    this.initialise(component, fields)
  }

  Status.prototype = new Observable()

  Status.prototype.initialise = function (component, fields) {
    // plugin component name in CamelCase; appened to STATUS_TIDDLER_BASE
    this.component = component

    // fields to set on the status tiddler
    if (!fields) {
      fields = this.uninitialisedStatus()
    }

    // Emit an initial status change event
    this.update(fields)

    // XXX: log further status changes for debugging
    this.addEventListener('change', function (event) {
      console.log(event.component.name, 'event', event)
    })
  }

  Status.prototype.update = function (fields) {
    this.fields = fields
    this.updateTiddler()
    this.notifyChangeEventListeners()
  }

  Status.prototype.uninitialisedStatus = function () {
    return {
      ok: true,
      ready: false,
      error: null,
      initialising: false
    }
  }

  Status.prototype.initialisingStatus = function () {
    return {
      ok: this.fields.ok,
      ready: this.fields.ready,
      error: this.fields.error,
      initialising: true
    }
  }

  Status.prototype.readyStatus = function () {
    return {
      ok: true,
      ready: true,
      error: null,
      initialising: false
    }
  }

  Status.prototype.errorStatus = function (error) {
    return {
      ok: false,
      ready: false,
      initialising: false,
      error: error
    }
  }

  Status.prototype.updateTiddler = function () {
    // XXX: find out when and why $tw.wiki.setText may be undefined here and review this
    if (typeof $tw.wiki.setText === 'undefined') {
      console.log('Skipping this status tiddler update because $tw.wiki.setText is undefined')
      return
    }

    var title = STATUS_TIDDLER_BASE + this.component.name
    var tiddler = new $tw.Tiddler(title, {
      type: 'application/json',
      text: JSON.stringify(this.fields, undefined, '  ')
    }, this.fields)

    $tw.wiki.addTiddler(tiddler)
  }

  Status.prototype.notifyChangeEventListeners = function () {
    var event = {
      component: this.component,
      status: {}
    }

    assign(event.status, this.fields)

    this.dispatchEvent('change', event)
  }

  Status.prototype.addChangeEventListener = function (l) {
    this.addEventListener('change', l)
  }

  Status.prototype.removeChangeEventListener = function (l) {
    this.removeEventListener('change', l)
  }

  exports.Status = Status
})()
