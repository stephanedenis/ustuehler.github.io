/*\
title: $:/plugins/ustuehler/github-pages/syncer.js
type: application/javascript
module-type: utils

Story view that cooperates with the Muuri grid layout engine

\*/

(function() {
'use strict';

var syncEnabled = false;

exports.getGitHubPagesSync = function() {
  return syncEnabled;
};

exports.setGitHubPagesSync = function(enabled) {
  if (enabled) {
    if (!syncEnabled) {
      $tw.wiki.addEventListener("change", handleChanges);
    }
  } else {
    if (syncEnabled) {
      $tw.wiki.removeEventListener("change", handleChanges);
    }
  }
};

function handleChanges(changes) {
  var syncFilter = $tw.wiki.getTiddlerText("$:/config/SyncFilter")
  var input = $tw.utils.stringifyList(changes.keys());
  var matches = $tw.wiki.filterTiddlers(input + ' +' + syncFilter)

  console.log('GitHubPagesSync noticed some changes:');
  console.log(changes);
}

})();
