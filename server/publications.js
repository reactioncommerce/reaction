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
