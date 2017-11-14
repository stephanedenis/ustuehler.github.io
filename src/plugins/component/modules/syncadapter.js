/*\
title: $:/plugins/ustuehler/component/syncadaptor.js
type: application/javascript
module-type: library

A promisified sync adaptor module base class

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/component/component.js').Component

  function SyncAdaptor (componentName, adaptorName, options) {
    Component.call(this, componentName)

    this.name = adaptorName
    this.wiki = options.wiki
    this.hasStatus = false
  }

  SyncAdaptor.prototype = Object.create(Component.prototype)
  SyncAdaptor.prototype.constructor = SyncAdaptor

  SyncAdaptor.prototype.isReady = function () {
    return this.hasStatus
  }

  // Returns additional information needed by this adaptor
  SyncAdaptor.prototype.getTiddlerInfo = function (tiddler) {
    return this.getTiddlerInfoFromStore(tiddler)
  }

  /*
   * Get the current status of the sync connection
   */
  SyncAdaptor.prototype.getStatus = function (callback) {
    this.getLoggedInUser()
      .then(function (response) {
        this.hasStatus = true
        return response
      })
      .then(function (value) {
        var isLoggedIn = value[0]
        var username = value[1]

        if (callback) { callback(null, isLoggedIn, username) }
      })
      .catch(function (err) {
        if (callback) { callback(err) }
      })
  }

  /*
   * Attempt to login and invoke the callback(err)
   */
  SyncAdaptor.prototype.login = function (username, password, callback) {
    this.loginToStore(username, password)
      .then(function () {
        callback(null)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Forget cached login credentials and everything
   */
  SyncAdaptor.prototype.logout = function (callback) {
    this.logoutOfStore()
      .then(function () {
        callback(null)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Get an array of skinny tiddler fields from the server
   */
  SyncAdaptor.prototype.getSkinnyTiddlers = function (callback) {
    this.getSkinnyTiddlersFromStore()
      .then(function (tiddlers) {
        callback(null, tiddlers)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Save a tiddler and invoke the callback with (err,adaptorInfo,revision)
   */
  SyncAdaptor.prototype.saveTiddler = function (tiddler, callback) {
    this.saveTiddlerInStore(tiddler)
      .then(function (value) {
        var adaptorInfo = value[0]
        var revision = value[1]

        callback(null, adaptorInfo, revision)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Load a tiddler and invoke the callback with (err,tiddlerFields)
   */
  SyncAdaptor.prototype.loadTiddler = function (title, callback) {
    this.loadTiddlerFromStore(title)
      .then(function (tiddler) {
        callback(null, tiddler)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Delete a tiddler and invoke the callback with (err)
   * options include:
   * tiddlerInfo: the syncer's tiddlerInfo for this tiddler
   */
  SyncAdaptor.prototype.deleteTiddler = function (title, callback, options) {
    var adaptorInfo = options.tiddlerInfo.adaptorInfo

    // If we have an empty adaptorInfo it means that the tiddler hasn't been seen by the server, so we don't need to delete it
    if (adaptorInfo.length === 0) {
      return callback(null)
    }

    // Issue request to delete the tiddler
    this.deleteTiddlerFromStore(adaptorInfo)
      .then(function () {
        callback(null)
      })
      .catch(function (err) {
        callback(err)
      })
  }

  exports.SyncAdaptor = SyncAdaptor
})()
