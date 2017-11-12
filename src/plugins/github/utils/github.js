/*\
title: $:/plugins/ustuehler/github/utils/github.js
type: application/javascript
module-type: utils

Exposes the GitHub object promise as $tw.utils.github()

\*/
(function () {
  exports.github = require('$:/plugins/ustuehler/github/index.js').github
})()
