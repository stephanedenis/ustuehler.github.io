/*\
title: $:/plugins/ustuehler/firebase/lib/firebaseui.js
type: application/javascript
module-type: library

FirebaseUI component

\*/
(function () {
  /* global $tw */

  var Component = require('$:/plugins/ustuehler/component/index.js').Component

  const STATUS_USER_TIDDLER = '$:/status/OAuth/User'
  const STATUS_PROVIDER_TIDDLER = '$:/status/OAuth/Provider'

  const TEMP_ACCESS_TOKEN_TIDDLER = '$:/temp/OAuth/AccessToken'

  const CURRENT_USER_TEMPLATE = '$:/plugins/ustuehler/firebase/ui/UserViewTemplate'

  /*
   * FirebaseUI constructs a new authentication UI. The `firebase` argument is
   * the global window.firebase object, and *not* the Firebase plugin component.
   */
  var FirebaseUI = function (firebase) {
    Component.call(this, 'FirebaseUI')

    // XXX: Sanity check because the initialisation code got complicated
    if (firebase !== window.firebase) {
      throw new Error('invalid object passed to FirebaseUI constructor: ' +
        firebase + ' (expected window.firebase)'
    }

    this.firebase = firebase
  }

  FirebaseUI.prototype = Object.create(Component.prototype)
  FirebaseUI.prototype.constructor = FirebaseUI

  // Resolves when firebaseui.js is loaded and the Firebase App is ready
  FirebaseUI.prototype.dependenciesReady = function () {
    var deadline = Date.now() + 60000 // one minute from now
    var interval = 500 // affects the polling frequency
    var self = this

    return new Promise(function (resolve, reject) {
      var poll = function () {
        var now = Date.now()

        if (typeof window.firebaseui !== 'undefined') {
          // Ensure that the Firebase App is initialised before using it
          return firebase.app()
            .then(function () {
              self.firebaseui = window.firebaseui
              self.firebase_auth = window.firebase.auth
            })
            .then(resolve)
            .catch(reject)
        } else if (now < deadline) {
          setTimeout(poll, Math.min(deadline - now, interval))
        } else {
          reject(new Error('FirebaseUI assets were not loaded in time'))
        }
      }

      // Invoke the poller function once, and then via timeout, maybe
      poll()
    })
  }

  FirebaseUI.prototype.addSignInSuccessListener = function (l) {
    this.addEventListener('signin', l)
  }

  FirebaseUI.prototype.dispatchSignInSuccessEvent = function () {
    var event = {} // TODO: report user information in event
    this.addEventListener('signin', event)
  }

  /*
   * addAuthStateChangedListener observes Auth State Changed events from Firebase
   * and reflects the changes in a set of system tiddlers.
   */
  FirebaseUI.prototype.addAuthStateChangedListener = function (l) {
    var self = this

    this.firebase_auth.onAuthStateChanged(function (user) {
      if (user) {
        var event = {
          'display-name': user.displayName,
          'first-name': user.displayName.split(' ')[0],
          'uid': user.uid,
          'email': user.email,
          'email-verified': user.emailVerified,
          'photo-url': user.photoURL,
          'phone-number': user.phoneNumber
        }

        // User is signed in.
        self.status.update(this.signedInStatus())
        l(event, user)
      } else {
        // User is signed out.
        self.status.update(this.signedOutStatus())
        l(null, null)
      }
    })
  }

  /*
  function getUserName () {
    var user = $tw.wiki.getTiddler(STATUS_USER_TIDDLER)

    if (user && user.fields[USER_NAME_FIELD]) {
      return user.fields[USER_NAME_FIELD]
    } else {
      return USER_NAME_ANONYMOUS
    }
  }
  */

  // Updates the tiddler that holds information about the authenticated user
  FirebaseUI.prototype.setCurrentUser = function (user, accessToken, firebaseUser) {
    $tw.wiki.deleteTiddler(STATUS_PROVIDER_TIDDLER)

    if (user) {
      // User is signed in.
      this.status.update(this.signedInStatus())

      for (var field in user) {
        if (user.hasOwnProperty(field)) {
          $tw.wiki.setText(STATUS_USER_TIDDLER, field, undefined, user[field])
        }
      }

      $tw.wiki.setText(TEMP_ACCESS_TOKEN_TIDDLER, 'text', undefined, accessToken)

      if (firebaseUser) {
        var providerData = firebaseUser.providerData
        var text = JSON.stringify(providerData, undefined, '  ')

        $tw.wiki.setText(STATUS_PROVIDER_TIDDLER, 'type', undefined, 'application/json')
        $tw.wiki.setText(STATUS_PROVIDER_TIDDLER, 'text', undefined, text)
      }
    } else {
      // User is signed out.
      this.status.update(this.signedOutStatus())

      $tw.wiki.deleteTiddler(TEMP_ACCESS_TOKEN_TIDDLER)
      $tw.wiki.deleteTiddler(STATUS_USER_TIDDLER)
    }

    $tw.wiki.setText(STATUS_USER_TIDDLER, 'text', undefined, '{{||' + CURRENT_USER_TEMPLATE + '}}')
  }

  /*
   * authStateChangedListener observes Auth State Changed events from Firebase
   * and reflects the changes in a set of system tiddlers
   */
  FirebaseUI.prototype.authStateChangedListener = function (user, firebaseUser) {
    firebaseUser.getIdToken()
      .then(function (accessToken) {
        this.setCurrentUser(user, accessToken, firebaseUser)
      })
      .catch(function (error) {
        this.setCurrentUser(null)
        $tw.utils.error(error)
      })
  }

  // Reveal FirebaseUI and begin the sign-in flow if the user is signed out
  FirebaseUI.prototype.startUI = function (selector, config) {
    var ui = this.getAuthUI()

    config = config || this.getAuthUIConfig()

    console.log('Starting the sign-in flow')
    ui.start(selector, config)
  }

  FirebaseUI.prototype.getAuthUI = function () {
    if (!this.authUI) {
      this.authUI = new this.firebaseui.auth.AuthUI(this.firebase_auth)
    }
    return this.authUI
  }

  // If possible, remove FirebaseUI from the DOM or at least hide the UI
  FirebaseUI.prototype.removeUI = function (selector) {
    console.log('Canceling the sign-in flow')
    // TODO: find out how to shut down FirebaseUI, or if it's needed
  }

  /*
  ** Dynamically generated configuration for FirebaseUI
  */

  // getAuthUIConfig generates a configuration hash for Firebase UI
  FirebaseUI.prototype.getAuthUIConfig = function () {
    var signInFlow = getSignInFlow()
    var signInSuccessUrl = getSignInSuccessUrl()
    var tosUrl = getTermsOfServiceUrl()

    return {
      callbacks: {
        signInSuccess: function () {
          this.dispatchSignInSuccessEvent()
          return true
        }
      },
      signInFlow: signInFlow,
      signInSuccessUrl: signInSuccessUrl,
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        this.firebase_auth.GithubAuthProvider.PROVIDER_ID
        //firebase.auth.EmailAuthProvider.PROVIDER_ID,
        //firebase.auth.PhoneAuthProvider.PROVIDER_ID
      ],
      tosUrl: tosUrl
    }
  }

  // getBaseUrl infers the wiki's base URL from the current window location
  function getBaseUrl () {
    // XXX: There is certainly a configuration parameter to set the base URL which we can read, or another function already in core that returns the base URL without looking at the window location.
    return window.location.href.replace(/\/*\?.*$/, '')
  }

  /*
   * getSignInSuccessUrl returns the URL to which the user will be redirected
   * after she signed in.
   */
  function getSignInSuccessUrl () {
    return getBaseUrl() + '#SignInSuccess'
  }

  /*
   * getTermsOfServiceUrl returns the URL for the "Terms of Service" link in
   * Firebase UI.
   */
  function getTermsOfServiceUrl () {
    return getBaseUrl() + '#TermsOfService'
  }

  /*
   * getSignInFlow is supposed to determine whether the 'popup' or 'redierct'
   * flow should be used for sign-in. The redirect flow relies on Cross-Origin
   * Resource Sharing policy, which is sometimes hard to control, so we use
   * 'popup' instead until there's a reason to support 'redirect' as well.
   */
  function getSignInFlow () {
    return 'popup'
  }

  FirebaseUI.prototype.signedInStatus = function () {
    return {
      ok: this.status.ok,
      error: this.status.error,
      ready: this.status.ready,
      initialising: this.status.initialising,
      signedIn: true
    }
  }

  FirebaseUI.prototype.signedOutStatus = function () {
    return {
      ok: this.status.ok,
      error: this.status.error,
      ready: this.status.ready,
      initialising: this.status.initialising,
      signedIn: false
    }
  }

  FirebaseUI.prototype.startSignInFlow = function (selector, config) {
    var self = this

    return this.initialise()
      .then(function () {
        self.startUI(selector, config)
      })
  }

  FirebaseUI.prototype.cancelSignInFlow = function (selector, config) {
    var self = this

    return this.initialise()
      .then(function () {
        self.removeUI(selector)
      })
  }

  exports.FirebaseUI = FirebaseUI

  /*
   * Register a global listener for auth state change events. The listener will
   * mirror any auth state changes in a set of system tiddlers.  Initialisation
   * has to complete first, as that guarantees that the symbols "firebase" and
   * "firebaseui" are defined everywhere.
   */
  /*
   * TODO: move this to initialise
  if (typeof window !== 'undefined') {
    var firebaseui = new FirebaseUI()

    exports.firebaseui = firebaseui

    firebaseui.initialise().then(function () {
      console.log('FirebaseUI initialised')
    })
  }
  */
})()
