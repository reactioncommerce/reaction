Match.OptionalOrNull = (pattern) -> Match.OneOf undefined, null, pattern

Meteor.methods
  ###
  # add new shipping methods
  ###
  addShippingMethod: (insertDoc, updateDoc, currentDoc) ->
    check insertDoc, Object
    check currentDoc, String
    check updateDoc, Object

    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # updates
    return ReactionCore.Collections.Shipping.update({'_id': currentDoc}, {$addToSet:{'methods': insertDoc}})

  ###
  # Update Shipping methods for a provider
  ###
  updateShippingMethods: (docId, currentDoc, updateDoc) ->
    check docId, String
    check currentDoc, Object
    check updateDoc, Object

    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # updates
    updateDoc = ReactionCore.Collections.Shipping.update({'_id': docId, 'methods': currentDoc}, {$set: {'methods.$': updateDoc}})
    return updateDoc

  ###
  # remove shipping method
  ###
  removeShippingMethod: (providerId, removeDoc) ->
    check providerId, String
    check removeDoc, Object

    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # pull shippingMethod
    ReactionCore.Collections.Shipping.update({'_id': providerId, 'methods': removeDoc}, {$pull: {'methods': removeDoc}})

  ###
  # add / insert shipping provider
  ###
  addShippingProvider: (insertDoc, updateDoc, currentDoc) ->
    check insertDoc, Object
    check updateDoc, Object
    check currentDoc, Match.OptionalOrNull(String)

    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # insert provider
    return ReactionCore.Collections.Shipping.insert(insertDoc)

  ###
  # update shipping provider
  ###
  updateShippingProvider: (insertDoc, updateDoc, currentDoc) ->
    check insertDoc, Object
    check updateDoc, Object
    check currentDoc, String

    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # insert provider
    return ReactionCore.Collections.Shipping.update('_id': currentDoc, updateDoc)
