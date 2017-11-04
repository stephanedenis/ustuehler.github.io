/*!

title: $:/plugins/ustuehler/github-pages/syncer.js
module-type: utils

!*/
(function() {
'use strict';

var syncEnabled = false;

exports.getGithubPagesSyncEnabled = function() {
  return syncEnabled;
};

exports.setGithubPagesSyncEnabled = function(enabled) {
  var self = this;

  syncEnabled = enabled;

  if (syncEnabled) {
    // Listen out for changes to tiddlers
    this.wiki.addEventListener("change",function(changes) {
      console.log(changes);
    });
  } else {
  }
};

})();
