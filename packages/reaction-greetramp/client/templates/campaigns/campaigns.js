Template.campaigns.events({
  'click #broadcastOpen': function (event) {
    $(".broadcast-form").show().height('475');
  }
});

// Observes captures and updates when added/removed/etc
Template.campaigns.helpers({
  captureCount: function () {
    var currentCampaignId = Session.get("currentCampaignId");
    var cnt = Counts.findOne({campaignId: currentCampaignId}).count;
    return cnt;
  }
});
