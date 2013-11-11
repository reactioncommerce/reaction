Template["filepicker-io"].helpers({
  pickerData: function () {
    return ReactionConfig.findOne({userId: Meteor.userId(), name: "reaction-filepicker"});
  }
});

Template["filepicker-io"].events({
  'submit form': function (event) {
    event.preventDefault();
    var apikey = $(event.target).find('[name=input-apikey]').val();
    var userPackage = ReactionConfig.findOne({userId: Meteor.userId(), name: "reaction-filepicker"});
    ReactionConfig.update({_id: userPackage._id}, {$set: {metafields: {apikey: apikey}}});
    // TODO: Validate key with filepicker before adding
    // throwError("Success");

    $.gritter.add({
      // (string | mandatory) the heading of the notification
      title: 'Saved "' + apikey + '"',
      // (string | mandatory) the text inside the notification
      text: 'Filepicker.io is now configured.'
    });
    Router.go('dashboard');
  }
});
