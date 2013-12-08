(->

  # for convenience
  loginInlineSession = Accounts._loginInlineSession
  Template._loginInlineLoggedOutSingleLoginButton.events "click .login-button": ->
    serviceName = @name
    loginInlineSession.resetMessages()
    callback = (err) ->
      unless err
        loginInlineSession.closeDropdown()
      else if err instanceof Accounts.LoginCancelledError


      # do nothing
      else if err instanceof Accounts.ConfigError
        loginInlineSession.configureService serviceName
      else
        loginInlineSession.errorMessage err.reason or "Unknown error"

    loginWithService = Meteor["loginWith" + capitalize(serviceName)]
    options = {} # use default scope unless specified
    options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName]  if Accounts.ui._options.requestPermissions[serviceName]
    loginWithService options, callback

  Template._loginInlineLoggedOutSingleLoginButton.configured = ->
    !!Accounts.loginServiceConfiguration.findOne(service: @name)

  Template._loginInlineLoggedOutSingleLoginButton.capitalizedName = ->
    if @name is "github"

      # XXX we should allow service packages to set their capitalized name
      "GitHub"
    else
      capitalize @name


  # XXX from http://epeli.github.com/underscore.string/lib/underscore.string.js
  capitalize = (str) ->
    str = (if not str? then "" else String(str))
    str.charAt(0).toUpperCase() + str.slice(1)
)()
