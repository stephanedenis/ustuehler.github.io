/*\
title: $:/plugins/ustuehler/firebase/lib/storage.js
type: application/javascript
module-type: library

Firebase Storage plugin component

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/firebase/lib/component.js').Component

  var Storage = function (storage) {
    if (arguments.length > 0) {
      this.initialise(storage)
    }
  }

  Storage.prototype = new Component()

  Storage.prototype.initialise = function (firebaseStorage) {
    if (arguments.length > 0) {
      this.storage = firebaseStorage
    }

    return this.initialiseComponent('FirebaseStorage', this)
  }

  exports.Storage = Storage
})()
