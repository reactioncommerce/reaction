// *****************************************************
//  PackageConfigs contains user specific configuration
//  settings, package access rights
// *****************************************************
Meteor.publish('PackageConfigs', function () {
  return PackageConfigs.find({shopId: Meteor.app.getCurrentShop(this)._id}, {sort: {priority: 1}});
});

// *****************************************************
// Client access rights for reaction_packages
// *****************************************************
PackageConfigs.allow({
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    //return (userId && doc.owner === userId);
    doc.shopId = Meteor.app.getCurrentShop()._id;
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
//        return doc.owner === userId;
    if (modifier.$set && modifier.$set.shopId)
      return false;
    return true;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
//        return doc.owner === userId;
    return true;
  }
  //fetch: ['owner']
});
