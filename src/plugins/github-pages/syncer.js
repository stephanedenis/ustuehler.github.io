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
    var listener = function(changes) {
      console.log(changes);
    }

    this.wiki.addEventListener("change", listener);
  } else {
    this.wiki.removeEventListener("change", listener);
  }
};

})();
