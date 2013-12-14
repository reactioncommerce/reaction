Meteor.startup ->
  Deps.autorun ->
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
        id = UserLocation.findOne()._id
        UserLocation.update({_id:id},{$set:address})
    errorFunction = ->
      console.log "Geocoder failed"
    #Get the latitude and the longitude;
    address = {
      data: null,
      street_number: null,
      street: null,
      city: null,
      region: null,
      country: "US",
      postal: null
    }
    id = UserLocation.insert(address)
    console.log id
    address = navigator.geolocation.getCurrentPosition successFunction, errorFunction  if navigator.geolocation