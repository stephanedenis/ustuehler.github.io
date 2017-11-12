/*\
title: $:/plugins/ustuehler/component/lib/utils.js
type: application/javascript
module-type: library

Internal utility functions for this plugin, and maybe useful to others

\*/
(function () {
  // This could be replaced with Object.assign, if we had it
  exports.assign = function (to, from) {
    for (var p in from) {
      if (from.hasOwnProperty(p)) {
        to[p] = from[p]
      }
    }
  }
})()
