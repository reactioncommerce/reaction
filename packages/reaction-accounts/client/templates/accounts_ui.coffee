Accounts.ui = {}  unless Accounts.ui
Accounts.ui._options = requestPermissions: {}  unless Accounts.ui._options
Accounts.ui.config = (options) ->

  # validate options keys
  VALID_KEYS = [
    "passwordSignupFields"
    "requestPermissions"
  ]
  for v, keys of options
    throw new Error("Accounts.ui.config: Invalid key: " + key)  unless _.contains(VALID_KEYS, key)

  # deal with `passwordSignupFields`
  if options.passwordSignupFields
    if _.contains([
      "USERNAME_AND_EMAIL_CONFIRM"
      "USERNAME_AND_EMAIL"
      "USERNAME_AND_OPTIONAL_EMAIL"
      "USERNAME_ONLY"
      "EMAIL_ONLY"
    ], options.passwordSignupFields)
      if Accounts.ui._options.passwordSignupFields
        throw new Error("Accounts.ui.config: Can't set `passwordSignupFields` more than once")
      else
        Accounts.ui._options.passwordSignupFields = options.passwordSignupFields
    else
      throw new Error("Accounts.ui.config: Invalid option for `passwordSignupFields`: " + options.passwordSignupFields)

  # deal with `requestPermissions`
  if options.requestPermissions
    for scope, service of options.requestPermissions
      if Accounts.ui._options.requestPermissions[service]
        throw new Error("Accounts.ui.config: Can't set `requestPermissions` more than once for " + service)
      else unless scope instanceof Array
        throw new Error("Accounts.ui.config: Value for `requestPermissions` must be an array")
      else
        Accounts.ui._options.requestPermissions[service] = scope


Accounts.ui._passwordSignupFields = ->
  Accounts.ui._options.passwordSignupFields or "EMAIL_ONLY"
