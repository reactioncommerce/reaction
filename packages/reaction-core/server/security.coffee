Cart  = ReactionCore.Collections.Cart
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
# Generic Security Rule Manager
###

addAllowFuncForAll = (collections, types, fetch, func) ->
  rules = {fetch: fetch}
  _.each types, (t) ->
    rules[t] = func
  _.each collections, (c) ->
    c.allow rules

addDenyFuncForAll = (collections, types, fetch, func) ->
  rules = {fetch: fetch}
  _.each types, (t) ->
    rules[t] = func
  _.each collections, (c) ->
    c.deny rules

Security =
  # This one should be called for any collections you don't explicitly call allow on because one allow function is required
  defaultAllow: (collections) ->
    addAllowFuncForAll collections, ["insert", "update", "remove"], [], (userId) ->
      return true
  # For FS.Collections only, allows downloads for any user, even if not logged in
  allowAnonymousFileDownloads: (collections) ->
    addAllowFuncForAll collections, ["download"], [], (userId) ->
      return true
  # Allow inserts, updates, and removes only if the user is in one of the given roles
  allowOnlyRoles: (roles, types, collections) ->
    addDenyFuncForAll collections, types, [], (userId) ->
      return !Roles.userIsInRole(userId, roles)
  # Allow updates and removes only if doc.shopId matches the current shop
  mustMatchShop: (collections) ->
    addDenyFuncForAll collections, ["update", "remove"], ["shopId"], (userId, doc) ->
      return doc.shopId isnt ReactionCore.getShopId()
  # Allow updates only if doc.shopId is not being changed
  cantChangeShop: (collections) ->
    addDenyFuncForAll collections, ["update"], [], (userId, doc, fields, modifier) ->
      return !!modifier.$set?.shopId
  # Allow only if doc.userId matches the current userId, which might be null
  mustMatchUser: (types, collections) ->
    addDenyFuncForAll collections, types, ["userId"], (userId, doc) ->
      return userId? and doc.userId? and doc.userId isnt userId
  # Allow inserts, updates, and removes only if fileObj.metadata.shopId matches the current shop
  fileMustBelongToShop: (collections) ->
    addDenyFuncForAll collections, ["insert", "update", "remove"], [], (userId, fileObj) ->
      return fileObj.metadata.shopId isnt ReactionCore.getShopId(@)
  # Deny all
  denyAll: (types, collections) ->
    addDenyFuncForAll collections, types, [], ->
      return true

###
# We add some common security rules through simple Security methods
###

Security.defaultAllow [ Media, FileStorage, Packages, Products, Orders, Cart, Tags, Translations, Discounts, Taxes, Shipping ]

Security.allowOnlyRoles ['admin'], ["insert", "update", "remove"], [ Media, FileStorage, Products, Tags, Translations, Discounts, Taxes, Shipping ]

Security.allowOnlyRoles ['admin'], ["update", "remove"], [ Shops ]

Security.allowOnlyRoles ['owner'], ["remove"], [ Orders ]

Security.mustMatchShop [ Packages, Products, Orders, Cart, Tags, Discounts, Taxes, Shipping ]

Security.cantChangeShop [ Packages, Products, Orders, Cart, Tags, Discounts, Taxes, Shipping ]

# Must use server methods to create and remove carts
Security.denyAll ["insert", "remove"], [ Cart ]

# Can update all session carts if not logged in or user cart if logged in as that user
# TODO: should verify session match, but doesn't seem possible? Might have to move all cart updates to server methods, too?
Security.mustMatchUser ["update"], [ Cart ]

Security.fileMustBelongToShop [ Media, FileStorage ]

Security.allowAnonymousFileDownloads [ Media, FileStorage ] #todo: allowing anonymous for FileStorage is probably not correct

###
# Extra client access rights for shops
# XXX These should be verified and might be able to be folded into Security above
###
Shops.allow
  insert: (userId, doc) ->
    # the user must be logged in, and the document must be owned by the user
    return userId and doc.ownerId is userId
  update: (userId, doc, fields, modifier) ->
    return doc.ownerId is userId
  remove: (userId, doc) ->
    return doc.ownerId is userId
  fetch: ["ownerId"]
