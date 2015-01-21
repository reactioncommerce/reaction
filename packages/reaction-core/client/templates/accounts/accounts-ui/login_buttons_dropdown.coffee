loginButtonsSession = Accounts._loginButtonsSession

Template._loginButtonsLoggedOutPasswordService.helpers
  # Build a decorator to wrap the original function from Accounts package. When called,
  # just modify the visible property of the password field.
  fields: ((func) ->
    ->
      fields = func()
      unless loginButtonsSession.get("inSignupFlow")
        fields.forEach (item, i) ->
          if item.fieldName is "password"
            item.visible = ->
              not Session.get("Reactioncommerce.Core.loginButtons.inLoginAsGuestFlow")
          return
      return fields
  )(Blaze._getTemplateHelper(Template._loginButtonsLoggedOutPasswordService, "fields"))

  inLoginAsGuestFlow: ->
    return Session.get "Reactioncommerce.Core.loginButtons.inLoginAsGuestFlow"

  inLoginFlow: ->
    return not Session.get("Reactioncommerce.Core.loginButtons.inLoginAsGuestFlow") and
           not loginButtonsSession.get("inSignupFlow") and
           not loginButtonsSession.get("inForgotPasswordFlow")

  resetLoginFlow: ->
    Session.set 'Reactioncommerce.Core.loginButtons.inLoginAsGuestFlow', false
    loginButtonsSession.set "inSignupFlow", false
    loginButtonsSession.set 'inForgotPasswordFlow', false

  canCheckoutAsGuest: ->
    !!ReactionCore.canCheckoutAsGuest()
