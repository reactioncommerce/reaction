Packages = ReactionCore.Collections.Packages

Meteor.methods
  ###
  # determine user's countryCode and return locale object
  ###
  getLocale: ->
    this.unblock()
    result = {}

    ip = this.connection.httpHeaders['x-forwarded-for']

    if ip
      geo = new GeoCoder(geocoderProvider: "freegeoip")
      countryCode = geo.geocode(ip)[0].countryCode.toUpperCase()

      # local development always returns 'RD'
      if !countryCode or countryCode is 'RD' then countryCode = 'US'

      shop = ReactionCore.Collections.Shops.findOne '_id': ReactionCore.getShopId()

      result.locale = shop.locales.countries[countryCode]
      result.currency = {}
      # get currency formats for locale, default if none
      # comma string/list can be used, but for now we're only using one result
      localeCurrency = shop.locales.countries[countryCode].currency.split(',')
      for currency in localeCurrency
        if shop.currencies[currency]
          result.currency = shop.currencies[currency]
          if shop.currency isnt currency
            #TODO Add some alternate configurable services like Open Exchange Rate
            rateUrl = "http://rate-exchange.herokuapp.com/fetchRate?from=" + shop.currency + "&to=" + currency
            exchangeRate = HTTP.get rateUrl
            result.currency.exchangeRate = exchangeRate.data
          return result #returning first match.

      #TODO Select default language from shop.
      unless result.currency
        result.currency = shop.currencies['US']
      return result

  ###
  # determine user's full location for autopopulating addresses
  ###
  locateAddress: (latitude, longitude) ->
    check latitude, Match.Optional(Number)
    check longitude, Match.Optional(Number)

    try
      if latitude? and longitude?
        geo = new GeoCoder()
        address = geo.reverse latitude, longitude
      else
        ip = this.connection.httpHeaders['x-forwarded-for']
        if ip
          geo = new GeoCoder(geocoderProvider: "freegeoip")
          address = geo.geocode ip
    catch error
      # something went wrong; we'll use the default location and
      # log the error on the server
      if latitude? and longitude?
        console.log "Error in locateAddress for latitude/longitude lookup (" + latitude + "," + longitude + "):" + error.message
      else
        console.log "Error in locateAddress for IP lookup (" + ip + "):" + error.message

    if address?.length
      return address[0]
    else # default location if nothing found is US
      return {
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
  # method to insert or update tag with hierarchy
  # tagName will insert
  # tagName + tagId will update existing
  # currentTagId will update related/hierarchy
  ###
  updateHeaderTags: (tagName, tagId, currentTagId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false

    newTag =
      slug: _.slugify tagName
      name: tagName

    #new tags
    if tagId #just an update
      Tags.update tagId, {$set:newTag}
      console.log "Changed name of tag " + tagId + " to " + tagName if Meteor.settings.public?.isDebug
    else # create a new tag
      #prevent duplicate tags by checking for existing
      existingTag = Tags.findOne "name":tagName
      #if a tag already exists with that name
      if existingTag
        if currentTagId
          Tags.update currentTagId, {$addToSet: {"relatedTagIds": existingTag._id}}
          console.log 'Added tag "' + existingTag.name + '" to the related tags list for tag ' + currentTagId if Meteor.settings.public?.isDebug
        else
          Tags.update existingTag._id, {$set:{"isTopLevel":true}}
          console.log 'Marked tag "' + existingTag.name + '" as a top level tag' if Meteor.settings.public?.isDebug
      #if a tag with that name does not exist yet
      else
        newTag.isTopLevel = !currentTagId
        newTag.shopId = ReactionCore.getShopId()
        newTag.updatedAt = new Date()
        newTag.createdAt = new Date()
        newTagId = Tags.insert newTag
        console.log 'Created tag "' + newTag.name + '"' if Meteor.settings.public?.isDebug
        if currentTagId
          Tags.update currentTagId, {$addToSet: {"relatedTagIds": newTagId}}
          console.log 'Added tag "' + newTag.name + '" to the related tags list for tag ' + currentTagId if Meteor.settings.public?.isDebug
    return;

  removeHeaderTag: (tagId, currentTagId) ->
    unless Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false

    if currentTagId
      Tags.update(currentTagId, {$pull: {"relatedTagIds": tagId}})
    # if not in use delete from system
    productCount = Products.find({"hashtags":{$in:[tagId]}}).count()
    relatedTagsCount = Tags.find({"relatedTagIds":{$in:[tagId]}}).count()

    if (productCount is 0) and (relatedTagsCount is 0)
      return Tags.remove(tagId)


  ## possible dead method, commenting out pending further review

  # updatePackage: (updateDoc, packageName) ->
  #   packageId = Packages.findOne({ name: packageName })._id

  #   return false unless packageId

  #   try
  #     result = Packages.update {_id: packageId}, updateDoc
  #   catch
  #     result = false
  #   return !!result # returns true if updated, false if package doesn't exist or error