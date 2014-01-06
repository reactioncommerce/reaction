Meteor.subscribe 'SystemConfig'
Meteor.subscribe 'products'
Meteor.subscribe 'orders'
Meteor.subscribe 'customers'
Meteor.subscribe 'tags'


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
