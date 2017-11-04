/*!

title: $:/plugins/ustuehler/github-pages/syncer.js
module-type: utils

!*/
(function() {
'use strict';

var syncEnabled = false;

exports.getGithubPagesSync = function() {
  return syncEnabled;
};

exports.setGithubPagesSync = function(enabled) {
  syncEnabled = enabled;
};

})();
