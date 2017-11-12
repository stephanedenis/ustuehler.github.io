/*\
title: $:/plugins/ustuehler/firebase/modules/utils.js
type: application/javascript
module-type: utils
caption: firebase

Registers Firebase plugin functions under $tw.utils.firebase, mainly to make
them easily accessible for debugging in the browser console

\*/
(function () {
  var firebase = require('$:/plugins/ustuehler/firebase/index.js').firebase

  exports.firebase = firebase
})()
