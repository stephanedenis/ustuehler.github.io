/*\
title: $:/plugins/ustuehler/firebase/lib/database.js
type: application/javascript
module-type: library

Provides a tiddler data store interface to a Firebase database

\*/
(function (global) {
  if (typeof window !== 'undefined') {
    'use strict'
    /* jslint node: true, browser: true */
    /* global $tw: false */

    var app = require('$:/plugins/ustuehler/firebase/lib/app.js').component
    var Component = require('$:/plugins/ustuehler/firebase/lib/component.js').component

    var Database = function (app) {
      if (arguments.length > 0) {
        this.initialise(app)
      }
    }

    Database.prototype.initialise = function (app) {
      this.database = app.database()

      Component.prototype.initialise('FirebaseDatabase')
    }

    Database.prototype.ref = function (path) {
      return this.database.ref(path)
    }

    Database.prototype.fetch = function (path) {
      return this.ref(path).once('value').then(function (snapshot) {
        return snapshot.val()
      })
    }

    Database.prototype.store = function (path, value) {
      return this.ref(path).set(value)
    }

    exports.database = Database
    exports.component = new Database()

    exports.initialise = function (path) {
      var self

      return app.initialise()
        .then(function (app) {
          self.initialise(app)
        })
        .then(function (database) {
          return database.ref(path)
        })
    }

    exports.fetch = function (path) {
      return component.initialise().then(function (database) {
        return database.fetch(path)
      })
    }

    exports.store = function (path, value) {
      return component.initialise().then(function (database) {
        return database.store(path, value)
      })
    }
  }
})(this)
