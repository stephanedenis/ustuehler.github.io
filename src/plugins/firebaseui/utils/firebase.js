/*\
title: $:/plugins/ustuehler/firebaseui/utils/firebase.js
type: application/javascript
module-type: utils
caption: firebase

Provides utility functions under $tw.utils.firebase

This module is only available if the window variable is defined, because it
doesn't have any useful functionality, otherwise.

\*/
(function (global) { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

// The state of Firebase as observed and interpreted by this module
var status = {
  ready: false
};

exports.firebase = {
  // only for manual introspection
  getStatus: function() {
    return status;
  }
};

}})(this);
