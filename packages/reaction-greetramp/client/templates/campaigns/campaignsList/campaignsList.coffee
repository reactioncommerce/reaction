
#Template.campaignsList.helpers({
#    campaigns: function () {
#        return Campaigns.find({}, {sort: {submitted: -1}, limit: 10});
#    },
#    campaignReady: function () {
#        return !campaignHandle.loading();
#    },
#    allCampaignsLoaded: function () {
#        return !campaignHandle.loading() && Campaigns.find().count() < campaignHandle.loaded();
#    }
#});
