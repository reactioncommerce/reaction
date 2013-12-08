(->
  Accounts._loginButtons = {}  unless Accounts._loginButtons
  
  # for convenience
  loginButtonsSession = Accounts._loginButtonsSession
  Handlebars.registerHelper "loginButtons", (options) ->
    if options.hash.align is "left"
      new Handlebars.SafeString(Template._loginButtons(align: "left"))
    else
      new Handlebars.SafeString(Template._loginButtons(align: "right"))

  
  # shared between dropdown and single mode
  Template._loginButtons.events "click #login-buttons-logout": ->
    Meteor.logout ->
      loginButtonsSession.closeDropdown()


  Template._loginButtons.preserve "input[id]": Spark._labelFromIdOrName
  
  #
  # loginButtonLoggedOut template
  #
  Template._loginButtonsLoggedOut.dropdown = ->
    Accounts._loginButtons.dropdown()

  Template._loginButtonsLoggedOut.services = ->
    Accounts._loginButtons.getLoginServices()

  Template._loginButtonsLoggedOut.singleService = ->
    services = Accounts._loginButtons.getLoginServices()
    throw new Error("Shouldn't be rendering this template with more than one configured service")  if services.length isnt 1
    services[0]

  Template._loginButtonsLoggedOut.configurationLoaded = ->
    Accounts.loginServicesConfigured()

  
  #
  # loginButtonsLoggedIn template
  #
  
  # decide whether we should show a dropdown rather than a row of
  # buttons
  Template._loginButtonsLoggedIn.dropdown = ->
    Accounts._loginButtons.dropdown()

  Template._loginButtonsLoggedIn.displayName = ->
    Accounts._loginButtons.displayName()

  
  #
  # loginButtonsMessage template
  #
  Template._loginButtonsMessages.errorMessage = ->
    loginButtonsSession.get "errorMessage"

  Template._loginButtonsMessages.infoMessage = ->
    loginButtonsSession.get "infoMessage"

  
  #
  # loginButtonsLoggingInPadding template
  #
  Template._loginButtonsLoggingInPadding.dropdown = ->
    Accounts._loginButtons.dropdown()

  
  #
  # helpers
  #
  Accounts._loginButtons.displayName = ->
    user = Meteor.user()
    return ""  unless user
    return user.profile.name  if user.profile and user.profile.name
    return user.username  if user.username
    return user.emails[0].address  if user.emails and user.emails[0] and user.emails[0].address
    ""

  Accounts._loginButtons.getLoginServices = ->
    
    # First look for OAuth services.
    services = (if Package["accounts-oauth"] then Accounts.oauth.serviceNames() else [])
    
    # Be equally kind to all login services. This also preserves
    # backwards-compatibility. (But maybe order should be
    # configurable?)
    services.sort()
    
    # Add password, if it's there; it must come last.
    services.push "password"  if @hasPasswordService()
    _.map services, (name) ->
      name: name


  Accounts._loginButtons.hasPasswordService = ->
    !!Package["accounts-password"]

  Accounts._loginButtons.dropdown = ->
    @hasPasswordService() or getLoginServices().length > 1

  
  # XXX improve these. should this be in accounts-password instead?
  #
  # XXX these will become configurable, and will be validated on
  # the server as well.
  Accounts._loginButtons.validateUsername = (username) ->
    if username.length >= 3
      true
    else
      loginButtonsSession.errorMessage "Username must be at least 3 characters long"
      false

  Accounts._loginButtons.validateEmail = (email) ->
    return true  if Accounts.ui._passwordSignupFields() is "USERNAME_AND_OPTIONAL_EMAIL" and email is ""
    re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if re.test(email)
      true
    else
      loginButtonsSession.errorMessage "Invalid email"
      false

  Accounts._loginButtons.validatePassword = (password) ->
    if password.length >= 6
      true
    else
      loginButtonsSession.errorMessage "Password must be at least 6 characters long"
      false
)()
