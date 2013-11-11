// Control add broadcast modal submission
Template.addBroadcast.events({
  'submit form': function (event) {
    event.preventDefault();
    var campaignId = Session.get('currentCampaignId');
    var broadcast = {
      title: $(event.target).find('[name=title]').val(),
      url_match: $(event.target).find('[name=url_match]').val(),
      start: $(event.target).find('[name=start]').val(),
      end: $(event.target).find('[name=end]').val(),
      html: $(event.target).find('[name=html]').val()
    }
    Meteor.call('broadcast', broadcast, campaignId, function (error, id) {
      if (error) {
        // display the error to the user
        throwError(error.reason);
        // if the error is that the broadcast already exists, take us there
        if (error.error === 302) {
          console.log("error saving broadcast");
        }
      } else {
        $(".broadcast-form").hide().height('0');
      }
    });
  },
  'click #broadcastClose': function (event) {
    $(".broadcast-form").hide().height('0');
  },
  'click .close': function (event) {
    $(".broadcast-form").hide().height('0');
  }
});
