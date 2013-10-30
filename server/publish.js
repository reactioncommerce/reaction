// *****************************************************
//  User_config contains user specific configuration
//  settings, package access rights
// *****************************************************
Meteor.publish('reaction_packages',function() {
  return ReactionPackages.find({},{sort:{priority:1}});
});

// *****************************************************
// Client access rights for reaction_packages
// *****************************************************
ReactionPackages.allow({
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    //return (userId && doc.owner === userId);
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.owner === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.owner === userId;
  },
  //fetch: ['owner']
});


// *****************************************************
//  Reaction_config is replicated but to be used to share users
//  profiles in a generic way
// *****************************************************
Meteor.publish('reaction_config',function() {
  return ReactionConfig.find({userId:this.userId});
});  

// *****************************************************
// Client access rights for reaction_config
// *****************************************************
ReactionConfig.allow({
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    //return (userId && doc.owner === userId);
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return true;
    //return doc.owner === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.owner === userId;
  },
  //fetch: ['owner']
});


// *****************************************************
//  User_config contains user specific configuration
//  settings, package access rights
//  Reaction_config is replicated but to be used to share users
//  profiles in a generic way
// *****************************************************

// Meteor.publish('user_config',function(userId) {
//   return UserConfig.find({userId:userId});
// });
Meteor.publish('user_config',function(userId) {
    var self = this;
    var count = 0;
    // Monitor for changes to reaction_config (master config)
    // and update user_config whenever changes are made to that
    // reaction_config can be use to share profiles, but each user has specific
    // access to module.
    query = ReactionConfig.find({userId:this.userId, enabled:true},{fields: {packageId: true}});
    var handle = query.observe({
      added: function (newpkg) {
        var pkg = ReactionPackages.findOne({_id:newpkg.packageId});
        UserConfig.upsert({packageId:pkg._id, userId:userId}, {packageId:pkg._id, userId:userId, icon:pkg.icon, route:pkg.route, label:pkg.label, name:pkg.name, priority:pkg.priority, metafields:pkg.metafields});
      },
      updated: function (newpkg) {
        var pkg = ReactionPackages.findOne({_id:newpkg.packageId});
        UserConfig.upsert({packageId:pkg._id, userId:userId}, {packageId:pkg._id, userId:userId, icon:pkg.icon, route:pkg.route, label:pkg.label, name: pkg.name, priority:pkg.priority, metafields:pkg.metafields});
      },
      removed: function (newpkg) {
        var pkg = ReactionPackages.findOne({_id:newpkg.packageId});
        UserConfig.remove({packageId:pkg._id, userId:userId});
      }
    });
    // All users have access to type=core modules
    // but later this can be overwritten or disabled with logic
    // here.
    activePackages = ReactionPackages.find({metafields:{type:'core'}});

    activePackages.forEach(function (pkg) {
      UserConfig.upsert({packageId:pkg._id, userId:userId}, {packageId:pkg._id, userId:userId, icon:pkg.icon, route:pkg.route, label:pkg.label, name: pkg.name, priority:pkg.priority, metafields:pkg.metafields});
    });

    return UserConfig.find({userId:userId},{sort: {priority:1}});
});  

// *****************************************************
// Client access rights for user_config
// *****************************************************
UserConfig.allow({
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    //return (userId && doc.owner === userId);
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    //return doc.owner === userId;
    return true;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.owner === userId;
  }
  //fetch: ['owner']
});
