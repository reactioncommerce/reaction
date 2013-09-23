// Control edit account modal submission
// Template.projectedit.events({
//   'submit form': function(event) {
//     event.preventDefault();
//     var project = {
//       url: $(event.target).find('[name=url]').val(),
//       title: $(event.target).find('[name=title]').val(),
//     }
//     Meteor.call('project', project, function(error, id) {
//       if (error) {
//         // display the error to the user
//         throwError(error.reason);
//         // if the error is that the project already exists, take us there
//         if (error.error === 302)
//           console.log("error");
//       } else {
//         $('#accountedit').modal('hide')
//       }
//     });
//   }
// });


Template.projectEdit.helpers({
  project: function() {
    return Projects.findOne(Session.get('currentProjectId'));
  }
});

Template.projectEdit.events({
  'submit form': function(e) {
    e.preventDefault();
console.log("here");
    var currentProjectId = Session.get('currentProjectId');
console.log(currentProjectId);
    var projectProperties = {
      url: $(e.target).find('[name=url]').val(),
      title: $(e.target).find('[name=title]').val()
    }

    Projects.update(currentProjectId, {$set: projectProperties}, function(error) {
      if (error) {
        // display the error to the user
        alert(error.reason);
      } else {
        $('#projectedit').modal('hide')
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