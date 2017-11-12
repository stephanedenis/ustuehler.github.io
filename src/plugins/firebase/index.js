/*\
title: $:/plugins/ustuehler/firebase/index.js
type: application/javascript
module-type: library
caption: firebase

Firebase plugin component index

\*/
(function () {
  var App = require('$:/plugins/ustuehler/firebase/lib/app.js').App
  var UI = require('$:/plugins/ustuehler/firebase/lib/ui.js').UI
  var Database = require('$:/plugins/ustuehler/firebase/lib/database.js').Database
  var Storage = require('$:/plugins/ustuehler/firebase/lib/storage.js').Storage
  var Component = require('$:/plugins/ustuehler/firebase/lib/component.js').Component

  var Firebase = function () {
  }

  Firebase.prototype = new Component()

  Firebase.prototype.initialise = function () {
    return this.initialiseComponent('Firebase', this)
  }

  Firebase.prototype.dependenciesReady = function () {
    var deadline = Date.now() + 60000 // one minute from now
    var interval = 500 // affects the polling frequency

    if (typeof window === 'undefined') {
      return Promise.reject(new Error('window context is required for firebase '))
    }

    return new Promise(function (resolve, reject) {
      var poll = function () {
        var now = Date.now()

        if (typeof window.firebase !== 'undefined') {
          resolve()
        } else if (now < deadline) {
          setTimeout(poll, Math.min(deadline - now, interval))
        } else {
          reject(new Error('Firebase <script> tags were not loaded in time'))
        }
      }

      // Invoke the poller function once, and then via timeout, maybe
      poll()
    })
  }

  Firebase.prototype.componentReady = function () {
    console.log('Firebase SDK version:', window.firebase.SDK_VERSION)
    this.firebase = window.firebase
    this.app = new App(this.firebase)
    return Promise.resolve()
  }

  Firebase.prototype.initialiseApp = function () {
    return Promise.resolve(this.app)
  }

  Firebase.prototype.initialiseDatabase = function () {
    this.database = this.database || new Database(this.firebase.database())
    return this.database.initialise()
  }

  Firebase.prototype.initialiseStorage = function () {
    this.storage = this.storage || new Storage(this.firebase.storage())
    return this.storage.initialise()
  }

  Firebase.prototype.initialiseUI = function () {
    this.ui = this.ui || new UI(this.firebase) // TODO: check if this is the correct argument
    return this.database.initialise()
  }

  var initialise = (function () {
    var firebase

    return function () {
      if (firebase) {
        return Promise.resolve(firebase)
      }

      firebase = new Firebase()
      return firebase.initialise()
    }
  }())

  exports.firebase = {
    app: function () {
      return initialise()
        .then(function (firebase) { return firebase.initialiseApp() })
    },
    database: function () {
      return initialise()
        .then(function (firebase) { return firebase.initialiseDatabase() })
    },
    storage: function () {
      return initialise()
        .then(function (firebase) { return firebase.initialiseStorage() })
    },
    ui: function () {
      return initialise()
        .then(function (firebase) { return firebase.initialiseUI() })
    }
  }
})()
