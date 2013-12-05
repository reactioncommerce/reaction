Template.campaigns.events "click #broadcastOpen": (event) ->
  $(".broadcast-form").show().height "475"


# Observes captures and updates when added/removed/etc
Template.campaigns.helpers captureCount: ->
  currentCampaignId = Session.get("currentCampaignId")
  cnt = Counts.findOne(campaignId: currentCampaignId).count
  cnt

