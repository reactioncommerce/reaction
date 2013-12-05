# Either a user clears the error, or when we switch to different campaign we'll clear them
Template.campaignEdit.destroyed = ->
  clearErrors()


# Find the current campaign id
Template.campaignEdit.helpers campaign: ->
  Campaigns.findOne Session.get("currentCampaignId")

Template.campaignEdit.events
  "submit form": (e) ->
    e.preventDefault()
    currentCampaignId = Session.get("currentCampaignId")
    campaignProperties =
      url: $(e.target).find("[name=url]").val()
      title: $(e.target).find("[name=title]").val()

    Campaigns.update currentCampaignId,
      $set: campaignProperties
    , (error) ->
      if error
        
        # display the error to the user
        throwError error.reason
      else
        $("#campaignEdit").modal "hide"


  "click .delete": (e) ->
    e.preventDefault()
    if confirm("Delete this campaign?")
      currentCampaignId = Session.get("currentCampaignId")
      Campaigns.remove currentCampaignId
      Meteor.Router.to "campaignsList"

