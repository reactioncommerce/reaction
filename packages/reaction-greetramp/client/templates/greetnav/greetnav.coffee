# Provide full list of campaigns to the campaign dropdown
Template.greetnav.helpers campaignList: ->
  Campaigns.find()

