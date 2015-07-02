###
# coreLayout and coreHeader
# used to define layout for routes
# see: common/routing.coffee
###

#
# insert metadata into head
#
Template.coreHead.helpers
  metaData: (metaData) ->
    return ReactionCore.MetaData
