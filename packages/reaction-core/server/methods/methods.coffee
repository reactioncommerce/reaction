Meteor.methods
  ###
  # method to determine user's location for autopopulating addresses
  ###
  locateAddress: (latitude, longitude) ->
    Future = Npm.require("fibers/future")
    geocoder = Npm.require("node-geocoder")
    future = new Future()

    if latitude
      locateCoord = geocoder.getGeocoder("google", "http")
      locateCoord.reverse latitude, longitude, (err, address) ->
        if err then Meteor._debug(err)
        future.return(address)
    else
      ip = this.connection.httpHeaders['x-forwarded-for']
      locateIP = geocoder.getGeocoder("freegeoip", "http")

      locateIP.geocode ip, (err, address) ->
        if err then Meteor._debug(err)
        future.return(address)

    address = future.wait()
    if address?.length
      address[0]
    else # default location if nothing found is US
      {
        latitude: null
        longitude: null
        country: "United States"
        city: null
        state: null
        stateCode: null
        zipcode: null
        streetName: null
        streetNumber: null
        countryCode: "US"
      }

  ###
  # method to insert or update tag with hierachy
  # tagName will insert
  # tagName + tagId will update existing
  # currentTagId will update related/hierachy
  ###
  updateHeaderTags: (tagName, tagId, currentTagId) ->
    newTag =
      slug: _.slugify(tagName)
      name: tagName

    if tagId
      Tags.update(tagId,{$set:newTag})

    else
      newTag.isTopLevel = !currentTagId
      newTag.shopId = Meteor.app.getCurrentShop()._id
      newTag.updatedAt = new Date()
      newTag.createdAt = new Date()
      newTag._id = Tags.insert(newTag, (error, newTagId) ->
          if !error
            if currentTagId
              Tags.update(currentTagId, {$addToSet: {relatedTagIds: newTagId}})
      )
  removeHeaderTag: (tagId) ->
    Tags.remove(tagId)


  updatePackage: (updateDoc, packageName) ->
    console.log updateDoc
    # check(updateDoc, PackageConfigSchema)
    packageId = Packages.findOne({ name: packageName })._id

    Packages.update {_id: packageId}, updateDoc, (error,results) ->
      return false if error
      return true if results

