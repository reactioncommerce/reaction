Meteor.publish('reaction_modules',function() {
  return ReactionModules.find({},{sort:{priority:1}});
});

Meteor.publish('reaction_config',function() {
  return ReactionConfig.find({user:this.userId,enabled:true});
});
