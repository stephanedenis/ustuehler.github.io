/*\
title: $:/plugins/ustuehler/firebase/lib/app.js
type: application/javascript
module-type: library

Firebase App plugin component

\*/
(function () {
  if (typeof window !== 'undefined') {
    'use strict'
/* jslint node: true, browser: true */
/* global $tw: false */

    var Component = require('$:/plugins/ustuehler/firebase/lib/component.js').component,
      config = require('$:/plugins/ustuehler/firebase/lib/config.js')

    var App = function () {
    }

    App.prototype = new Component('') // empty name relates to how the status tiddler is named

    App.prototype.initialise = function (firebase) {
      this.firebase = firebase
      Component.prototype.initialise('FirebaseApp')
    }

/*
 * componentReady resolves when the Firebase app is initialised. This must be
 * completed before any other component can use Firebase.
 */
    App.prototype.componentReady = function () {
      this.firebase.initializeApp(config)
      return Promise.resolve()
    }
  }
})()
