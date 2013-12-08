(->
  Accounts._loginInline = {}  unless Accounts._loginInline

  # for convenience
  loginInlineSession = Accounts._loginInlineSession
  Handlebars.registerHelper "loginInline", (options) ->
    if options.hash.align is "left"
      new Handlebars.SafeString(Template._loginInline(align: "left"))
    else
      new Handlebars.SafeString(Template._loginInline(align: "right"))


  # shared between dropdown and single mode
  Template._loginInline.events "click #login-buttons-logout": ->
    Meteor.logout ->
      loginInlineSession.closeDropdown()


  Template._loginInline.preserve "input[id]": Spark._labelFromIdOrName

  #
  # loginButtonLoggedOut template
  #
  Template._loginInlineLoggedOut.dropdown = ->
    Accounts._loginInline.dropdown()

  Template._loginInlineLoggedOut.services = ->
    Accounts._loginInline.getLoginServices()

  Template._loginInlineLoggedOut.singleService = ->
    services = Accounts._loginInline.getLoginServices()
    throw new Error("Shouldn't be rendering this template with more than one configured service")  if services.length isnt 1
    services[0]

  Template._loginInlineLoggedOut.configurationLoaded = ->
    Accounts.loginServicesConfigured()


  #
  # loginInlineLoggedIn template
  #

  # decide whether we should show a dropdown rather than a row of
  # buttons
  Template._loginInlineLoggedIn.dropdown = ->
    Accounts._loginInline.dropdown()

  Template._loginInlineLoggedIn.displayName = ->
    Accounts._loginInline.displayName()


  #
  # loginInlineMessage template
  #
  Template._loginInlineMessages.errorMessage = ->
    loginInlineSession.get "errorMessage"

  Template._loginInlineMessages.infoMessage = ->
    loginInlineSession.get "infoMessage"


  #
  # loginInlineLoggingInPadding template
  #
  Template._loginInlineLoggingInPadding.dropdown = ->
    Accounts._loginInline.dropdown()


  #
  # helpers
  #
  Accounts._loginInline.displayName = ->
    user = Meteor.user()
    return ""  unless user
    return user.profile.name  if user.profile and user.profile.name
    return user.username  if user.username
    return user.emails[0].address  if user.emails and user.emails[0] and user.emails[0].address
    ""

  Accounts._loginInline.getLoginServices = ->

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


  Accounts._loginInline.hasPasswordService = ->
    !!Package["accounts-password"]

  Accounts._loginInline.dropdown = ->
    @hasPasswordService() or getLoginServices().length > 1


  # XXX improve these. should this be in accounts-password instead?
  #
  # XXX these will become configurable, and will be validated on
  # the server as well.
  Accounts._loginInline.validateUsername = (username) ->
    if username.length >= 3
      true
    else
      loginInlineSession.errorMessage "Username must be at least 3 characters long"
      false

  Accounts._loginInline.validateEmail = (email) ->
    return true  if Accounts.ui._passwordSignupFields() is "USERNAME_AND_OPTIONAL_EMAIL" and email is ""
    re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if re.test(email)
      true
    else
      loginInlineSession.errorMessage "Invalid email"
      false

  Accounts._loginInline.validatePassword = (password) ->
    if password.length >= 6
      true
    else
      loginInlineSession.errorMessage "Password must be at least 6 characters long"
      false
)()
