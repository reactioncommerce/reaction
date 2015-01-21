loginButtonsSession = Accounts._loginButtonsSession

Template.checkoutLogin.rendered = ->
  # initial screen in checkout should be to create an account
  if !!ReactionCore.canCheckoutAsGuest()
    Session.set 'Reactioncommerce.Core.loginButtons.inLoginAsGuestFlow', true
    loginButtonsSession.set "inSignupFlow", false
  else
    loginButtonsSession.set "inSignupFlow", true
    Session.set 'Reactioncommerce.Core.loginButtons.inLoginAsGuestFlow', false

