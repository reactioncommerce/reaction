# Capture Data
#
#
#
Captures = new Meteor.Collection("Captures")
Counts = new Meteor.Collection("Counts")
CountStats = new Meteor.Collection("CountStats")

# check that the userId specified owns the documents
ownsDocument = (userId, doc) ->
  doc and doc.userId is userId


# Campaigns
#
#
#
Campaigns = new Meteor.Collection("Campaigns")
Campaigns.allow
  update: ownsDocument
  remove: ownsDocument

Campaigns.deny update: (userId, campaign, fieldNames) ->
  
  # may only edit the following two fields:
  _.without(fieldNames, "url", "title").length > 0

Meteor.methods
  campaign: (campaignAttributes) ->
    user = Meteor.user()
    campaignWithSameLink = Campaigns.findOne(url: campaignAttributes.url)
    
    # ensure the user is logged in
    throw new Meteor.Error(401, "You need to login to create campaigns")  unless user
    
    # ensure the campaign has a title
    throw new Meteor.Error(422, "Please fill in a title")  unless campaignAttributes.title
    
    # check that there are no previous campaigns with the same link
    throw new Meteor.Error(302, "This link has already been created in a campaign.", campaignWithSameLink._id)  if campaignAttributes.url and campaignWithSameLink
    
    # pick out the whitelisted keys
    campaign = _.extend(_.pick(campaignAttributes, "url", "title"),
      userId: user._id
      creator: user.username
      submitted: new Date().getTime()
    )
    Campaigns.insert campaign

  broadcast: (broadcastAttributes, campaignId) ->
    user = Meteor.user()
    
    # ensure the user is logged in
    throw new Meteor.Error(401, "You need to login to create broadcasts")  unless user
    
    # ensure the broadcast has a title
    throw new Meteor.Error(422, "Please fill in a title")  unless broadcastAttributes.title
    
    # pick out the whitelisted keys
    broadcast = _.extend(_.pick(broadcastAttributes, "broadcasts", "title", "url_match", "start", "end", "html"),
      userId: user._id
      submitted: new Date().getTime()
    )
    Campaigns.update
      _id: campaignId
    ,
      $push:
        broadcasts: broadcast


