Accounts.onCreateUser (options, user) ->
  user.profile = options.profile || {}

  if user.services.facebook
    options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=small"

  user
