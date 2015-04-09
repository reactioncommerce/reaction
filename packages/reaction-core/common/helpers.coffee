_.extend ReactionCore,
  shopIdAutoValue: ->
    return if @isSet and @isFromTrustedCode

    if Meteor.isClient and @isInsert
      # will be set correctly on the server
      return ReactionCore.getShopId() or "1"
    else if Meteor.isServer and (@isInsert or @isUpsert)
      # forced value for client-initiated inserts
      # or for server-initiated inserts where shopId isn't set
      return ReactionCore.getShopId()
    else
      # for client-initiated update, be
      # sure we don't allow changing this property
      @unset()
      return
