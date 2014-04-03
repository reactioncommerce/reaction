###
# Reaction Handlebars helpers
###


UI.registerHelper "pathForSEO", (path, params) ->
  if this[params]
    return "/"+ path + "/" + this[params]
  else
    return Router.path path,this

UI.registerHelper "displayName", () ->
  user = Meteor.user()
  return ""  unless user
  return user.profile.name  if user.profile and user.profile.name
  return user.username  if user.username
  return user.emails[0].address  if user.emails and user.emails[0] and user.emails[0].address
  ""

UI.registerHelper "socialImage", () ->
  Meteor.user().profile?.picture

###
# Methods for the reaction permissions
# https://github.com/ongoworks/reaction#rolespermissions-system
###
UI.registerHelper "hasShopPermission", (permissions) ->
  Meteor.app.hasPermission(permissions)

UI.registerHelper "hasOwnerAccess", ->
  Meteor.app.hasOwnerAccess()

UI.registerHelper "hasDashboardAccess", ->
  Meteor.app.hasDashboardAccess()

UI.registerHelper "activeRouteClass", ->
  args = Array::slice.call(arguments, 0)
  args.pop()
  active = _.any(args, (name) ->
    location.pathname is Router.path(name)
  )
  active and "active"

UI.registerHelper "siteName", ->
  siteName = Shops.findOne()?.name
  siteName
###
# method to alway return an image,
# or a placeholder for a product variant
###
# UI.registerHelper "getVariantImage", (variant) ->
#   variant = (currentProduct.get "variant") unless variant?._id
#   console.log variant
#   if variant?._id
#       image = Media.find({'metadata.variantId':variant._id})
#       image = image.url({store: "gridfsimages"})
#   else
#       console.log "No media found! Returning default."
#       image = "../../resources/placeholder.jpeg"



###
# method to return cart calculated values
###

UI.registerHelper "cart", () ->
  cartCount: ->
    storedCart = Cart.findOne()
    count = 0
    ((count += items.quantity) for items in storedCart.items) if storedCart?.items
    Session.set "cartCount", count
    count

  cartShipping: ->
    shipping = Cart.findOne()?.shipping?.shipmentMethod?.value
    Session.set "cartShipping", shipping
    shipping

  cartSubTotal: ->
    storedCart = Cart.findOne()
    subtotal = 0
    ((subtotal += (items.quantity * items.variants.price)) for items in storedCart.items) if storedCart?.items
    subtotal = subtotal.toFixed(2)
    Session.set "cartSubTotal", subtotal
    subtotal

  cartTotal: ->
    storedCart = Cart.findOne()
    subtotal = 0
    ((subtotal += (items.quantity * items.variants.price)) for items in storedCart.items) if storedCart?.items
    shipping = parseFloat storedCart?.shipping?.shipmentMethod?.value
    subtotal = (subtotal + shipping) unless isNaN(shipping)
    subtotal = subtotal.toFixed(2)
    Session.set "cartTotal", subtotal
    subtotal

  # return true if there is an issue with the user's cart and we should display the warning icon
  showCartIconWarning: ->
    if @.showLowInventoryWarning()
        return true
    return false

  # return true if any item in the user's cart has a low inventory warning
  showLowInventoryWarning: ->
    storedCart = Cart.findOne()
    if storedCart?.items
      for item in storedCart?.items
        if item.variants?.inventoryPolicy and item.variants?.lowInventoryWarning and item.variants?.lowInventoryWarningThreshold
          if (item.variants?.inventoryQuantity < item.variants.lowInventoryWarningThreshold)
            return true
    return false

  # return true if item variant has a low inventory warning
  showItemLowInventoryWarning: (variant) ->
    if variant?.inventoryPolicy and variant?.lowInventoryWarning and variant?.lowInventoryWarningThreshold
      if (variant?.inventoryQuantity < variant.lowInventoryWarningThreshold)
        return true
    return false


###
#  General helpers for template functionality
###

###
# conditional template helpers
# example:  {{#if condition status "eq" ../value}}
###
UI.registerHelper "condition", (v1, operator, v2, options) ->
  switch operator
    when "==", "eq"
      v1 is v2
    when "!=", "neq"
      v1 isnt v2
    when "===", "ideq"
      v1 is v2
    when "!==", "nideq"
      v1 isnt v2
    when "&&", "and"
      v1 and v2
    when "||", "or"
      v1 or v2
    when "<", "lt"
      v1 < v2
    when "<=", "lte"
      v1 <= v2
    when ">", "gt"
      v1 > v2
    when ">=", "gte"
      v1 >= v2
    else
      throw "Undefined operator \"" + operator + "\""

UI.registerHelper "key_value", (context, options) ->
  result = []
  _.each context, (value, key, list) ->
    result.push
      key: key
      value: value
  result

###
# Convert new line (\n\r) to <br>
# from http://phpjs.org/functions/nl2br:480
###
UI.registerHelper "nl2br", (text) ->
  #        text = Handlebars.Utils.escapeExpression(text);
  nl2br = (text + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + "<br>" + "$2")
  new Spacebars.SafeString(nl2br)

###
# format an ISO date using Moment.js
# http://momentjs.com/
# moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
# usage: {{dateFormat creation_date format="MMMM YYYY"}}
###
UI.registerHelper "dateFormat", (context, block) ->
  if window.moment
    f = block.hash.format or "MMM DD, YYYY hh:mm:ss A"
    return moment(context).format(f) #had to remove Date(context)
  else
    return context #  moment plugin not available. return data as is.
  return

UI.registerHelper "uc", (str) ->
  encodeURIComponent str

###
# general helper for plurization of strings
# returns string with 's' concatenated if n = 1
###
UI.registerHelper "pluralize", (n, thing) ->
  # fairly stupid pluralizer
  if n is 1
    "1 " + thing
  else
    n + " " + thing + "s"

###
# general helper for formatting price
# returns string float currency format
###
UI.registerHelper "formatPrice", (price) ->
  price.toFixed(2)

###
# general helper user name handling
# todo: needs additional validation all use cases
# returns first word in profile name
###
UI.registerHelper "fname", ->
  if Meteor.user()
    name = Meteor.user().profile.name.split(" ")
    fname = name[0]
    fname

###
# general helper for determine if user has a store
# returns boolean
###
UI.registerHelper "userHasProfile", ->
  user = Meteor.user()
  user and !!user.profile.store

UI.registerHelper "userHasRole", (role) ->
  user = Meteor.user()
  user and user.roles.indexOf(role) isnt -1  if user and user.roles

###
# general helper to return 'active' when on current path
# returns string
# handlebars: {{active 'route'}}
###

#Determine if current link should be active
UI.registerHelper "active", (path) ->
  # Get the current path for URL
  current = Router.current()
  routeName = current and current.route.name
  if routeName is path
    "active"
  else
    ""

###
# general helper to return 'active' when on current path
# returns string
# handlebars: {{navLink 'projectsList' 'icon-edit'}}
###
UI.registerHelper "navLink", (page, icon) ->
  ret = "<li "
  ret += "class='active'"  if Meteor.Router.page() is page
  ret += "><a href='" + Meteor.Router.namedRoutes[page].path + "'><i class='" + icon + " icon-fixed-width'></i></a></li>"
  new Spacebars.SafeString(ret)
