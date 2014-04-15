Template.checkoutLogin.rendered = ->
  # initial screen in checkout should be to create an account
  loginButtonsSession = Accounts._loginButtonsSession
  loginButtonsSession.set "inSignupFlow", true