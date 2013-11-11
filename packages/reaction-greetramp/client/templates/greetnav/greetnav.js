// Provide full list of campaigns to the campaign dropdown
Template.greetnav.helpers({
  campaignList: function () {
    return Campaigns.find();
  }
});
