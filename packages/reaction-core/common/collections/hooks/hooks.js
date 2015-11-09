/**
 * ReactionCore Collection Hooks
 * transform collections based on events
 *
 * See: https://github.com/matb33/meteor-collection-hooks
 */

/*
 * refresh mail configuration on package change
 */

ReactionCore.Collections.Packages.after.update(function (userId, doc,
  fieldNames, modifier) {
  if (modifier.$set) {
    if (modifier.$set.settings) {
      if (modifier.$set.settings.mail || modifier.$set["settings.mail.user"]) {
        if (Meteor.isServer) {
          return ReactionCore.configureMailUrl();
        }
      }
    }
  }
});

//
// before product update
//
ReactionCore.Collections.Products.before.update(function (userId, product,
  fieldNames, modifier) {
  //
  // handling product positions updates
  //
  if (_.indexOf(fieldNames, "positions") !== -1) {
    if (modifier.$addToSet.positions) {
      createdAt = new Date();
      updatedAt = new Date();
      if (modifier.$addToSet.positions.$each) {
        for (position in modifier.$addToSet.positions.$each) {
          if ({}.hasOwnProperty.call(modifier.$addToSet.positions.$each,
              position)) {
            createdAt = new Date();
            updatedAt = new Date();
          }
        }
      } else {
        modifier.$addToSet.positions.updatedAt = updatedAt;
      }
    }
  }
});
