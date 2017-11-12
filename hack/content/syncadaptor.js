/*\
title: $:/plugins/example/<<store>>/<<store>>adaptor.js
type: application/javascript
module-type: syncadaptor--disabled

A sync adaptor module for synchronising with <<store>>

\*/
(function(){
  function <<Store>>Adaptor(options) {
    this.wiki = options.wiki;
    this.recipe = undefined;
    this.hasStatus = false;
    this.logger = new $tw.utils.Logger("<<Store>>Adaptor")
  }

  <<Store>>Adaptor.prototype.name = "<<store>>"

  <<Store>>Adaptor.prototype.isReady = function() {
    return this.hasStatus
  }

  <<Store>>Adaptor.prototype.getTiddlerInfo = function(tiddler) {
    // TODO: Return additional information needed by this adaptor
    return {
      ref: tiddler.fields.ref // for example
    }
  }

  /*
   * Get the current status of the TiddlyWeb connection
   */
  <<Store>>Adaptor.prototype.getStatus = function(callback) {
    // Get login status asynchronously
    Promise.resolve()
    .then(function (err) {
      var isLoggedIn, username

      if (!err) {
        this.hasStatus = true

        // isLoggedIn = ...
        // username = ...
      }

      // Invoke the callback if present
      if (callback) {
        callback(err,isLoggedIn,username);
      }
    })
  }

  /*
   * Attempt to login and invoke the callback(err)
   */
  <<Store>>Adaptor.prototype.login = function(username,password,callback) {
    // ...do something with username and password...
    callback(err)
  }

  /*
   * Forget cached login credentials and everything
   */
  <<Store>>Adaptor.prototype.logout = function(callback) {
    // ...do something...
    callback(err)
  }

  /*
   * Get an array of skinny tiddler fields from the server
   */
  <<Store>>Adaptor.prototype.getSkinnyTiddlers = function(callback) {
    this.getSkinnyTiddlersFrom<<Store>>()
      .then(function (tiddlers) {
        // Invoke the callback with the skinny tiddlers
        callback(null,tiddlers);
      })
      .catch(function (err) {
        // Handle the error
        callback(err)
      })
  }

  /*
   * Save a tiddler and invoke the callback with (err,adaptorInfo,revision)
   */
  <<Store>>Adaptor.prototype.saveTiddler = function(tiddler,callback) {
    this.saveTiddlerTo<<Store>>(tiddler)
      .then(function (value) {
				var adaptorInfo = value[0]
				var revision = value[1]

        callback(null, adaptorInfo, revision);
      })
      .catch(function (err) {
        callback(err)
      })
  }

  /*
   * Load a tiddler and invoke the callback with (err,tiddlerFields)
   */
  <<Store>>Adaptor.prototype.loadTiddler = function(title,callback) {
    this.loadTiddlerFrom<<Store>>(title)
      .then(function (tiddler) {
        callback(null, tiddler);
      })
      .catch(function (err) {
        callback(err)
      })
};

  /*
   * Delete a tiddler and invoke the callback with (err)
   * options include:
   * tiddlerInfo: the syncer's tiddlerInfo for this tiddler
   */
  <<Store>>Adaptor.prototype.deleteTiddler = function(title,callback,options) {
    var adaptorInfo = options.tiddlerInfo.adaptorInfo

    // If we don't have a ref it means that the tiddler hasn't been seen by the server, so we don't need to delete it
    if (!adaptorInfo.ref) {
      return callback(null)
    }

    // Issue request to delete the tiddler
    this.deleteTiddlerFrom<<Store>>(adaptorInfo)
      .then(function () {
        callback(null)
      .catch(function (err) {
        callback(err)
      })
  }
})();
