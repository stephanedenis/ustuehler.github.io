/*!

title: $:/plugins/ustuehler/github-pages/syncer.js
type: text/javascript
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
    this.wiki.addEventListener("change", handleChanges);
  } else {
    this.wiki.removeEventListener("change", handleChanges);
  }
};

function handleChanges(changes) {
  console.log(changes);
}

})();
