Meteor.publish "allcampaigns", (limit) ->
  shop = Shops.findOne(domains: Meteor.app.getDomain(this))
  if shop
    Campaigns.find
      shopId: shop._id
    ,
      sort:
        submitted: -1

      limit: limit


Meteor.publish "singleCampaign", (id) ->
  id and Campaigns.find(id)

Meteor.publish "campaigns", ->
  shop = Shops.findOne(domains: Meteor.app.getDomain(this))
  Campaigns.find shopId: shop._id  if shop

Meteor.publish "captures", (id) ->
  id and Captures.find(campaignId: id)

Meteor.publish "broadcasts", (id) ->
  id and Campaigns.find(id,
    broadcasts: true
  )

Meteor.publish "countstats", (campaignId) ->
  
  #console.log("Capture observer adding countstats");
  
  #console.log("Capture observer changed countstats");
  
  # initializing = false;
  
  # // and signal that the initial document set is now available on the client
  # //
  # self.added("countstats", uuid, {campaignId: campaignId, submitted: submitted, count: count});
  # self.ready();
  # // turn off observe when client unsubs
  # self.onStop(function () {
  #   statsObserver.stop();
  # });
  #
  
  #TODO have the graphs give us an array of campaigns and return all at once, then observe
  updateSlug = (campaignId) ->
    curdoc = Captures.findOne(campaignId)
    myDate = curdoc.submitted
    captureDate = new Date(myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate())
    console.log "Capture observer updating countstats"
    CountStats.update
      campaignId: curdoc.campaignId
      submitted: captureDate
    ,
      $inc:
        count: 1
    ,
      upsert: true

  self = this
  uuid = Meteor.uuid()
  initializing = true
  statsObserver = Captures.find(campaignId: campaignId).observeChanges(
    added: (id, fields) ->
      updateSlug id  unless initializing

    changed: (id, fields) ->
      updateSlug id
  )
  return CountStats.find({},
    sort:
      submitted: 1
  )


# server: publish the current size of a collection
#  TODO: limit to current users campaigns
Meteor.publish "captures-by-campaign", (campaignId) ->
  self = this
  uuid = Meteor.uuid()
  count = 0
  initializing = true
  handle = Captures.find(campaignId: campaignId).observeChanges(
    added: (doc, idx) ->
      count++
      unless initializing
        self.changed "counts", uuid,
          count: count


    removed: (doc, idx) ->
      count--
      self.changed "counts", uuid,
        count: count

  )
  
  #CountStats.update({campaignId:campaignId},{ $set: {"count":count}}, {upsert: true});
  
  # don't care about moved or changed
  initializing = false
  
  # publish the initial count.  observeChanges guaranteed not to return
  # until the initial set of `added` callbacks have run, so the `count`
  # variable is up to date.
  self.added "counts", uuid,
    campaignId: campaignId
    count: count

  
  # and signal that the initial document set is now available on the client
  self.ready()
  
  # turn off observe when client unsubs
  self.onStop ->
    handle.stop()


