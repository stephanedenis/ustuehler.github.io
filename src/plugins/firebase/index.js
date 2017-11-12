/*\
title: $:/plugins/ustuehler/firebase/index.js
type: application/javascript
module-type: library
caption: firebase

Firebase plugin component index. This module instantiates eqch component with
its dependencies when it is first requested, but it will not wait for those
component instances to become reqdy.

It is the responsibility of each component to ensure that it is properly
initialised for the method that is called.  If the method needs to wait for
other events to take place first, then the component's method should return a
promise.

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/component/index.js').Component

  var App = require('$:/plugins/ustuehler/firebase/lib/app.js').App
  var Database = require('$:/plugins/ustuehler/firebase/lib/database.js').Database
  var Storage = require('$:/plugins/ustuehler/firebase/lib/storage.js').Storage
  var FirebaseUI = require('$:/plugins/ustuehler/firebase/lib/storage.js').FirebaseUI

  var Firebase = function () {
    Component.call(this, 'Firebase')
  }

  Firebase.prototype = Object.create(Component.prototype)
  Firebase.prototype.constructor = Firebase

  // Resolves when window.firebase is available
  Firebase.prototype.dependenciesReady = function () {
    return this.getWindowProperty('firebase')
      .then(function (value) {
        // Memorize the value of window.firebase for later
        this.firebase = value
      })
  }

  Firebase.prototype.componentReady = function () {
    console.log('Firebase SDK version:', this.firebase.SDK_VERSION)
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

  exports.firebase = new Firebase()
})()
