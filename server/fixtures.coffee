###
# Start up fixtures
###
Meteor.startup ->
  # update for reaction package/app settings from private/settings/reaction.json
  try Fixtures.loadSettings Assets.getText "settings/reaction.json"
