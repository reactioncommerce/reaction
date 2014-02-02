(->

  # for convenience
  loginButtonsSession = Accounts._loginButtonsSession

  #
  # populate the session so that the appropriate dialogs are
  # displayed by reading variables set by accounts-urls, which parses
  # special URLs. since accounts-ui depends on accounts-urls, we are
  # guaranteed to have these set at this point.
  #
  loginButtonsSession.set "resetPasswordToken", Accounts._resetPasswordToken  if Accounts._resetPasswordToken
  loginButtonsSession.set "enrollAccountToken", Accounts._enrollAccountToken  if Accounts._enrollAccountToken

  # Needs to be in Meteor.startup because of a package loading order
  # issue. We can't be sure that accounts-password is loaded earlier
  # than accounts-ui so Accounts.verifyEmail might not be defined.
  Meteor.startup ->
    if Accounts._verifyEmailToken
      Accounts.verifyEmail Accounts._verifyEmailToken, (error) ->
        Accounts._enableAutoLogin()
        loginButtonsSession.set "justVerifiedEmail", true  unless error



  # XXX show something if there was an error.

  #
  # resetPasswordDialog template
  #
  Template._resetPasswordDialog.rendered = ->
    $modal = $(@find("#login-buttons-reset-password-modal"))
    $modal.modal()

  Template._resetPasswordDialog.events
    "click #login-buttons-reset-password-button": ->
      resetPassword()

    "keypress #reset-password-new-password": (event) ->
      resetPassword()  if event.keyCode is 13

    "click #login-buttons-cancel-reset-password": ->
      loginButtonsSession.set "resetPasswordToken", null
      Accounts._enableAutoLogin()
      $("#login-buttons-reset-password-modal").modal "hide"

  resetPassword = ->
    loginButtonsSession.resetMessages()
    newPassword = document.getElementById("reset-password-new-password").value
    return  unless Accounts._loginButtons.validatePassword(newPassword)
    Accounts.resetPassword loginButtonsSession.get("resetPasswordToken"), newPassword, (error) ->
      if error
        loginButtonsSession.errorMessage error.reason or "Unknown error"
      else
        loginButtonsSession.set "resetPasswordToken", null
        Accounts._enableAutoLogin()
        $("#login-buttons-reset-password-modal").modal "hide"


  Template._resetPasswordDialog.inResetPasswordFlow = ->
    loginButtonsSession.get "resetPasswordToken"


  #
  # enrollAccountDialog template
  #
  Template._enrollAccountDialog.events
    "click #login-buttons-enroll-account-button": ->
      enrollAccount()

    "keypress #enroll-account-password": (event) ->
      enrollAccount()  if event.keyCode is 13

    "click #login-buttons-cancel-enroll-account-button": ->
      loginButtonsSession.set "enrollAccountToken", null
      Accounts._enableAutoLogin()
      $modal.modal "hide"

  Template._enrollAccountDialog.rendered = ->
    $modal = $(@find("#login-buttons-enroll-account-modal"))
    $modal.modal()

  enrollAccount = ->
    loginButtonsSession.resetMessages()
    password = document.getElementById("enroll-account-password").value
    return  unless Accounts._loginButtons.validatePassword(password)
    Accounts.resetPassword loginButtonsSession.get("enrollAccountToken"), password, (error) ->
      if error
        loginButtonsSession.errorMessage error.reason or "Unknown error"
      else
        loginButtonsSession.set "enrollAccountToken", null
        Accounts._enableAutoLogin()
        $modal.modal "hide"


  Template._enrollAccountDialog.inEnrollAccountFlow = ->
    loginButtonsSession.get "enrollAccountToken"


  #
  # justVerifiedEmailDialog template
  #
  Template._justVerifiedEmailDialog.events "click #just-verified-dismiss-button": ->
    loginButtonsSession.set "justVerifiedEmail", false

  Template._justVerifiedEmailDialog.visible = ->
    loginButtonsSession.get "justVerifiedEmail"


  #
  # loginButtonsMessagesDialog template
  #

  # Template._loginButtonsMessagesDialog.rendered = function() {
  #   var $modal = $(this.find('#configure-login-service-dialog-modal'));
  #   $modal.modal();
  # }
  Template._loginButtonsMessagesDialog.events "click #messages-dialog-dismiss-button": ->
    loginButtonsSession.resetMessages()

  Template._loginButtonsMessagesDialog.visible = ->
    hasMessage = loginButtonsSession.get("infoMessage") or loginButtonsSession.get("errorMessage")
    not Accounts._loginButtons.dropdown() and hasMessage


  #
  # configureLoginServiceDialog template
  #
  Template._configureLoginServiceDialog.events
    "click .configure-login-service-dismiss-button": ->
      loginButtonsSession.set "configureLoginServiceDialogVisible", false

    "click #configure-login-service-dialog-save-configuration": ->
      if loginButtonsSession.get("configureLoginServiceDialogVisible") and not loginButtonsSession.get("configureLoginServiceDialogSaveDisabled")

        # Prepare the configuration document for this login service
        serviceName = loginButtonsSession.get("configureLoginServiceDialogServiceName")
        configuration = service: serviceName
        for field of configurationFields()
          configuration[field.property] = document.getElementById("configure-login-service-dialog-" + field.property).value.replace(/^\s*|\s*$/g, "") # trim;


        # Configure this login service
        Meteor.call "configureLoginService", configuration, (error, result) ->
          if error
            Meteor._debug "Error configuring login service " + serviceName, error
          else
            loginButtonsSession.set "configureLoginServiceDialogVisible", false



    # IE8 doesn't support the 'input' event, so we'll run this on the keyup as
    # well. (Keeping the 'input' event means that this also fires when you use
    # the mouse to change the contents of the field, eg 'Cut' menu item.)
    "input, keyup input": (event) ->

      # if the event fired on one of the configuration input fields,
      # check whether we should enable the 'save configuration' button
      updateSaveDisabled()  if event.target.id.indexOf("configure-login-service-dialog") is 0


  # check whether the 'save configuration' button should be enabled.
  # this is a really strange way to implement this and a Forms
  # Abstraction would make all of this reactive, and simpler.
  updateSaveDisabled = ->
    anyFieldEmpty = _.any(configurationFields(), (field) ->
      document.getElementById("configure-login-service-dialog-" + field.property).value is ""
    )
    loginButtonsSession.set "configureLoginServiceDialogSaveDisabled", anyFieldEmpty


  # Returns the appropriate template for this login service.  This
  # template should be defined in the service's package
  configureLoginServiceDialogTemplateForService = ->
    serviceName = loginButtonsSession.get("configureLoginServiceDialogServiceName")
    Template["configureLoginServiceDialogFor" + capitalize(serviceName)]

  configurationFields = ->
    template = configureLoginServiceDialogTemplateForService()
    template.fields()

  Template._configureLoginServiceDialog.configurationFields = ->
    configurationFields()

  Template._configureLoginServiceDialog.visible = ->
    loginButtonsSession.get "configureLoginServiceDialogVisible"

  Template._configureLoginServiceDialog.configurationSteps = ->
    # renders the appropriate template
    configureLoginServiceDialogTemplateForService()()

  Template._configureLoginServiceDialog.saveDisabled = ->
    loginButtonsSession.get "configureLoginServiceDialogSaveDisabled"


  # XXX from http://epeli.github.com/underscore.string/lib/underscore.string.js
  capitalize = (str) ->
    str = (if not str? then "" else String(str))
    str.charAt(0).toUpperCase() + str.slice(1)
)()
