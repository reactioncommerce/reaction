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
    doc.shopId = Meteor.app.getCurrentShop()._id;
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    if (modifier.$set && modifier.$set.shopId) {
      return false;
    }
    return true;
  },
  remove: function (userId, doc) {
    return doc.shopId == Meteor.app.getCurrentShop()._id;
  }
  //fetch: ['owner']
});
