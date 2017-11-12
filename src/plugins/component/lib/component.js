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

      this.name = name // plugin component name in CamelCase
      this.logger = new $tw.utils.Logger(name)
      this.status = new Status(this)
    }

    var status = this.status

    if (status.fields.ready) {
      // Prevent callers from initialising the component twice
      return Promise.resolve(self)
    }

    if (status.fields.initialising) {
      // Put caller on the waiting list
      return new Promise(function (resolve, reject) {
        // FIXME: This one-time listener is leaked on error
        self.addEventListener('ready', function (self) {
          resolve(self)
        })

        // FIXME: This one-time listener is leaked on success
        self.addEventListener('error', function (error) {
          reject(error)
        })
      })
    }

    status.update(status.initialisingStatus())

    return self.dependenciesReady()
      .then(function () {
        return self.componentReady()
      })
      .then(function () {
        status.update(status.readyStatus())

        // Notify callers that are waiting, and clear the waiting list
        self.drainListeners('ready', self)

        // Notify the first caller
        return self
      })
      .catch(function (error) {
        status.update(status.errorStatus(error))
        return Promise.reject(error)
        // Other plugin components should treat this one as disabled now
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

  exports.Component = Component
})()
