###
# Reaction Handlebars helpers
###

###
# Methods for the reaction permissions
# https://github.com/ongoworks/reaction#rolespermissions-system
###
Handlebars.registerHelper "hasShopPermission", (permissions) ->
  Meteor.app.hasPermission(permissions)

Handlebars.registerHelper "hasOwnerAccess", ->
  Meteor.app.hasOwnerAccess()

Handlebars.registerHelper "hasDashboardAccess", ->
  Meteor.app.hasDashboardAccess()

Handlebars.registerHelper "activeRouteClass", ->
  args = Array::slice.call(arguments, 0)
  args.pop()
  active = _.any(args, (name) ->
    location.pathname is Router.path(name)
  )
  active and "active"

Handlebars.registerHelper "siteName", ->
  siteName = Shops.findOne().name
  siteName
###
# method to alway return an image,
# or a placeholder for a product variant
###
Handlebars.registerHelper "getVariantImage", (variant) ->
  variant = (currentProduct.get "variant") unless variant?._id
  if variant?._id
    try
      media = variant.medias[0].src
    catch err
      console.log "No media found! Returning default."
      if this.variants[0]?.medias?.src
        media = this.variants[0].medias[0].src
      else
        media = "../../resources/placeholder.jpeg"
    finally
      media
  else
    console.log "Variant image error: No object passed"

###
# method to return cart calculated values
###

Handlebars.registerHelper "cart", () ->
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
Handlebars.registerHelper "condition", (v1, operator, v2, options) ->
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

Handlebars.registerHelper "key_value", (context, options) ->
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
Handlebars.registerHelper "nl2br", (text) ->

  #        text = Handlebars.Utils.escapeExpression(text);
  nl2br = (text + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + "<br>" + "$2")
  new Handlebars.SafeString(nl2br)


###
# format an ISO date using Moment.js
# http://momentjs.com/
# moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
# usage: {{dateFormat creation_date format="MMMM YYYY"}}
###
Handlebars.registerHelper "dateFormat", (context, block) ->
  if window.moment
    f = block.hash.format or "MMM DD, YYYY hh:mm:ss A"
    return moment(context).format(f) #had to remove Date(context)
  else
    return context #  moment plugin not available. return data as is.
  return

Handlebars.registerHelper "uc", (str) ->
  encodeURIComponent str

###
# general helper for plurization of strings
# returns string with 's' concatenated if n = 1
###
Handlebars.registerHelper "pluralize", (n, thing) ->

  # fairly stupid pluralizer
  if n is 1
    "1 " + thing
  else
    n + " " + thing + "s"

###
# general helper for formatting price
# returns string float currency format
###
Handlebars.registerHelper "formatPrice", (price) ->
  price.toFixed(2)

###
# general helper user name handling
# todo: needs additional validation all use cases
# returns first word in profile name
###
Handlebars.registerHelper "fname", ->
  if Meteor.user()
    name = Meteor.user().profile.name.split(" ")
    fname = name[0]
    fname


###
# general helper for determine if user has a store
# returns boolean
###
Handlebars.registerHelper "userHasProfile", ->
  user = Meteor.user()
  user and !!user.profile.store

Handlebars.registerHelper "userHasRole", (role) ->
  user = Meteor.user()
  user and user.roles.indexOf(role) isnt -1  if user and user.roles


###
# general helper to return 'active' when on current path
# returns string
# handlebars: {{active 'route'}}
###

#Determine if current link should be active
Handlebars.registerHelper "active", (path) ->
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
Handlebars.registerHelper "navLink", (page, icon) ->
  ret = "<li "
  ret += "class='active'"  if Meteor.Router.page() is page
  ret += "><a href='" + Meteor.Router.namedRoutes[page].path + "'><i class='" + icon + " icon-fixed-width'></i></a></li>"
  new Handlebars.SafeString(ret)




###
# Handler Helper allows you to load templates dynamically
# format: {{{getTemplate package context}}}
# example: {{{getTemplate widget }}}
###
Handlebars.registerHelper "getTemplate", (pkg, context) ->
  templateName = pkg + "-widget"
  Template[templateName] context  if Template[templateName]


###
# Handler Helper foreach loop with positional information
# example:
# {{#foreach foo}}
#     <div class='{{#if first}}first{{/if}}{{#if last}} last{{/if}}'>{{index}}</div>
# {{/foreach}}
###
Handlebars.registerHelper "foreach", (arr, options) ->
  return options.inverse(this)  if options.inverse and not arr.length
  arr.map((item, index) ->
    item.index = index
    item.first = index is 0
    item.last = index is arr.length - 1
    options.fn item
  ).join ""

###
# https://github.com/meteor/meteor/issues/281
###
Handlebars.registerHelper "labelBranch", (label, options) ->
  data = this
  Spark.labelBranch Spark.UNIQUE_LABEL, ->
    options.fn data