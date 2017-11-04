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
  syncEnabled = enabled;

  if (syncEnabled) {
    var self = this;

      // Listen out for changes to tiddlers
      this.wiki.addEventListener("change",function(changes) {
        self.syncToServer(changes);
      });
  } else {
  }
};

})();
