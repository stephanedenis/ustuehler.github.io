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
  var changedTiddlers = [];
  for (var title in changes) {
    if (changes.hasOwnProperty(title)) {
      changedTiddlers.push(title);
    }
  }

  var syncFilter = $tw.wiki.getTiddlerText("$:/config/SyncFilter");
  var input = $tw.utils.stringifyList(changedTiddlers);
  var output = $tw.wiki.filterTiddlers(input + ' +' + syncFilter);

  var queue = $tw.wiki.getTiddlerText("$:/status/GitHub/SyncQueue");
  queue = queue + ' ' + output;
  $tw.wiki.setText("$:/status/GitHub/SyncQueue","list",undefined,queue);

  console.log("The GitHub Pages sync queue is now:");
  console.log(queue);
}

})();
