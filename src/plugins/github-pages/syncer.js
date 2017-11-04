/*\
title: $:/plugins/ustuehler/github-pages/syncer.js
type: application/javascript
module-type: utils

Story view that cooperates with the Muuri grid layout engine

\*/

!*/
(function() {
'use strict';

var syncEnabled = false;

exports.getGitHubPagesSync = function() {
  return syncEnabled;
};

exports.setGitHubPagesSync = function(enabled) {
  var self = this;

  syncEnabled = enabled;

  if (syncEnabled) {
    $tw.wiki.addEventListener("change", handleChanges);
  } else {
    $tw.wiki.removeEventListener("change", handleChanges);
  }
};

function handleChanges(changes) {
  console.log(changes);
}

})();
