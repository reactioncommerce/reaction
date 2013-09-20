Meteor.publish('domains', function() {
  return Domains.find();
});
