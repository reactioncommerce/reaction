(->
  VALID_KEYS = [
    "dropdownVisible"

    # XXX consider replacing these with one key that has an enum for values.
    "inSignupFlow"
    "inForgotPasswordFlow"
    "inChangePasswordFlow"
    "inMessageOnlyFlow"
    "errorMessage"
    "infoMessage"

    # dialogs with messages (info and error)
    "resetPasswordToken"
    "enrollAccountToken"
    "justVerifiedEmail"
    "inlineConfigureLoginServiceDialogVisible"
    "inlineConfigureLoginServiceDialogServiceName"
    "inlineConfigureLoginServiceDialogSaveDisabled"
  ]
  validateKey = (key) ->
    throw new Error("Invalid key in loginInlineSession: " + key)  unless _.contains(VALID_KEYS, key)

  KEY_PREFIX = "Meteor.loginInline."

  # XXX we should have a better pattern for code private to a package like this one
  Accounts._loginInlineSession =
    set: (key, value) ->
      validateKey key
      throw new Error("Don't set errorMessage or infoMessage directly. Instead, use errorMessage() or infoMessage().")  if _.contains([
        "errorMessage"
        "infoMessage"
      ], key)
      @_set key, value

    _set: (key, value) ->
      Session.set KEY_PREFIX + key, value

    get: (key) ->
      validateKey key
      Session.get KEY_PREFIX + key

    closeDropdown: ->
      @set "inSignupFlow", false
      @set "inForgotPasswordFlow", false
      @set "inChangePasswordFlow", false
      @set "inMessageOnlyFlow", false
      @set "dropdownVisible", false
      @resetMessages()

    infoMessage: (message) ->
      @_set "errorMessage", null
      @_set "infoMessage", message
      @ensureMessageVisible()

    errorMessage: (message) ->
      @_set "errorMessage", message
      @_set "infoMessage", null
      @ensureMessageVisible()


    # is there a visible dialog that shows messages (info and error)
    isMessageDialogVisible: ->
      @get("resetPasswordToken") or @get("enrollAccountToken") or @get("justVerifiedEmail")


    # ensure that somethings displaying a message (info or error) is
    # visible.  if a dialog with messages is open, do nothing;
    # otherwise open the dropdown.
    #
    # notably this doesn't matter when only displaying a single login
    # button since then we have an explicit message dialog
    # (_loginInlineMessageDialog), and dropdownVisible is ignored in
    # this case.
    ensureMessageVisible: ->
      @set "dropdownVisible", true  unless @isMessageDialogVisible()

    resetMessages: ->
      @_set "errorMessage", null
      @_set "infoMessage", null

    configureService: (name) ->
      @set "inlineConfigureLoginServiceDialogVisible", true
      @set "inlineConfigureLoginServiceDialogServiceName", name
      @set "inlineConfigureLoginServiceDialogSaveDisabled", true
)()
