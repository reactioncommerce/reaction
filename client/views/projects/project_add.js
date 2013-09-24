// Control add project modal submission
Template.addProject.events({
  'submit form': function(event) {
    event.preventDefault();
    var project = {
      url: $(event.target).find('[name=url]').val(),
      title: $(event.target).find('[name=title]').val(),
    }
    Meteor.call('project', project, function(error, id) {
      if (error) {
        // display the error to the user
        throwError(error.reason);
        // if the error is that the project already exists, take us there
        if (error.error === 302)
          console.log("error saving project");
      } else {
        $('#createProject').modal('hide');
      }
    });
  }
});
