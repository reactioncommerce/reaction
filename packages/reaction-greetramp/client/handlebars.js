Handlebars.registerHelper('currentCampaignTitle', function (current) {
  var currentCampaignId = Session.get("currentCampaignId");
  switch (currentCampaignId) {
    case 'all':
      return "All Campaigns";
    case 'overview':
      return "Overview";
    default:
      if (!currentCampaignId) {
        return "Overview";
      }
      return Campaigns.findOne(currentCampaignId).title;
  }
});
