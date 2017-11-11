/*\
title: $:/plugins/ustuehler/firebase/lib/app.js
type: application/javascript
module-type: library

Firebase App component

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/firebase/lib/component.js').Component
  var config = require('$:/plugins/ustuehler/firebase/lib/config.js').config

  var App = function (firebase) {
    if (arguments.length > 0) {
      this.firebase = firebase
      this.initialiseComponent('FirebaseApp', this)
    }
  }

  App.prototype = new Component()

  /*
   * componentReady resolves when the Firebase app is initialised. This must
   * be completed before any other component can use Firebase.
   */
  App.prototype.componentReady = function () {
    this.firebase.initializeApp(config)
    return Promise.resolve()
  }

  /*
   * Return the application's Firebase Database implementation object
   */
  App.prototype.database = function () {
    return this.firebase.app().database()
  }

  /*
   * Return the application's Firebase Storage implementation object
   */
  App.prototype.storage = function () {
    return this.firebase.app().storage()
  }

  exports.App = App
})()
