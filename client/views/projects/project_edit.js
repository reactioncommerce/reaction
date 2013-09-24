// Either a user clears the error, or when we switch to different project we'll clear them
Template.projectEdit.destroyed = function ( ) {
    clearErrors();
}

// Find the current project id
Template.projectEdit.helpers({
  project: function() {
    return Projects.findOne(Session.get('currentProjectId'));
  }
});

Template.projectEdit.events({
  'submit form': function(e) {
    e.preventDefault();

    var currentProjectId = Session.get('currentProjectId');

    var projectProperties = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    }

    Projects.update(currentProjectId, {$set: projectProperties}, function(error) {
      if (error) {
        // display the error to the user
        throwError(error.reason);
      } else {
        $('#projectEdit').modal('hide');
      }
    });
  },

  'click .delete': function(e) {
    e.preventDefault();

    if (confirm("Delete this project?")) {
      var currentProjectId = Session.get('currentProjectId');
      Projects.remove(currentProjectId);
      Meteor.Router.to('projectsList');
    }
  }
});