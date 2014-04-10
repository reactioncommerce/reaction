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

    #existing tags
    unless tagId #prevent duplicate tags by checking for existing
      existingTag = Tags.findOne({"name":tagName})
      if currentTagId and existingTag
        Tags.update(currentTagId, {$addToSet: {"relatedTagIds": existingTag._id}})
        return
      else if existingTag and !currentTagId?
        Tags.update(existingTag._id, {$set:{"isTopLevel":true}})
        return
    #new tags
    if tagId #just an update
      Tags.update(tagId,{$set:newTag})
    else # create a new tag
      newTag.isTopLevel = !currentTagId
      newTag.shopId = Meteor.app.getCurrentShop()._id
      newTag.updatedAt = new Date()
      newTag.createdAt = new Date()
      newTag._id = Tags.insert(newTag, (error, newTagId) ->
          if !error
            if currentTagId
              Tags.update(currentTagId, {$addToSet: {"relatedTagIds": newTagId}})
      )

  removeHeaderTag: (tagId, currentTagId) ->
    if currentTagId
      Tags.update(currentTagId, {$pull: {"relatedTagIds": tagId}})
    # if not in use delete from system
    productCount = Products.find({"tagIds":{$in:[tagId]}}).count()
    relatedTagsCount = Tags.find({"relatedTagIds":{$in:[tagId]}}).count()

    if (productCount is 0) and (relatedTagsCount is 0)
      Tags.remove(tagId)


  updatePackage: (updateDoc, packageName) ->
    # check(updateDoc, PackageConfigSchema)
    packageId = Packages.findOne({ name: packageName })._id

    Packages.update {_id: packageId}, updateDoc, (error,results) ->
      return false if error
      return true if results

