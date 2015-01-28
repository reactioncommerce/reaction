###
# convert a string to camelCase
###
String::toCamelCase = ->
  # remove all characters that should not be in a variable name
  # as well underscores an numbers from the beginning of the string
  s = @replace(/([^a-zA-Z0-9_\- ])|^[_0-9]+/g, "").trim().toLowerCase()
  # uppercase letters preceeded by a hyphen or a space
  s = s.replace(/([ -]+)([a-zA-Z0-9])/g, (a, b, c) ->
    c.toUpperCase()
  )
  # uppercase letters following numbers
  s = s.replace(/([0-9]+)([a-zA-Z])/g, (a, b, c) ->
    b + c.toUpperCase()
  )
  return s

###
# quick and easy snippet for toggling sessions
# accepts string name, see http://docs.meteor.com/#/basic/session
# optional pass positive param match
###
@toggleSession = (sessionVariable, positive) ->
  check sessionVariable, String
  session = Session.get sessionVariable
  positive = positive || true

  if _.isEqual positive, session
    Session.set sessionVariable, false
  else
    Session.set sessionVariable, positive

  return Session.get sessionVariable

###
# method to return tag specific product
###
@getProductsByTag = (tag) ->
  selector = {}
  if tag
    hashtags = []
    relatedTags = [tag]
    while relatedTags.length
      newRelatedTags = []
      for relatedTag in relatedTags
        if hashtags.indexOf(relatedTag._id) == -1
          hashtags.push(relatedTag._id)
          if relatedTag.relatedTagIds?.length
            newRelatedTags = _.union(newRelatedTags, Tags.find({_id: {$in: relatedTag.relatedTagIds}}).fetch())
      relatedTags = newRelatedTags
    selector.hashtags = {$in: hashtags}
  cursor = Products.find(selector)

###
# confirm product deletion, delete, and alert
###
@maybeDeleteProduct = (prod) ->
  title = prod.title || "the product"
  id = prod._id
  if confirm("Delete this product?")
    Meteor.call "deleteProduct", id, (error, result) ->
      if error or not result
        Alerts.add "There was an error deleting " + title, "danger", type: "prod-delete-" + id,  i18n_key: "productDetail.productDeleteError"
        console.log "Error deleting product " + id, error
      else
        setCurrentProduct null
        Router.go "/"
        Alerts.add "Deleted " + title, "info", type: "prod-delete-" + id

@getCartCount = ->
  Meteor.subscribe "cart", Session.get "sessionId", Meteor.userId()
  storedCart = Cart.findOne()
  count = 0
  ((count += items.quantity) for items in storedCart.items) if storedCart?.items
  return count

@locateUser = ->
  #Pass the lat/long to google geolocate
  successFunction = (position) ->
    lat = position.coords.latitude
    lng = position.coords.longitude
    Meteor.call "locateAddress", lat, lng, (error, address) ->
      Session.set "address", address if address
  errorFunction = ->
    Meteor.call "locateAddress", (error, address) ->
      Session.set "address", address if address

  navigator.geolocation.getCurrentPosition successFunction, errorFunction if navigator.geolocation

###
#  Reactive current product
#  This ensures reactive products, without session
#  products:
#  set usage: currentProduct.set "productId",string
#  get usage: currentProduct.get "productId"
#  variants:
#  set usage: currentProduct.set "variantId",string
#  get usage: currentProduct.get "variantId"
###
@currentProduct =
  keys: {}
  deps: {}
  equals: (key) ->
    @keys[key]
  get: (key) ->
    @ensureDeps key
    @deps[key].depend()
    @keys[key]
  set: (key, value) ->
    @ensureDeps key
    @keys[key] = value
    @deps[key].changed()
  changed: (key) ->
    @ensureDeps key
    @deps[key].changed()
  ensureDeps: (key) ->
    @deps[key] = new Tracker.Dependency unless @deps[key]

currentProduct = @currentProduct

@setCurrentVariant = (variantId) ->
  # If we are unsetting, just do it
  if variantId is null
    currentProduct.set "variantId", null
    currentProduct.set "variantId", selectedVariantId()
  return unless variantId
  # If not unsetting, get the current variant ID
  currentId = selectedVariantId()
  # If we're changing to a different current ID, do it.
  # Otherwise there is no need to set.
  return if currentId is variantId
  currentProduct.set "variantId", variantId
  return

@setCurrentProduct = (productId) ->
  # If we are unsetting, just do it
  if productId is null
    currentProduct.set "productId", null
  return unless productId
  # If not unsetting, get the current product ID
  currentId = selectedProductId()
  # If we're changing to a different current ID, do it.
  # Otherwise there is no need to set.
  return if currentId is productId
  currentProduct.set "productId", productId
  # Clear the current variant as well
  currentProduct.set "variantId", null
  return

@selectedVariant = ->
  id = selectedVariantId()
  return unless id
  product = selectedProduct()
  return unless product
  variant = _.findWhere product.variants, _id: id
  return variant

@selectedProduct = ->
  id = selectedProductId()
  return Products.findOne id

@selectedProductId = ->
  return currentProduct.get "productId"

@selectedVariantId = ->
  id = currentProduct.get "variantId"
  return id if id?
  # default to top variant in selectedProduct
  product = selectedProduct()
  return unless product
  variants = (variant for variant in product.variants when not variant.parentId)
  return unless variants.length > 0
  id = variants[0]._id
  currentProduct.set "variantId", id
  return id

###
# return number of child variants for a parent
###
@checkChildVariants = (parentVariantId) ->
  product = selectedProduct()
  return unless product
  childVariants = (variant for variant in product.variants when variant?.parentId is parentVariantId)
  return childVariants.length

###
# get price range of a variant if it has child options.
# if no child options, return main price value
###
@getVariantPriceRange = (variantId, productId) ->
  productId = productId || selectedProductId()
  variantId = variantId || selectedVariant()._id

  product = Products.findOne(productId, )

  # we want to prevent this from running without valid params
  unless variantId and productId and product then return

  variant = _.findWhere product.variants, _id: variantId

  children = (thisVariant for thisVariant in product.variants when thisVariant.parentId is variantId)

  if children.length is 0
    if variant?.price
      return variant.price
    else
      return

  if children.length is 1
    return children[0].price

  priceMin = Number.POSITIVE_INFINITY
  priceMax = Number.NEGATIVE_INFINITY

  for child in children
    priceMin = child.price if child.price < priceMin
    priceMax = child.price if child.price > priceMax

  if priceMin is priceMax
    return priceMin
  return priceMin + ' - ' + priceMax

###
# get price range of a product
# if no only one price available, return it
###
@getProductPriceRange = (productId) ->
  # if no productId provided, use currently selected
  unless productId
    productId = selectedProduct()?._id
    return unless productId
  #
  product = Products.findOne(productId)
  variants = (variant for variant in product.variants when not variant.parentId)

  if variants.length > 0
    variantPrices = []
    for variant in variants
      range = getVariantPriceRange(variant._id, productId)
      if Match.test range, String
        firstPrice = parseFloat range.substr 0, range.indexOf(" ")
        lastPrice = parseFloat range.substr range.lastIndexOf(" ") + 1
        variantPrices.push firstPrice, lastPrice
      else
        variantPrices.push range

    priceMin = _.min variantPrices
    priceMax = _.max variantPrices
    if priceMin is priceMax
      return priceMin
    return priceMin + ' - ' + priceMax

###
# save an order as PDF
###
@saveOrderAsPDF = (order) ->
  Blaze.saveAsPDF Template.orderDetails,
    data: order
    filename: "order-" + order._id + ".pdf" #TODO should be configurable by admin
    orientation: "portrait" #TODO should be configurable by admin
    format: "letter" #TODO should be configurable by admin
    unit: "cm"
    # NOTE specifying margins seem to make formatting wonky, likely jsPDF issue
    #margins:
    #  left: 2.5
    #  right: 2.5
    #  top: 1
    #  bottom: 1
  return
