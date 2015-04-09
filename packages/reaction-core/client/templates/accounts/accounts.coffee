loginButtonsSession = Accounts._loginButtonsSession

Template.accounts.events
 "click #login-buttons-password": ->
    loginOrSignup()
    return

  "keypress #forgot-password-email": (event) ->
    forgotPassword()  if event.keyCode is 13
    return

  "click #login-buttons-forgot-password": ->
    forgotPassword()
    return

  "click #signup-link": ->
    loginButtonsSession.resetMessages()

    # store values of fields before swtiching to the signup form
    username = trimmedElementValueById("login-username")
    email = trimmedElementValueById("login-email")
    usernameOrEmail = trimmedElementValueById("login-username-or-email")

    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("login-password")
    loginButtonsSession.set "inSignupFlow", true
    loginButtonsSession.set "inForgotPasswordFlow", false

    # force the ui to update so that we have the approprate fields to fill in
    Tracker.flush()

    # update new fields with appropriate defaults
    if username isnt null
      document.getElementById("login-username").value = username
    else if email isnt null
      document.getElementById("login-email").value = email
    else if usernameOrEmail isnt null
      if usernameOrEmail.indexOf("@") is -1
        document.getElementById("login-username").value = usernameOrEmail
      else
        document.getElementById("login-email").value = usernameOrEmail
    document.getElementById("login-password").value = password  if password isnt null

    # Force redrawing the `login-dropdown-list` element because of
    # a bizarre Chrome bug in which part of the DIV is not redrawn
    # in case you had tried to unsuccessfully log in before
    # switching to the signup form.
    #
    # Found tip on how to force a redraw on
    # http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes/3485654#3485654
    redraw = document.getElementById("login-dropdown-list")
    if redraw
      redraw.style.display = "none"
      redraw.offsetHeight # it seems that this line does nothing but is necessary for the redraw to work
      redraw.style.display = "block"
      return

  "click #forgot-password-link": ->
    loginButtonsSession.resetMessages()

    # store values of fields before swtiching to the signup form
    email = trimmedElementValueById("login-email")
    usernameOrEmail = trimmedElementValueById("login-username-or-email")
    loginButtonsSession.set "inSignupFlow", false
    loginButtonsSession.set "inForgotPasswordFlow", true

    # force the ui to update so that we have the approprate fields to fill in
    Tracker.flush()

    # update new fields with appropriate defaults
    if email isnt null
      document.getElementById("forgot-password-email").value = email
    else document.getElementById("forgot-password-email").value = usernameOrEmail  if usernameOrEmail.indexOf("@") isnt -1  if usernameOrEmail isnt null
    return

  "click #back-to-guest-login-link": ->
    loginButtonsSession.resetMessages()

    email = trimmedElementValueById("login-email") or trimmedElementValueById("forgot-password-email") # Ughh. Standardize on names?

    loginButtonsSession.set 'inSignupFlow', false
    loginButtonsSession.set 'inForgotPasswordFlow', false

    # force the ui to update so that we have the approprate fields to fill in
    Tracker.flush()

    document.getElementById("login-email").value = email  if document.getElementById("login-email")
    document.getElementById("login-username-or-email").value = email or username  if document.getElementById("login-username-or-email")

  "click #back-to-login-link": ->
    loginButtonsSession.resetMessages()
    username = trimmedElementValueById("login-username")
    email = trimmedElementValueById("login-email") or trimmedElementValueById("forgot-password-email") # Ughh. Standardize on names?
    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("login-password")
    loginButtonsSession.set "inSignupFlow", false
    loginButtonsSession.set "inForgotPasswordFlow", false

    # force the ui to update so that we have the approprate fields to fill in
    Tracker.flush()
    document.getElementById("login-username").value = username  if document.getElementById("login-username")
    document.getElementById("login-email").value = email  if document.getElementById("login-email")
    document.getElementById("login-username-or-email").value = email or username  if document.getElementById("login-username-or-email")
    document.getElementById("login-password").value = password  if password isnt null
    return

  "keypress #login-username, keypress #login-email, keypress #login-username-or-email, keypress #login-password, keypress #login-password-again": (event) ->
    loginOrSignup()  if event.keyCode is 13
    return

#
# from accounts_ui.js
#
passwordSignupFields = ->
  Accounts.ui._options.passwordSignupFields or "EMAIL_ONLY"

#
# from login_buttons.js
#
validateUsername = (username) ->
  if username.length >= 3
    true
  else
    loginButtonsSession.errorMessage "Username must be at least 3 characters long"
    false

validateEmail = (email) ->
  return true  if passwordSignupFields() is "USERNAME_AND_OPTIONAL_EMAIL" and email is ""
  if email.indexOf("@") isnt -1
    true
  else
    loginButtonsSession.errorMessage "Invalid email"
    false

validatePassword = (password) ->
  if password.length >= 6
    true
  else
    loginButtonsSession.errorMessage "Password must be at least 6 characters long"
    false

#
# helpers from login_buttons_dropdown.js
#
elementValueById = (id) ->
  element = document.getElementById(id)
  unless element
    null
  else
    element.value

trimmedElementValueById = (id) ->
  element = document.getElementById(id)
  unless element
    null
  else # trim() doesn't work on IE8;
    element.value.replace /^\s*|\s*$/g, ""

loginOrSignup = ->
  if loginButtonsSession.get("inSignupFlow")
    signup()
  else
    login()
  return

login = ->
  loginButtonsSession.resetMessages()
  username = trimmedElementValueById("login-username")
  email = trimmedElementValueById("login-email")
  usernameOrEmail = trimmedElementValueById("login-username-or-email")

  # notably not trimmed. a password could (?) start or end with a space
  password = elementValueById("login-password")
  loginSelector = undefined
  if username isnt null
    unless validateUsername(username)
      return
    else
      loginSelector = username: username
  else if email isnt null
    unless validateEmail(email)
      return
    else
      loginSelector = email: email
  else if usernameOrEmail isnt null

    # XXX not sure how we should validate this. but this seems good enough (for now),
    # since an email must have at least 3 characters anyways
    unless validateUsername(usernameOrEmail)
      return
    else
      loginSelector = usernameOrEmail
  else
    throw new Error("Unexpected -- no element to use as a login user selector")
  Meteor.loginWithPassword loginSelector, password, (error, result) ->
    if error
      loginButtonsSession.errorMessage error.reason or "Unknown error"
    else
      loginButtonsSession.closeDropdown()
    return
  return

signup = ->
  loginButtonsSession.resetMessages()
  options = {} # to be passed to Accounts.createUser
  username = trimmedElementValueById("login-username")
  if username isnt null
    unless validateUsername(username)
      return
    else
      options.username = username
  email = trimmedElementValueById("login-email")
  if email isnt null
    unless validateEmail(email)
      return
    else
      options.email = email

  # notably not trimmed. a password could (?) start or end with a space
  password = elementValueById("login-password")
  unless validatePassword(password)
    return
  else
    options.password = password
  return  unless matchPasswordAgainIfPresent()
  Accounts.createUser options, (error) ->
    if error
      loginButtonsSession.errorMessage error.reason or "Unknown error"
    else
      loginButtonsSession.closeDropdown()
    return

  return

forgotPassword = ->
  loginButtonsSession.resetMessages()
  email = trimmedElementValueById("forgot-password-email")
  if email.indexOf("@") isnt -1
    Accounts.forgotPassword
      email: email
    , (error) ->
      if error
        loginButtonsSession.errorMessage error.reason or "Unknown error"
      else
        loginButtonsSession.infoMessage "Email sent"
      return

  else
    loginButtonsSession.errorMessage "Invalid email"
  return

changePassword = ->
  loginButtonsSession.resetMessages()

  # notably not trimmed. a password could (?) start or end with a space
  oldPassword = elementValueById("login-old-password")

  # notably not trimmed. a password could (?) start or end with a space
  password = elementValueById("login-password")
  return  unless validatePassword(password)
  return  unless matchPasswordAgainIfPresent()
  Accounts.changePassword oldPassword, password, (error) ->
    if error
      loginButtonsSession.errorMessage error.reason or "Unknown error"
    else
      loginButtonsSession.set "inChangePasswordFlow", false
      loginButtonsSession.set "inMessageOnlyFlow", true
      loginButtonsSession.infoMessage "Password changed"
    return

  return

matchPasswordAgainIfPresent = ->

  # notably not trimmed. a password could (?) start or end with a space
  passwordAgain = elementValueById("login-password-again")
  if passwordAgain isnt null

    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("login-password")
    if password isnt passwordAgain
      loginButtonsSession.errorMessage "Passwords don't match"
      return false
  true

correctDropdownZIndexes = ->

  # IE <= 7 has a z-index bug that means we can't just give the
  # dropdown a z-index and expect it to stack above the rest of
  # the page even if nothing else has a z-index.  The nature of
  # the bug is that all positioned elements are considered to
  # have z-index:0 (not auto) and therefore start new stacking
  # contexts, with ties broken by page order.
  #
  # The fix, then is to give z-index:1 to all ancestors
  # of the dropdown having z-index:0.
  n = document.getElementById("login-dropdown-list").parentNode

  while n.nodeName isnt "BODY"
    n.style.zIndex = 1  if n.style.zIndex is 0
    n = n.parentNode
  return

###
# use all this with the unauthorized login as well
###

Template.unauthorized.inheritsHelpersFrom "accounts"
Template.unauthorized.inheritsEventsFrom "accounts"
