/*\
title: $:/plugins/ustuehler/firebase/lib/component.js
type: application/javascript
module-type: library

Firebase plugin component

\*/
(function () {
  var Observable = require('$:/plugins/ustuehler/firebase/lib/observable.js').Observable
  var Status = require('$:/plugins/ustuehler/firebase/lib/status.js').Status

  var Component = function (name) {
    if (arguments.length > 0) {
      this.initialise(name)
    }
  }

  Component.prototype = new Observable()

  Component.prototype.initialise = function () {
    return Promise.resolve(this)
  }

  Component.prototype.initialiseComponent = function (name, self) {
    if (!name) {
      throw new Error('missing component name')
    }

    if (!(self instanceof Component)) {
      throw new Error('expected a Component to initialise')
    }

    // Component name must be set in the first call to initialise
    if (!this.status) {
      this.name = name // plugin component name in CamelCase
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
        self.addEventListener('ready', function (self) {
          resolve(self)
        })

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
  Component.prototype.dependenciesReady = function () {
    return Promise.resolve()
  }

  // componentReady should resolve when this component is ready to be used by others
  Component.prototype.componentReady = function () {
    return Promise.resolve()
  }

  exports.Component = Component
})()
