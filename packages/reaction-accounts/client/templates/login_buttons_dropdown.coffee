(->
  
  # for convenience
  loginButtonsSession = Accounts._loginButtonsSession
  
  # events shared between loginButtonsLoggedOutDropdown and
  # loginButtonsLoggedInDropdown
  Template._loginButtons.events
    "click input, click label, click button, click .dropdown-menu, click .alert": (event) ->
      event.stopPropagation()

    "click #login-name-link, click #login-sign-in-link": ->
      event.stopPropagation()
      loginButtonsSession.set "dropdownVisible", true
      Meteor.flush()

    "click .login-close": ->
      loginButtonsSession.closeDropdown()

  
  #
  # loginButtonsLoggedInDropdown template and related
  #
  Template._loginButtonsLoggedInDropdown.events "click #login-buttons-open-change-password": (event) ->
    event.stopPropagation()
    loginButtonsSession.resetMessages()
    loginButtonsSession.set "inChangePasswordFlow", true
    Meteor.flush()
    toggleDropdown()

  Template._loginButtonsLoggedInDropdown.displayName = ->
    Accounts._loginButtons.displayName()

  Template._loginButtonsLoggedInDropdown.inChangePasswordFlow = ->
    loginButtonsSession.get "inChangePasswordFlow"

  Template._loginButtonsLoggedInDropdown.inMessageOnlyFlow = ->
    loginButtonsSession.get "inMessageOnlyFlow"

  Template._loginButtonsLoggedInDropdown.dropdownVisible = ->
    loginButtonsSession.get "dropdownVisible"

  Template._loginButtonsLoggedInDropdownActions.allowChangingPassword = ->
    
    # it would be more correct to check whether the user has a password set,
    # but in order to do that we'd have to send more data down to the client,
    # and it'd be preferable not to send down the entire service.password document.
    #
    # instead we use the heuristic: if the user has a username or email set.
    user = Meteor.user()
    user.username or (user.emails and user.emails[0] and user.emails[0].address)

  
  #
  # loginButtonsLoggedOutDropdown template and related
  #
  Template._loginButtonsLoggedOutDropdown.events
    "click #login-buttons-password": ->
      loginOrSignup()

    "keypress #forgot-password-email": (event) ->
      forgotPassword()  if event.keyCode is 13

    "click #login-buttons-forgot-password": (event) ->
      event.stopPropagation()
      forgotPassword()

    "click #signup-link": (event) ->
      event.stopPropagation()
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
      Meteor.flush()
      
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

    "click #forgot-password-link": (event) ->
      event.stopPropagation()
      loginButtonsSession.resetMessages()
      
      # store values of fields before swtiching to the signup form
      email = trimmedElementValueById("login-email")
      usernameOrEmail = trimmedElementValueById("login-username-or-email")
      loginButtonsSession.set "inSignupFlow", false
      loginButtonsSession.set "inForgotPasswordFlow", true
      
      # force the ui to update so that we have the approprate fields to fill in
      Meteor.flush()
      
      #toggleDropdown();
      
      # update new fields with appropriate defaults
      if email isnt null
        document.getElementById("forgot-password-email").value = email
      else document.getElementById("forgot-password-email").value = usernameOrEmail  if usernameOrEmail.indexOf("@") isnt -1  if usernameOrEmail isnt null

    "click #back-to-login-link": ->
      loginButtonsSession.resetMessages()
      username = trimmedElementValueById("login-username")
      email = trimmedElementValueById("login-email") or trimmedElementValueById("forgot-password-email") # Ughh. Standardize on names?
      loginButtonsSession.set "inSignupFlow", false
      loginButtonsSession.set "inForgotPasswordFlow", false
      
      # force the ui to update so that we have the approprate fields to fill in
      Meteor.flush()
      document.getElementById("login-username").value = username  if document.getElementById("login-username")
      document.getElementById("login-email").value = email  if document.getElementById("login-email")
      
      # "login-password" is preserved thanks to the preserve-inputs package
      document.getElementById("login-username-or-email").value = email or username  if document.getElementById("login-username-or-email")

    "keypress #login-username, keypress #login-email, keypress #login-username-or-email, keypress #login-password, keypress #login-password-again": (event) ->
      loginOrSignup()  if event.keyCode is 13

  
  # additional classes that can be helpful in styling the dropdown
  Template._loginButtonsLoggedOutDropdown.additionalClasses = ->
    unless Accounts.password
      false
    else
      if loginButtonsSession.get("inSignupFlow")
        "login-form-create-account"
      else if loginButtonsSession.get("inForgotPasswordFlow")
        "login-form-forgot-password"
      else
        "login-form-sign-in"

  Template._loginButtonsLoggedOutDropdown.dropdownVisible = ->
    loginButtonsSession.get "dropdownVisible"

  Template._loginButtonsLoggedOutDropdown.hasPasswordService = ->
    Accounts._loginButtons.hasPasswordService()

  Template._loginButtonsLoggedOutDropdown.forbidClientAccountCreation = ->
    Accounts._options.forbidClientAccountCreation

  Template._loginButtonsLoggedOutAllServices.services = ->
    Accounts._loginButtons.getLoginServices()

  Template._loginButtonsLoggedOutAllServices.isPasswordService = ->
    @name is "password"

  Template._loginButtonsLoggedOutAllServices.hasOtherServices = ->
    Accounts._loginButtons.getLoginServices().length > 1

  Template._loginButtonsLoggedOutAllServices.hasPasswordService = ->
    Accounts._loginButtons.hasPasswordService()

  Template._loginButtonsLoggedOutPasswordService.fields = ->
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
    (if loginButtonsSession.get("inSignupFlow") then signupFields else loginFields)

  Template._loginButtonsLoggedOutPasswordService.inForgotPasswordFlow = ->
    loginButtonsSession.get "inForgotPasswordFlow"

  Template._loginButtonsLoggedOutPasswordService.inLoginFlow = ->
    not loginButtonsSession.get("inSignupFlow") and not loginButtonsSession.get("inForgotPasswordFlow")

  Template._loginButtonsLoggedOutPasswordService.inSignupFlow = ->
    loginButtonsSession.get "inSignupFlow"

  Template._loginButtonsLoggedOutPasswordService.showForgotPasswordLink = ->
    _.contains [
      "USERNAME_AND_EMAIL_CONFIRM"
      "USERNAME_AND_EMAIL"
      "USERNAME_AND_OPTIONAL_EMAIL"
      "EMAIL_ONLY"
    ], Accounts.ui._passwordSignupFields()

  Template._loginButtonsLoggedOutPasswordService.showCreateAccountLink = ->
    not Accounts._options.forbidClientAccountCreation

  Template._loginButtonsFormField.inputType = ->
    @inputType or "text"

  
  #
  # loginButtonsChangePassword template
  #
  Template._loginButtonsChangePassword.events
    "keypress #login-old-password, keypress #login-password, keypress #login-password-again": (event) ->
      changePassword()  if event.keyCode is 13

    "click #login-buttons-do-change-password": (event) ->
      event.stopPropagation()
      changePassword()

  Template._loginButtonsChangePassword.fields = ->
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
    if loginButtonsSession.get("inSignupFlow")
      signup()
    else
      login()

  login = ->
    loginButtonsSession.resetMessages()
    username = trimmedElementValueById("login-username")
    email = trimmedElementValueById("login-email")
    usernameOrEmail = trimmedElementValueById("login-username-or-email")
    
    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("login-password")
    loginSelector = undefined
    if username isnt null
      unless Accounts._loginButtons.validateUsername(username)
        return
      else
        loginSelector = username: username
    else if email isnt null
      unless Accounts._loginButtons.validateEmail(email)
        return
      else
        loginSelector = email: email
    else if usernameOrEmail isnt null
      
      # XXX not sure how we should validate this. but this seems good enough (for now),
      # since an email must have at least 3 characters anyways
      unless Accounts._loginButtons.validateUsername(usernameOrEmail)
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


  toggleDropdown = ->
    $("#login-dropdown-list .dropdown-menu").dropdown "toggle"

  signup = ->
    loginButtonsSession.resetMessages()
    options = {} # to be passed to Accounts.createUser
    username = trimmedElementValueById("login-username")
    if username isnt null
      unless Accounts._loginButtons.validateUsername(username)
        return
      else
        options.username = username
    email = trimmedElementValueById("login-email")
    if email isnt null
      unless Accounts._loginButtons.validateEmail(email)
        return
      else
        options.email = email
    
    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("login-password")
    unless Accounts._loginButtons.validatePassword(password)
      return
    else
      options.password = password
    return  unless matchPasswordAgainIfPresent()
    Accounts.createUser options, (error) ->
      if error
        loginButtonsSession.errorMessage error.reason or "Unknown error"
      else
        loginButtonsSession.closeDropdown()


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

    else
      loginButtonsSession.infoMessage "Email sent"

  changePassword = ->
    loginButtonsSession.resetMessages()
    
    # notably not trimmed. a password could (?) start or end with a space
    oldPassword = elementValueById("login-old-password")
    
    # notably not trimmed. a password could (?) start or end with a space
    password = elementValueById("login-password")
    return  unless Accounts._loginButtons.validatePassword(password)
    return  unless matchPasswordAgainIfPresent()
    Accounts.changePassword oldPassword, password, (error) ->
      if error
        loginButtonsSession.errorMessage error.reason or "Unknown error"
      else
        loginButtonsSession.infoMessage "Password changed"
        
        # wait 3 seconds, then expire the msg
        Meteor.setTimeout (->
          loginButtonsSession.resetMessages()
        ), 3000


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
)()
