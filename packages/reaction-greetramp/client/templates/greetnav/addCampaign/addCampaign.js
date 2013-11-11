// Control add campaign modal submission
Template.addCampaign.events({
    'submit form': function (event) {
        event.preventDefault();
        var campaign = {
            url: $(event.target).find('[name=url]').val(),
            title: $(event.target).find('[name=title]').val()
        };
        Meteor.call('campaign', campaign, function (error, id) {
            if (error) {
                // display the error to the user
                throwError(error.reason);
                // if the error is that the campaign already exists, take us there
                if (error.error === 302)
                    console.log("error saving campaign");
            } else {
                $('#createCampaign').modal('hide');
            }
        });
    }
});
