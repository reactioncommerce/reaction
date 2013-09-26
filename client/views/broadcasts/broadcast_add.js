// Control add broadcast modal submission
Template.addBroadcast.events({
  'submit form': function(event) {
    event.preventDefault();
    var broadcast = {
      url: $(event.target).find('[name=url]').val(),
      title: $(event.target).find('[name=title]').val(),
    }
    Meteor.call('broadcast', broadcast, function(error, id) {
      if (error) {
        // display the error to the user
        throwError(error.reason);
        // if the error is that the broadcast already exists, take us there
        if (error.error === 302)
          console.log("error saving broadcast");
      } else {
        $('#createBroadcast').modal('hide');
      }
    });
  }
});
