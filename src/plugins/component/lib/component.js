/*\
title: $:/plugins/ustuehler/component/lib/component.js
type: application/javascript
module-type: library

Component is a base class for plugin components that support orderly
initialisation and status reporting

\*/
(function () {
  /* global $tw */

  var Observable = require('$:/plugins/ustuehler/component/lib/observable.js').Observable
  var Status = require('$:/plugins/ustuehler/component/lib/status.js').Status

  var Component = function (name) {
    Observable.call(this)

    if (arguments.length > 0) {
      // Invoke the promise to initialise this component asynchronously
      this.initialise(name)
    }
  }

  Component.prototype = Object.create(Observable.prototype)
  Component.prototype.constructor = Component

  /*
   * initialise returns a promise to initialise this component. The promise
   * resolves to the component itself once the initialisation is complete.
   *
   * initialise is idempotent; it can be called multiple times as long as the
   * given name stays the same.  You can override the initialise method if you
   * like, as long as you make sure it stays idempotent.
   */
  Component.prototype.initialise = function (name) {
    return this.initialiseComponent(name)
  }

  Component.prototype.initialiseComponent = function (name) {
    var self = this

    if (!this.status) {
      // Component name must be set in the first call to initialiseComponent
      if (!name) {
        throw new Error('missing component name')
      }

      this.componentName = name // plugin component name in CamelCase
      this.logger = new $tw.utils.Logger(name)
      this.status = new Status(name)
    }

    var status = this.status

    if (status.fields.ready) {
      // Prevent callers from initialising the component twice
      return Promise.resolve(self)
    }

    if (status.fields.initialising) {
      // Put the caller on hold
      return new Promise(function (resolve, reject) {
        self.addEventListener('initialise', function (err) {
          if (err) {
            resolve(null)
          } else {
            reject(err)
          }
        })
      })
    }

    status.update(status.initialisingStatus())
    return self.dependenciesReady()
      .then(function () {
        return self.componentReady()
      })
      .then(function () {
        // Notify callers that are waiting, and clear the waiting list
        status.update(status.readyStatus())
        self.drainListeners('initialise', null)
        // Notify the first caller
        return null
      })
      .catch(function (error) {
        status.update(status.errorStatus(error))
        self.drainListeners('initialise', error)
        return error
      })
  }

  // dependenciesReady should resolve when all dependencies of this component are ready
  // TODO: rename
  Component.prototype.dependenciesReady = function () {
    return Promise.resolve()
  }

  // componentReady should resolve when this component is ready to be used by others
  // TODO: rename
  Component.prototype.componentReady = function () {
    return Promise.resolve()
  }

  /*
   * Resolves when the specified window property is set. This can be used to wait for
   * external scripts which would set those properties when they are loaded.
   */
  Component.prototype.getWindowProperty = function (property) {
    var deadline = Date.now() + 60000 // one minute from now
    var interval = 500 // affects the polling frequency

    return new Promise(function (resolve, reject) {
      var poll = function () {
        var now = Date.now()

        if (typeof window[property] !== 'undefined') {
          var value = window[property]

          return resolve(value)
        } else if (now < deadline) {
          setTimeout(poll, Math.min(deadline - now, interval))
        } else {
          reject(new Error('window.' + property + ' did not appear within the alotted time'))
        }
      }

      // Invoke the poller function once, and then via timeout, maybe
      poll()
    })
  }

  exports.Component = Component
})()
