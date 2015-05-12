Meteor.methods
  ###
  #
  # createShop
  # param String 'userId' optionally create shop for provided userId
  # param Object 'shop' optionally provide shop object to customize
  #
  ###
  createShop: (userId, shop) ->
    check userId, Match.Optional String
    check shop, Match.Optional Object
    currentUser = Meteor.userId()
    userId = userId || Meteor.userId()
    @unblock()

    unless Roles.userIsInRole currentUser, ['admin','member'], ReactionCore.getShopId()
      throw new Meteor.Error 403, "Access Denied"
    try
      shop =  Factory.create 'shop', shop
      Roles.addUsersToRoles [currentUser, userId], ['admin','dashboard'], shop._id
      return shop._id

    catch e
      ReactionCore.Events.warn "Failed to createShop", e

    return
