Template.dashnav.events({
  'submit form': function(event) {
    event.preventDefault();
    var domain = {
      url: $(event.target).find('[name=url]').val(),
      title: $(event.target).find('[name=title]').val(),
    }
    Meteor.call('domain', domain, function(error, id) {
      if (error) {
        // display the error to the user
        throwError(error.reason);
        // if the error is that the domain already exists, take us there
        if (error.error === 302)
          console.log("error");
      } else {
        console.log("success");
        $('#createProject').modal('hide')
      }
    });
  }
});

// Template.dashnav.helpers({
//   domains: function() {
//     return Domains.find({}, {sort: this.sort, limit: this.handle.limit()});
//   }
// });

Template.dashnav.helpers({
  domains: function() {
    return Domains.find();
  }
});