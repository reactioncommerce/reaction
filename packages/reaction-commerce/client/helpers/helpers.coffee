# *****************************************************
# Methods for the reaction permissions
# https://github.com/ongoworks/reaction#rolespermissions-system
# *****************************************************
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
# *****************************************************
# method to alway return an image,
# or a placeholder for a product variant
# *****************************************************
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

# *****************************************************
# method to return cart calculated values
# *****************************************************

Handlebars.registerHelper "cart", () ->
  cartCount: ->
    storedCart = Cart.findOne()
    count = 0
    ((count += items.quantity) for items in storedCart.items) if storedCart?.items
    Session.set "cartCount", count
    count

  cartShipping: ->
    shipping = Cart.findOne()?.shipping?.shippingMethod?.value
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
    shipping = parseFloat storedCart?.shipping?.shippingMethod?.value
    subtotal = (subtotal + shipping) unless isNaN(shipping)
    subtotal = subtotal.toFixed(2)
    Session.set "cartTotal", subtotal
    subtotal

  showLowInventoryWarning: ->
    storedCart = Cart.findOne()
    if storedCart?.items
      for item in storedCart?.items
        if item.variants?.lowInventoryWarning and item.variants?.lowInventoryWarningThreshold
          if (item.variants?.inventoryQuantity < item.variants.lowInventoryWarningThreshold)
            return true
    return false


# *****************************************************
# method to return tag specific product
# *****************************************************
@getProductsByTag = (tag) ->
  selector = {}
  if tag
    tagIds = []
    relatedTags = [tag]
    while relatedTags.length
      newRelatedTags = []
      for relatedTag in relatedTags
        if tagIds.indexOf(relatedTag._id) == -1
          tagIds.push(relatedTag._id)
          if relatedTag.relatedTagIds?.length
            newRelatedTags = _.union(newRelatedTags, Tags.find({_id: {$in: relatedTag.relatedTagIds}}).fetch())
      relatedTags = newRelatedTags
    selector.tagIds = {$in: tagIds}
  cursor = Products.find(selector)
