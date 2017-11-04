/*!

title: $:/plugins/ustuehler/github-pages/syncer.js
module-type: utils

!*/
(function() {
'use strict';

var syncEnabled = false;

var handleChangeEvent = function(changes) {
  console.log(changes);
}

exports.getGithubPagesSyncEnabled = function() {
  return syncEnabled;
};

exports.setGithubPagesSyncEnabled = function(enabled) {
  var self = this;

  syncEnabled = enabled;

  if (syncEnabled) {
    // Listen out for changes to tiddlers
    this.wiki.addEventListener("change", listener);
  } else {
    this.wiki.removeEventListener("change", listener);
  }
};

})();
