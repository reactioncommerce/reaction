Handlebars.registerHelper "hasShopPermission", (permissions) ->
  packageShop.hasPermission(permissions)

Handlebars.registerHelper "hasOwnerAccess", ->
  packageShop.hasOwnerAccess()

