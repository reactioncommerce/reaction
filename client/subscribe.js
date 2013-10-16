Meteor.subscribe("reaction_modules");
Meteor.subscribe("reaction_config");

// Deps.autorun(function () {
//   if(!Meteor.loggingIn() && Meteor.user()) {
//     Router.go('dashboard');
//   }
// });