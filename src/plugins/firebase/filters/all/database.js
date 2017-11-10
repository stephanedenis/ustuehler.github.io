/*\
title: $:/plugins/ustuehler/firebase/filters/all/database.js
type: application/javascript
module-type: allfilteroperator
caption: database

Filter operator returning all tiddler titles in the Firebase Database

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

const DATABASE_REF = '/tiddlers/';

var state = {
  titles: []
};

// fetchAllTitles resolves to all tiddler titles in the database, including of deleted tiddlers
function fetchAllTitles() {
  var database = require('$:/plugins/ustuehler/firebase/lib/database.js');

	return database.ref(DATABASE_REF)
    .then(function(ref) {
      return getPages(ref)
        .then(function(pages) {
          var titles = [];

          $tw.utils.each(pages, function(page) {
            $tw.utils.each(page, function(item) {
              titles.push(item.title);
            });
          });

          return Promise.resolve(titles);
        });
    });
}

/*
Export our filter function
*/
exports.database = function(source,operator,options) {
  // Return the cached titles as output; ignore input, suffix and param
  return state.titles;
};

// In a browser window, fill the titles cache at the earliest possible time
if (typeof window !== 'undefined') {
  fetchAllTitles()
  .then(function(titles) {
    console.log('Titles fetched from Firebase Database:', titles);
    state.titles = titles;
  });
}

/*
** Module utility functions
*/

var pageLength = 1000;

// ref: https://howtofirebase.com/collection-queries-with-firebase-b95a0193745d
function getPages(ref, accumulator, cursor) {
  var pages = accumulator || [];
  var query = ref.orderByKey().limitToFirst(pageLength + 1); // limitToFirst starts from the top of the sorted list

  if (cursor) { // If no cursor, start at beginning of collection... otherwise, start at the cursor
    query = query.startAt(cursor);  // Don't forget to overwrite the query variable!
  }

  return query.once('value')
    .then(function (snaps) {
      var page = [];
      var extraRecord;

      snaps.forEach(function (childSnap) {
        console.log(childSnap);
        page.push({
          id: childSnap.key,
          title: childSnap.val().title
        });
      });
      
      if (page.length > pageLength) {
        extraRecord = page.pop();
        pages.push(page);
        console.log(pages, extraRecord.id);
        return getPages(ref, pages, extraRecord.id);
      } else {
        pages.push(page);
        return Promise.resolve(pages);
      }
    });
};

})();
