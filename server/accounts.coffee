Accounts.onCreateUser (options, user) ->
  if options.profile
    options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=small"
    user.profile = options.profile
  user