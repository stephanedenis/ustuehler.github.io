/*\
title: $:/plugins/ustuehler/firebase/index.js
type: application/javascript
module-type: library
caption: firebase

Firebase plugin component index

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/component/index.js').Component
  var App = require('$:/plugins/ustuehler/firebase/lib/app.js').App
  var Database = require('$:/plugins/ustuehler/firebase/lib/database.js').Database
  var Storage = require('$:/plugins/ustuehler/firebase/lib/storage.js').Storage

  var Firebase = function () {
    Component.call(this, 'Firebase')
  }

  Firebase.prototype = Object.create(Component.prototype)
  Firebase.prototype.constructor = Firebase

  Firebase.prototype.dependenciesReady = function () {
    return this.getWindowProperty('firebase')
      .then(function (value) {
        this.firebase = value
      })
  }

  Firebase.prototype.componentReady = function () {
    console.log('Firebase SDK version:', this.firebase.SDK_VERSION)
    this.app = new App(this.firebase)
    return Promise.resolve()
  }

  Firebase.prototype.initialiseApp = function () {
    return Promise.resolve(this.app)
  }

  Firebase.prototype.initialiseAuth = function () {
    return this.initialiseApp()
      .then(function () {
        return this.firebase.auth()
      })
  }

  Firebase.prototype.initialiseDatabase = function () {
    this.database = this.database || new Database(this.firebase.database())
    return this.database.initialise()
  }

  Firebase.prototype.initialiseStorage = function () {
    this.storage = this.storage || new Storage(this.firebase.storage())
    return this.storage.initialise()
  }

  var getFirebase = (function () {
    var firebase

    return function () {
      if (firebase) {
        return Promise.resolve(firebase)
      }

      firebase = new Firebase()
      return firebase.initialise()
    }
  }())

  var getFirebaseUI = (function () {
    var FirebaseUI = require('$:/plugins/ustuehler/firebase/lib/firebaseui.js').FirebaseUI
    var firebaseui

    return function () {
      if (firebaseui) {
        return Promise.resolve(firebaseui)
      }

      return getFirebase()
        .then(function (firebase) {
          firebaseui = new FirebaseUI(firebase.firebase)
          return firebaseui.initialise()
        })
        .then(function (firebaseui) {
          return firebaseui
        })
    }
  }())

  exports.firebase = {
    ui: getFirebaseUI,
    app: function () {
      return getFirebase()
        .then(function (firebase) { return firebase.initialiseApp() })
    },
    auth: function () {
      return getFirebase()
        .then(function (firebase) { return firebase.initialiseAuth() })
    },
    database: function () {
      return getFirebase()
        .then(function (firebase) { return firebase.initialiseDatabase() })
    },
    storage: function () {
      return getFirebase()
        .then(function (firebase) { return firebase.initialiseStorage() })
    }
  }
})()
