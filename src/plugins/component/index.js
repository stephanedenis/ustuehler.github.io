/*\
title: $:/plugins/ustuehler/component/index.js
type: application/javascript
module-type: library

Exports common plugin component classes

\*/
(function () {
  var Component = require('$:/plugins/ustuehler/component/lib/component.js').Component
  var SyncAdaptor = require('$:/plugins/ustuehler/component/lib/syncadaptor.js').SyncAdaptor

  exports.Component = Component
  exports.SyncAdaptor = SyncAdaptor
})()
