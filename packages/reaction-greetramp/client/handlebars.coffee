Handlebars.registerHelper "currentCampaignTitle", (current) ->
  currentCampaignId = Session.get("currentCampaignId")
  switch currentCampaignId
    when "all"
      "All Campaigns"
    when "overview"
      "Overview"
    else
      return "Overview"  unless currentCampaignId
      Campaigns.findOne(currentCampaignId).title

