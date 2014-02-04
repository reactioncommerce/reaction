PackagesHandle = Meteor.subscribe("Packages")
share.ConfigDataHandle = Meteor.subscribe 'ConfigData'
Meteor.subscribe 'products'
Meteor.subscribe 'orders'
Meteor.subscribe 'customers'
Meteor.subscribe 'tags'
Meteor.subscribe 'cart'
Meteor.subscribe 'shops'
#shops and cart are subscribed in router



####################################################
#  Reactive current product
#  This ensures singleton reactive products, without session
#
#  set usage: currentProduct.set "product",object
#  get usage: currentProduct.get "product"
####################################################
@currentProduct =
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
  changed: (key) ->
    @ensureDeps key
    @deps[key].changed()
  ensureDeps: (key) ->
    @deps[key] = new Deps.Dependency  unless @deps[key]

currentProduct = @currentProduct

####################################################
#  Autorun dependencies
#  ensure user cart is created, and address located
####################################################
Deps.autorun ->
  cartSession =
    sessionId: Session.get "sessionId"
    userId: Meteor.userId()

  cart = Cart.findOne Session.get "sessionId", Meteor.userId()
  unless cart? and Session.get "sessionId"
    Meteor.call "createCart", cartSession

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
