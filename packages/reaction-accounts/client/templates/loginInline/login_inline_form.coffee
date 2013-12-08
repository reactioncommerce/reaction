(->

  # for convenience
  loginInlineSession = Accounts._loginInlineSession

  # events shared between loginInlineLoggedOutForm and
  # loginInlineLoggedInDropdown
  Template._loginInline.events
    "click input, click label, click button, click .dropdown-menu, click .alert": (event) ->
      event.stopPropagation()

    "click #login-name-link, click #login-sign-in-link": ->
      event.stopPropagation()
      loginInlineSession.set "dropdownVisible", true
      Meteor.flush()

    "click .login-close": ->
      loginInlineSession.closeDropdown()


  #
  # loginInlineLoggedInDropdown template and related
  #
  Template._loginInlineLoggedInDropdown.events "click #login-buttons-open-change-password": (event) ->
    event.stopPropagation()
    loginInlineSession.resetMessages()
    loginInlineSession.set "inChangePasswordFlow", true
    Meteor.flush()
    toggleDropdown()

  Template._loginInlineLoggedInDropdown.displayName = ->
    Accounts._loginInline.displayName()

  Template._loginInlineLoggedInDropdown.inChangePasswordFlow = ->
    loginInlineSession.get "inChangePasswordFlow"

  Template._loginInlineLoggedInDropdown.inMessageOnlyFlow = ->
    loginInlineSession.get "inMessageOnlyFlow"

  Template._loginInlineLoggedInDropdown.dropdownVisible = ->
    loginInlineSession.get "dropdownVisible"

  Template._loginInlineLoggedInDropdownActions.allowChangingPassword = ->

    # it would be more correct to check whether the user has a password set,
    # but in order to do that we'd have to send more data down to the client,
    # and it'd be preferable not to send down the entire service.password document.
    #
    # instead we use the heuristic: if the user has a username or email set.
    user = Meteor.user()
    user.username or (user.emails and user.emails[0] and user.emails[0].address)


  #
  # loginInlineLoggedOutForm template and related
  #
  Template._loginInlineLoggedOutForm.events
    "click #login-buttons-password": ->
      loginOrSignup()

    "keypress #forgot-password-email": (event) ->
      forgotPassword()  if event.keyCode is 13

    "click #login-buttons-forgot-password": (event) ->
      event.stopPropagation()
      forgotPassword()

    "click #signup-link": (event) ->
      event.stopPropagation()
      loginInlineSession.resetMessages()

      # store values of fields before swtiching to the signup form
      username = trimmedElementValueById("inline-login-username")
      email = trimmedElementValueById("inline-login-email")
      usernameOrEmail = trimmedElementValueById("inline-login-username-or-email")

      # notably not trimmed. a password could (?) start or end with a space
      password = elementValueById("inline-login-password")
      loginInlineSession.set "inSignupFlow", true
      loginInlineSession.set "inForgotPasswordFlow", false

      # force the ui to update so that we have the approprate fields to fill in
      Meteor.flush()

      # update new fields with appropriate defaults
      if username isnt null
        document.getElementById("inline-login-username").value = username
      else if email isnt null
        document.getElementById("inline-login-email").value = email
      else if usernameOrEmail isnt null
        if usernameOrEmail.indexOf("@") is -1
          document.getElementById("inline-login-username").value = usernameOrEmail
        else
          document.getElementById("inline-login-email").value = usernameOrEmail

    "click #forgot-password-link": (event) ->
      event.stopPropagation()
      loginInlineSession.resetMessages()

      # store values of fields before swtiching to the signup form
      email = trimmedElementValueById("inline-login-email")
      usernameOrEmail = trimmedElementValueById("inline-login-username-or-email")
      loginInlineSession.set "inSignupFlow", false
      loginInlineSession.set "inForgotPasswordFlow", true

      # force the ui to update so that we have the approprate fields to fill in
      Meteor.flush()

      #toggleDropdown();

      # update new fields with appropriate defaults
      if email isnt null
        document.getElementById("forgot-password-email").value = email
      else document.getElementById("forgot-password-email").value = usernameOrEmail  if usernameOrEmail.indexOf("@") isnt -1  if usernameOrEmail isnt null

    "click #back-to-login-link": ->
      loginInlineSession.resetMessages()
      username = trimmedElementValueById("inline-login-username")
      email = trimmedElementValueById("inline-login-email") or trimmedElementValueById("forgot-password-email") # Ughh. Standardize on names?
      loginInlineSession.set "inSignupFlow", false
      loginInlineSession.set "inForgotPasswordFlow", false

      # force the ui to update so that we have the approprate fields to fill in
      Meteor.flush()
      document.getElementById("inline-login-username").value = username  if document.getElementById("inline-login-username")
      document.getElementById("inline-login-email").value = email  if document.getElementById("inline-login-email")

      # "inline-login-password" is preserved thanks to the preserve-inputs package
      document.getElementById("inline-login-username-or-email").value = email or username  if document.getElementById("inline-login-username-or-email")

    "keypress #login-username, keypress #login-email, keypress #login-username-or-email, keypress #login-password, keypress #login-password-again": (event) ->
      loginOrSignup()  if event.keyCode is 13


  # additional classes that can be helpful in styling the dropdown
  Template._loginInlineLoggedOutForm.additionalClasses = ->
    unless Accounts.password
      false
    else
      if loginInlineSession.get("inSignupFlow")
        "inline-login-form-create-account"
      else if loginInlineSession.get("inForgotPasswordFlow")
        "inline-login-form-forgot-password"
      else
        "inline-login-form-sign-in"

  Template._loginInlineLoggedOutForm.dropdownVisible = ->
    loginInlineSession.get "dropdownVisible"

  Template._loginInlineLoggedOutForm.hasPasswordService = ->
    Accounts._loginInline.hasPasswordService()

  Template._loginInlineLoggedOutForm.forbidClientAccountCreation = ->
    Accounts._options.forbidClientAccountCreation

  Template._loginInlineLoggedOutAllServices.services = ->
    Accounts._loginInline.getLoginServices()

  Template._loginInlineLoggedOutAllServices.isPasswordService = ->
    @name is "password"

  Template._loginInlineLoggedOutAllServices.hasOtherServices = ->
    Accounts._loginInline.getLoginServices().length > 1

  Template._loginInlineLoggedOutAllServices.hasPasswordService = ->
    Accounts._loginInline.hasPasswordService()

  Template._loginInlineLoggedOutPasswordService.fields = ->
    loginFields = [
      {
        fieldName: "username-or-email"
        fieldLabel: "Username or Email"
        visible: ->
          _.contains [
            "USERNAME_AND_EMAIL_CONFIRM"
            "USERNAME_AND_EMAIL"
            "USERNAME_AND_OPTIONAL_EMAIL"
          ], Accounts.ui._passwordSignupFields()
      }
      {
        fieldName: "username"
        fieldLabel: "Username"
        visible: ->
          Accounts.ui._passwordSignupFields() is "USERNAME_ONLY"
      }
      {
        fieldName: "email"
        fieldLabel: "Email"
        inputType: "email"
        visible: ->
          Accounts.ui._passwordSignupFields() is "EMAIL_ONLY"
      }
      {
        fieldName: "password"
        fieldLabel: "Password"
        inputType: "password"
        visible: ->
          true
      }
    ]
    signupFields = [
      {
        fieldName: "username"
        fieldLabel: "Username"
        visible: ->
          _.contains [
            "USERNAME_AND_EMAIL_CONFIRM"
            "USERNAME_AND_EMAIL"
            "USERNAME_AND_OPTIONAL_EMAIL"
            "USERNAME_ONLY"
          ], Accounts.ui._passwordSignupFields()
      }
      {
        fieldName: "email"
        fieldLabel: "Email"
        inputType: "email"
        visible: ->
          _.contains [
            "USERNAME_AND_EMAIL_CONFIRM"
            "USERNAME_AND_EMAIL"
            "EMAIL_ONLY"
          ], Accounts.ui._passwordSignupFields()
      }
      {
        fieldName: "email"
        fieldLabel: "Email (optional)"
        inputType: "email"
        visible: ->
          Accounts.ui._passwordSignupFields() is "USERNAME_AND_OPTIONAL_EMAIL"
      }
      {
        fieldName: "password"
        fieldLabel: "Password"
        inputType: "password"
        visible: ->
          true
      }
      {
        fieldName: "password-again"
        fieldLabel: "Password (again)"
        inputType: "password"
        visible: ->

          # No need to make users double-enter their password if
          # they'll necessarily have an email set, since they can use
          # the "forgot password" flow.
          _.contains [
            "USERNAME_AND_EMAIL_CONFIRM"
            "USERNAME_AND_OPTIONAL_EMAIL"
            "USERNAME_ONLY"
          ], Accounts.ui._passwordSignupFields()
      }
    ]
    (if loginInlineSession.get("inSignupFlow") then signupFields else loginFields)

  Template._loginInlineLoggedOutPasswordService.inForgotPasswordFlow = ->
    loginInlineSession.get "inForgotPasswordFlow"

  Template._loginInlineLoggedOutPasswordService.inLoginFlow = ->
    not loginInlineSession.get("inSignupFlow") and not loginInlineSession.get("inForgotPasswordFlow")

  Template._loginInlineLoggedOutPasswordService.inSignupFlow = ->
    loginInlineSession.get "inSignupFlow"

  Template._loginInlineLoggedOutPasswordService.showForgotPasswordLink = ->
    _.contains [
      "USERNAME_AND_EMAIL_CONFIRM"
      "USERNAME_AND_EMAIL"
      "USERNAME_AND_OPTIONAL_EMAIL"
      "EMAIL_ONLY"
    ], Accounts.ui._passwordSignupFields()

  Template._loginInlineLoggedOutPasswordService.showCreateAccountLink = ->
    not Accounts._options.forbidClientAccountCreation

  Template._loginInlineFormField.inputType = ->
    @inputType or "text"


  #
  # loginInlineChangePassword template
  #
  Template._loginInlineChangePassword.events
    "keypress #login-old-password, keypress #login-password, keypress #login-password-again": (event) ->
      changePassword()  if event.keyCode is 13

    "click #login-buttons-do-change-password": (event) ->
      event.stopPropagation()
      changePassword()

  Template._loginInlineChangePassword.fields = ->
    [
      {
        fieldName: "old-password"
        fieldLabel: "Current Password"
        inputType: "password"
        visible: ->
          true
      }
      {
        fieldName: "password"
        fieldLabel: "New Password"
        inputType: "password"
        visible: ->
          true
      }
      {
        fieldName: "password-again"
        fieldLabel: "New Password (again)"
        inputType: "password"
        visible: ->

          # No need to make users double-enter their password if
          # they'll necessarily have an email set, since they can use
          # the "forgot password" flow.
          _.contains [
            "USERNAME_AND_OPTIONAL_EMAIL"
            "USERNAME_ONLY"
          ], Accounts.ui._passwordSignupFields()
      }
    ]


  #
  # helpers
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
    else # trim;
      element.value.replace /^\s*|\s*$/g, ""

  loginOrSignup = ->
    if loginInlineSession.get("inSignupFlow")
      signup()
    else
      login()

  login = ->
    loginInlineSession.resetMessages()
    username = trimmedElementValueById("inline-login-username")
    email = trimmedElementValueById("inline-login-email")
    usernameOrEmail = trimmedElementValueById("inline-login-username-or-email")

    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("inline-login-password")
    loginSelector = undefined
    if username isnt null
      unless Accounts._loginInline.validateUsername(username)
        return
      else
        loginSelector = username: username
    else if email isnt null
      unless Accounts._loginInline.validateEmail(email)
        return
      else
        loginSelector = email: email
    else if usernameOrEmail isnt null

      # XXX not sure how we should validate this. but this seems good enough (for now),
      # since an email must have at least 3 characters anyways
      unless Accounts._loginInline.validateUsername(usernameOrEmail)
        return
      else
        loginSelector = usernameOrEmail
    else
      throw new Error("Unexpected -- no element to use as a login user selector")
    Meteor.loginWithPassword loginSelector, password, (error, result) ->
      if error
        loginInlineSession.errorMessage error.reason or "Unknown error"
      else
        loginInlineSession.closeDropdown()


  toggleDropdown = ->
    $("#login-dropdown-list .dropdown-menu").dropdown "toggle"

  signup = ->
    loginInlineSession.resetMessages()
    options = {} # to be passed to Accounts.createUser
    username = trimmedElementValueById("inline-login-username")
    if username isnt null
      unless Accounts._loginInline.validateUsername(username)
        return
      else
        options.username = username
    email = trimmedElementValueById("inline-login-email")
    if email isnt null
      unless Accounts._loginInline.validateEmail(email)
        return
      else
        options.email = email

    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("inline-login-password")
    unless Accounts._loginInline.validatePassword(password)
      return
    else
      options.password = password
    return  unless matchPasswordAgainIfPresent()
    Accounts.createUser options, (error) ->
      if error
        loginInlineSession.errorMessage error.reason or "Unknown error"
      else
        loginInlineSession.closeDropdown()


  forgotPassword = ->
    loginInlineSession.resetMessages()
    email = trimmedElementValueById("forgot-password-email")
    if email.indexOf("@") isnt -1
      Accounts.forgotPassword
        email: email
      , (error) ->
        if error
          loginInlineSession.errorMessage error.reason or "Unknown error"
        else
          loginInlineSession.infoMessage "Email sent"

    else
      loginInlineSession.infoMessage "Email sent"

  changePassword = ->
    loginInlineSession.resetMessages()

    # notably not trimmed. a password could (?) start or end with a space
    oldPassword = elementValueById("inline-login-old-password")

    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("inline-login-password")
    return  unless Accounts._loginInline.validatePassword(password)
    return  unless matchPasswordAgainIfPresent()
    Accounts.changePassword oldPassword, password, (error) ->
      if error
        loginInlineSession.errorMessage error.reason or "Unknown error"
      else
        loginInlineSession.infoMessage "Password changed"

        # wait 3 seconds, then expire the msg
        Meteor.setTimeout (->
          loginInlineSession.resetMessages()
        ), 3000


  matchPasswordAgainIfPresent = ->

    # notably not trimmed. a password could (?) start or end with a space
    passwordAgain = elementValueById("inline-login-password-again")
    if passwordAgain isnt null

      # notably not trimmed. a password could (?) start or end with a space
      password = elementValueById("inline-login-password")
      if password isnt passwordAgain
        loginInlineSession.errorMessage "Passwords don't match"
        return false
    true
)()
