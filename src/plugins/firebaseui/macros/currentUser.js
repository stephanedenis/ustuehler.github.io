/*\
title: $:/plugins/ustuehler/firebaseui/macros/currentUser.js
type: application/javascript
module-type: macro
tags: $:/tags/Macro

Expands to the currently authenticated user or empty if the user isn't authanticated

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
** Information about this macro
*/

exports.name = "currentUser";

exports.params = [];

/*
 * Run the macro
 */
exports.run = function(defaultClass) {
  if (typeof(firebase) === 'undefined') {
    $tw.utils.showSnackbar('Error in currentUser macro: firebase is undefined');
    return '';
  }

  if (firebase.auth().currentUser.email;
  return firebase.auth().currentUser.email;
};

})();
