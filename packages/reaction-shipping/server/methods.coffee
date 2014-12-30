Meteor.methods
  ###
  # add new shipping methods
  ###
  addShippingMethod: (insertDoc, updateDoc, currentDoc) ->
    console.log "insert: ", insertDoc
    console.log "update: ", updateDoc
    console.log "current: ", currentDoc
    # check providerId, String
    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # updates
    return ReactionCore.Collections.Shipping.update({'_id': currentDoc}, {$addToSet:{'methods': insertDoc}})

  ###
  # Update Shipping methods for a provider
  ###
  updateShippingMethods: (docId, currentDoc, updateDoc) ->
    # validation, permissions
    check docId, String
    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # updates
    return ReactionCore.Collections.Shipping.update({'_id': docId, 'methods': currentDoc}, {$set: {'methods.$': updateDoc}})

  ###
  # remove shipping method
  ###
  removeShippingMethod: (providerId, removeDoc) ->
    # validation, permissions
    check providerId, String
    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # pull shippingMethod
    ReactionCore.Collections.Shipping.update({'_id': providerId, 'methods': removeDoc}, {$pull: {'methods': removeDoc}})

  ###
  # add / insert shipping provider
  ###
  addShippingProvider: (insertDoc, updateDoc, currentDoc) ->
    # validation, permissions
    unless Roles.userIsInRole(Meteor.userId(), ['admin','shipping']) then return false
    # insert provider
    ReactionCore.Collections.Shipping.insert(insertDoc)
