// Either a user clears the error, or when we switch to different campaign we'll clear them
Template.campaignEdit.destroyed = function () {
    clearErrors();
};

// Find the current campaign id
Template.campaignEdit.helpers({
    campaign: function () {
        return Campaigns.findOne(Session.get('currentCampaignId'));
    }
});

Template.campaignEdit.events({
    'submit form': function (e) {
        e.preventDefault();

        var currentCampaignId = Session.get('currentCampaignId');

        var campaignProperties = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val()
        };

        Campaigns.update(currentCampaignId, {$set: campaignProperties}, function (error) {
            if (error) {
                // display the error to the user
                throwError(error.reason);
            } else {
                $('#campaignEdit').modal('hide');
            }
        });
    },

    'click .delete': function (e) {
        e.preventDefault();

        if (confirm("Delete this campaign?")) {
            var currentCampaignId = Session.get('currentCampaignId');
            Campaigns.remove(currentCampaignId);
            Meteor.Router.to('campaignsList');
        }
    }
});
