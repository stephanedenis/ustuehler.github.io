/*\
title: $:/plugins/ustuehler/github-pages/syncer.js
type: application/javascript
module-type: utils

Story view that cooperates with the Muuri grid layout engine

\*/

(function() {
'use strict';

var syncEnabled = false;
var syncQueue = new Set();

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
  $tw.utils.each(changes,function(change,title) {
    changedTiddlers.push(title);
  });

  var syncFilter = $tw.wiki.getTiddlerText("$:/config/SyncFilter");
  var input = $tw.utils.stringifyList(changedTiddlers);
  var output = $tw.wiki.filterTiddlers(input + ' +' + syncFilter);

  if (output.length < 1) {
    console.log("GitHub Pages sync ignored changes in:");
    console.log(changedTiddlers);
    return;
  }

  console.log("GitHub Pages sync noticed changes in:");
  console.log(changedTiddlers);

  // Merge the new tiddlers into the existing queue
  this.syncQueue = this.syncQueue.union(new Set(output));

  // Update the temporary tiddler to let the user know
  var queue = $tw.utils.stringifyList(this.syncQueue);
  $tw.wiki.setText("$:/status/GitHubPages/SyncQueue","list",undefined,queue);

  console.log("The GitHub Pages sync queue is now: " + queue);
}

// Enable background sync by default. Runs as long as required settings are
// present.
setTimeout(function() {
  console.log('Starting background sync with GitHub Pages');
  exports.setGitHubPagesSync(true);
}, 1000);

})();
