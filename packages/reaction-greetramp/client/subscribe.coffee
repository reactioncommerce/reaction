# *****  Subscriptions *******
#Meteor.subscribe('domains');
campaignHandle = Meteor.subscribe("campaigns")
Meteor.subscribe "captures"

#Meteor.subscribe('countstats');

#Counts = new Meteor.Collection('counts');
Deps.autorun ->
  Meteor.subscribe "captures-by-campaign", Session.get("currentCampaignId")
  Meteor.subscribe "countstats", Session.get("statsCampaignId")

