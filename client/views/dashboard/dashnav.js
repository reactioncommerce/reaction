// Provide full list of projects to the project dropdown
Template.dashnav.helpers({
  projectList: function() {
    return Projects.find();
  }
});

// // Set project selector dropdown value on click
// Template.dashnav.events({
//   'click .dropdown-menu li a': function(e){
//     var clickedButton = e.currentTarget;
//     //var newHeading =  $(clickedButton).text();
//     //Session.set("currentProject", newHeading);
//   }

// });