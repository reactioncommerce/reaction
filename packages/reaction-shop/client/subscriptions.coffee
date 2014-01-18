share.ConfigDataHandle = Meteor.subscribe 'ConfigData'
Meteor.subscribe 'products'
Meteor.subscribe 'orders'
Meteor.subscribe 'customers'
Meteor.subscribe 'tags'
Meteor.subscribe 'shops'

####################################################
#  Reactive current product
#  This ensures singleton reactive products, without session
#
#  set usage: currentProduct.set "product",object
#  get usage: currentProduct.get "product"
####################################################
currentProduct =
  keys: {}
  deps: {}
  get: (key) ->
    @ensureDeps key
    @deps[key].depend()
    @keys[key]
  set: (key, value) ->
    @ensureDeps key
    @keys[key] = value
    @deps[key].changed()
  ensureDeps: (key) ->
    @deps[key] = new Deps.Dependency  unless @deps[key]

####################################################
#  Method to set default variant
#  @params variant id
####################################################
@setVariant = (variant) ->
  index = 0
  isDefault = true
  for item,value in (currentProduct.get "product")?.variants
    index += 1
    if item._id is variant #process variant param
      currentProduct.set "variant", item
      #currentProduct.set "index", index
      isDefault = false
  if isDefault
    currentProduct.set "variant", (currentProduct.get "product")?.variants[0]
    currentProduct.set "index", 0


####################################################
#  Autorun dependencies
#  ensure user cart is created, and address located
####################################################
Deps.autorun ->
  if Session.get('serverSession')
    Meteor.subscribe 'cart', Session.get('serverSession')._id
    userId = Meteor.userId()
    sessionId = Session.get("serverSession")._id
    # Check for, create cart
    Meteor.call "createCart", sessionId, userId, (err, cart) ->
      # Insert new item, update quantity for existing
      Session.set('shoppingCart', Cart.findOne())

  unless Session.get('address')
    #Setting Default because we get here before location calc
    address = {
      latitude: null,
      longitude: null,
      country: 'United States',
      city: null,
      state: null,
      stateCode: null,
      zipcode: null,
      streetName: null,
      streetNumber: null,
      countryCode: 'US'
    }
    Session.set("address",address)

####################################################
#  Geolocate Methods
#  look up user location at startup
####################################################

Meteor.startup ->
  #Pass the lat/long to google geolocate
  successFunction = (position) ->
    lat = position.coords.latitude
    lng = position.coords.longitude
    Meteor.call "locateAddress", lat, lng, (error, address) ->
      Session.set("address",address)
  errorFunction = ->
    Meteor.call "locateAddress", (error, address) ->
      Session.set("address",address)

  navigator.geolocation.getCurrentPosition successFunction, errorFunction  if navigator.geolocation
