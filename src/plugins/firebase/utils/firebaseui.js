/*\
title: $:/plugins/ustuehler/firebase/utils/firebaseui.js
type: application/javascript
module-type: utils
caption: firebaseui

Registers FirebaseuUII functions under $tw.utils.firebaseui, mainly to make
them easily accessible for debugging in the browser console

\*/
(function () {
  exports.firebaseui = function () {
    return require('$:/plugins/ustuehler/firebase/lib/firebaseui.js').firebase
  }
})()
