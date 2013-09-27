 Meteor.publish('domains', function() {
  return Domains.find();
});

Meteor.publish('allprojects', function(limit) {
  return Projects.find({}, {sort: {submitted: -1}, limit: limit});
});

Meteor.publish('singleProject', function(id) {
  return id && Projects.find(id);
});

 Meteor.publish('projects', function() {
  return Projects.find();
});


Meteor.publish('captures', function(id) {
  return id && Captures.find({projectId:id});
});


Meteor.publish('broadcasts', function(id) {
  return id && Projects.find(id,{broadcasts:true})
});


// Meteor.publish('projects', function() {
//   if (Roles.userIsInRole(this.userId, ['admin'])) {

//     return Projects.find();

//   } else {

//     // user not authorized. do not publish secrets
//     this.stop();
//     return;
//   }
// });


// Meteor.publish('singleProject', function(id) {
//   if (Roles.userIsInRole(this.userId, ['admin'])) {

//     return id && Projects.find(id);

//   } else {

//     // user not authorized. do not publish secrets
//     this.stop();
//     return;
//   }
// });