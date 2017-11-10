/*\
title: $:/plugins/ustuehler/firebase/utils/firebase.js
type: application/javascript
module-type: utils
caption: firebase

Registers Firebase plugin functions under $tw.utils.firebase, mainly to make
them easily accessible for debugging in the browser console

\*/
(function () { if (typeof window !== 'undefined') {

"use strict";
/*jslint node: true, browser: true */
/*global $tw: false */

exports.firebase = require('$:/plugins/ustuehler/firebase/index.js');

}})();
