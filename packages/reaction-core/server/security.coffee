###
# The following security definitions use the ongoworks:security package.
# Rules within a single chain stack with AND relationship. Multiple
# chains for the same collection stack with OR relationship.
# See https://github.com/ongoworks/meteor-security
#
# It's important to note that these security rules are for inserts,
# updates, and removes initiated from untrusted (client) code.
# Thus there may be other actions that certain roles are allowed to
# take, but they do not necessarily need to be listed here if the
# database operation is executed in a server method.
###

###
# Assign to some local variables to keep code
# short and sweet
###
Cart = ReactionCore.Collections.Cart
Customers = ReactionCore.Collections.Customers
Discounts = ReactionCore.Collections.Discounts
FileStorage = ReactionCore.Collections.FileStorage
Media = ReactionCore.Collections.Media
Orders = ReactionCore.Collections.Orders
Packages = ReactionCore.Collections.Packages
Products = ReactionCore.Collections.Products
Shipping =  ReactionCore.Collections.Shipping
Shops = ReactionCore.Collections.Shops
Tags = ReactionCore.Collections.Tags
Taxes = ReactionCore.Collections.Taxes
Translations = ReactionCore.Collections.Translations

###
# Define some additional rule chain methods
###

Security.defineMethod 'ifShopIdMatches',
  fetch: []
  deny: (type, arg, userId, doc) ->
    return doc.shopId isnt ReactionCore.getShopId()

Security.defineMethod 'ifShopIdMatchesThisId',
  fetch: []
  deny: (type, arg, userId, doc) ->
    return doc._id isnt ReactionCore.getShopId()

Security.defineMethod 'ifFileBelongsToShop',
  fetch: []
  deny: (type, arg, userId, doc) ->
    return doc.metadata.shopId isnt ReactionCore.getShopId()

# If userId prop matches userId or both are not set
Security.defineMethod 'ifUserIdMatches',
  fetch: []
  deny: (type, arg, userId, doc) ->
    return (userId and doc.userId and doc.userId isnt userId) or (doc.userId and !userId)

# Generic check for userId against any prop
# TODO might be good to have this in the
# ongoworks:security pkg as a built-in rule
Security.defineMethod 'ifUserIdMatchesProp',
  fetch: []
  deny: (type, arg, userId, doc) ->
    return doc[arg] isnt userId

###
# Define all security rules
###

###
# Permissive security for users with the 'admin' role
###
Security.permit(['insert', 'update', 'remove'])
  .collections([
    Products,
    Tags,
    Translations,
    Discounts,
    Taxes,
    Shipping,
    Orders
  ])
  .ifHasRole('admin')
  .ifShopIdMatches()
  .exceptProps(['shopId'])
  .apply()

###
# Permissive security for users with the 'admin' role for FS.Collections
###
Security.permit(['insert', 'update', 'remove'])
  .collections([Media, FileStorage])
  .ifHasRole('admin')
  .ifFileBelongsToShop()
  # TODO should be a check here or elsewhere to
  # make sure we don't allow editing metadata.shopId
  .apply()

###
# Users with the 'admin' or 'owner' role may update and
# remove their shop but may not insert one.
###
Shops.permit(['update', 'remove'])
  .ifHasRole(['admin', 'owner'])
  .ifShopIdMatchesThisId()
  .ifUserIdMatchesProp('ownerId')
  .apply()

###
# Users with the 'owner' role may remove orders for their shop
###
Orders.permit('remove')
  .ifHasRole('owner')
  .ifUserIdMatchesProp('ownerId')
  .ifShopIdMatches()
  .exceptProps(['shopId'])
  .apply()

###
# Can update cart from client. Must insert/remove carts using
# server methods.
# Can update all session carts if not logged in or user cart if logged in as that user
# XXX should verify session match, but doesn't seem possible? Might have to move all cart updates to server methods, too?
###
Cart.permit('update').ifUserIdMatches().exceptProps(['shopId']).apply()

# Allow anonymous file downloads
# XXX This is probably not actually how we want to handle file download security.
_.each [ Media, FileStorage ], (fsCollection) ->
  fsCollection.allow
    download: -> return true
