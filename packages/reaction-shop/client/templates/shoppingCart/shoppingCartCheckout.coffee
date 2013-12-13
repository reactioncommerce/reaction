Template.shoppingCartCheckoutList.helpers
  cartList: ->
    currentCart = Cart.findOne()
    if currentCart and currentCart.items
      return currentCart.items

  image:(variantId)->
    variants = Products.findOne({"variants._id":variantId},{fields:{"variants":true}}).variants
    variant = _.filter(variants, (item)-> item._id is variantId)

    if variant[0].medias and variant[0].medias[0].src?
      variant[0].medias[0].src
    else
      variants[0].medias[0].src

Template.shoppingCartCheckoutList.events
  'click .remove': (e,template) ->
    Meteor.call('removeFromCart',Cart.findOne()._id,this.variants)

Template.shoppingCartCheckout.rendered = ->
  #Pass the lat/long to google geolocate
  successFunction = (position) ->
    lat = position.coords.latitude
    lng = position.coords.longitude

    Meteor.call "locateAddress", lat, lng, (error, data) ->
      address = {
      data:data.results[0].address_components,
      street_number: data.results[0].address_components[0].short_name ,#street_number
      street: data.results[0].address_components[1].short_name, #route/street
      city: data.results[0].address_components[3].short_name, #city
      region: data.results[0].address_components[5].short_name, #state/region
      country: data.results[0].address_components[6].short_name, #country
      postal:data.results[0].address_components[7].short_name #postal_code
      }
      Location.insert(address)
  errorFunction = ->
    console.log "Geocoder failed"
  #Get the latitude and the longitude;
  navigator.geolocation.getCurrentPosition successFunction, errorFunction  if navigator.geolocation