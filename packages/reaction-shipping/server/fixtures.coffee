###
# Fixture - we always want a record
###
Meteor.startup ->
  jsonFile =  Assets.getText("private/data/Shipping.json")
  Fixtures.loadData ReactionCore.Collections.Shipping, jsonFile