/*\
title: $:/plugins/ustuehler/firebase/lib/ui.js
type: application/javascript
module-type: library

FirebaseUI component

\*/
(function () {
  /* global $tw */

  var firebase = require('$:/plugins/ustuehler/firebase/index.js').firebase

  /*
  const USER_NAME_FIELD = 'display-name'
  const USER_NAME_ANONYMOUS = 'anonymous'
  */

  const STATUS_USER_TIDDLER = '$:/status/OAuth/User'
  const STATUS_PROVIDER_TIDDLER = '$:/status/OAuth/Provider'

  const TEMP_ACCESS_TOKEN_TIDDLER = '$:/temp/OAuth/AccessToken'

  const CURRENT_USER_TEMPLATE = '$:/plugins/ustuehler/firebase/ui/UserViewTemplate'

  // TOOD: create a real plugin component, FirebaseUI
  var state = {
    readyEventListeners: [],
    signInSuccessListeners: [],
    firebase: null,
    authUI: null
  }

  var addReadyEventListener = function (listener) {
    state.readyEventListeners.push(listener)
  }

  var dispatchReadyEvent = function () {
    while (state.readyEventListeners.length > 0) {
      var listener = state.readyEventListeners.pop()
      listener()
    }
  }

  function addSignInSuccessListener (listener) {
    state.signInSuccessListeners.push(listener)
  }

  function dispatchSignInSuccessEvent () {
    while (state.signInSuccessListeners.length > 0) {
      var cb = state.signInSuccessListeners.pop()
      cb()
    }
    state.signInSuccessListeners = []
  }

  /*
  ** FirebaseUI configuration
  */

  // getAuthUIConfig generates a configuration hash for Firebase UI
  function getAuthUIConfig () {
    var signInFlow = getSignInFlow()
    var signInSuccessUrl = getSignInSuccessUrl()
    var tosUrl = getTermsOfServiceUrl()

    return {
      callbacks: {
        signInSuccess: function () {
          dispatchSignInSuccessEvent()
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
        firebase.auth.GithubAuthProvider.PROVIDER_ID
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

  /*
  ** Current operational status of this plugin component
  */

  var status = {
    ok: true,
    error: null,
    ready: false,
    initialising: false,
    signedIn: false
  }

  var initialisingStatus = function () {
    return {
      ok: status.ok,
      error: status.error,
      ready: status.ready,
      initialising: true,
      signedIn: status.signedIn
    }
  }

  var readyStatus = function () {
    return {
      ok: true,
      ready: true,
      initialising: false,
      error: null,
      signedIn: status.signedIn
    }
  }

  var errorStatus = function (error) {
    return {
      ok: false,
      ready: false,
      initialising: false,
      error: error,
      signedIn: status.signedIn
    }
  }

  var signedInStatus = function () {
    return {
      ok: status.ok,
      error: status.error,
      ready: status.ready,
      initialising: status.initialising,
      signedIn: true
    }
  }

  var signedOutStatus = function () {
    return {
      ok: status.ok,
      error: status.error,
      ready: status.ready,
      initialising: status.initialising,
      signedIn: false
    }
  }

  /*
   * addAuthStateChangedListener observes Auth State Changed events from Firebase
   * and reflects the changes in a set of system tiddlers.
   */
  function addAuthStateChangedListener (listener) {
    state.firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        listener({
          'display-name': user.displayName,
          'first-name': user.displayName.split(' ')[0],
          'uid': user.uid,
          'email': user.email,
          'email-verified': user.emailVerified,
          'photo-url': user.photoURL,
          'phone-number': user.phoneNumber
        }, user)
      } else {
        // User is signed out.
        listener(null)
      }
    })
  }

  // Updates the tiddler that holds information about the authenticated user
  function setCurrentUser (user, accessToken, firebaseUser) {
    $tw.wiki.deleteTiddler(STATUS_PROVIDER_TIDDLER)

    if (user) {
      // User is signed in.
      status = signedInStatus()

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
      status = signedOutStatus()

      $tw.wiki.deleteTiddler(TEMP_ACCESS_TOKEN_TIDDLER)
      $tw.wiki.deleteTiddler(STATUS_USER_TIDDLER)
    }

    $tw.wiki.setText(STATUS_USER_TIDDLER, 'text', undefined, '{{||' + CURRENT_USER_TEMPLATE + '}}')
  }

  /*
   * authStateChangedListener observes Auth State Changed events from Firebase
   * and reflects the changes in a set of system tiddlers.
   */
  function authStateChangedListener (user, firebaseUser) {
    firebaseUser.getIdToken().then(function (accessToken) {
      setCurrentUser(user, accessToken, firebaseUser)
    })
      .catch(function (error) {
        setCurrentUser(null)
        $tw.utils.error(error)
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

  // Reveal FirebaseUI and begin the sign-in flow if the user is signed out
  function startUI (selector, config) {
    var ui = getAuthUI()

    config = config || getAuthUIConfig()

    console.log('Starting the sign-in flow')
    ui.start(selector, config)
  }

  // If possible, remove FirebaseUI from the DOM or at least hide the UI
  function removeUI (selector) {
    console.log('Canceling the sign-in flow')
    // TODO: find out how to shut down FirebaseUI, or if it's needed
  }

  exports.ui = {
    status: function () { return status },
    initialise: initialise,
    addReadyEventListener: addReadyEventListener,
    addSignInSuccessListener: addSignInSuccessListener,
    startSignInFlow: function (selector, config) {
      initialise().then(function () {
        startUI(selector, config)
      })
    },
    cancelSignInFlow: function (selector) {
      initialise().then(function () {
        removeUI(selector)
      })
    }
  }

  // firebaseuiIsReady resolves as soon as firebaseui.js is loaded
  var firebaseuiIsReady = function () {
    var deadline = Date.now() + 60000 // one minute from now
    var interval = 500 // affects the polling frequency

    return new Promise(function (resolve, reject) {
      var poll = function () {
        var now = Date.now()

        if (typeof window.firebaseui !== 'undefined') {
          resolve(window.firebaseui)
        } else if (now < deadline) {
          setTimeout(poll, Math.min(deadline - now, interval))
        } else {
          reject(new Error('FirebaseUI <script> tags was not loaded in time'))
        }
      }

      // Invoke the poller function once, and then via timeout, maybe
      poll()
    })
  }

  /*
   * initialise resolves when the FirebaseUI script is loaded and the startUI
   * utility function is ready to be used
   */
  function initialise (options) {
    return new Promise(function (resolve, reject) {
      if (status.initialising) {
        addReadyEventListener(resolve)
        return
      }

      status = initialisingStatus()

      firebase.app()
        .then(firebaseuiIsReady())
        .then(function (_firebaseui) {
          // React to all auth state changes from Firebase
          addAuthStateChangedListener(authStateChangedListener)

          // This component is ready to be used by others
          status = readyStatus()

          // Notify all callers of initialise
          resolve(_firebaseui)
          dispatchReadyEvent()
        })
        .catch(function (err) {
          // Disable this component of the plugin
          status = errorStatus(err)
          reject(err)
        })
    })
  }

  /*
   * Register a global listener for auth state change events. The listener will
   * mirror any auth state changes in a set of system tiddlers.  Initialisation
   * has to complete first, as that guarantees that the symbols "firebase" and
   * "firebaseui" are defined everywhere.
   */
  if (typeof window !== 'undefined') {
    var getAuthUI = function () {
      if (!state.authUI) {
        state.authUI = new window.firebaseui.auth.AuthUI(firebase.auth())
      }
      return state.authUI
    }

    initialise().then(function () {
      console.log('FirebaseUI initialised')
    })
  }
})()
