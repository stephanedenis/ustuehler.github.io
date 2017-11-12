/*\
title: $:/plugins/ustuehler/firebase/utils/firebase.js
type: application/javascript
module-type: utils
caption: firebase

Registers Firebase plugin functions under $tw.utils.firebase, mainly to make
them easily accessible for debugging in the browser console

\*/
(function () {
  var index = require('$:/plugins/ustuehler/firebase/index.js')

  exports.assign = function (to, from) {
    for (var p in from) {
      if (from.hasOwnProperty(p)) {
        to[p] = from[p]
      }
    }
  }

  exports.firebase = function () {
    return index.firebase
  }
})()
