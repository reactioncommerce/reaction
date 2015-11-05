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

/**
 * On cart update
 */

ReactionCore.Collections.Cart.before.update(function (userId, cart, fieldNames, modifier) {
  // if we're adding a new product or variant to the cart
  if (modifier.$addToSet) {
    if (modifier.$addToSet.items) {
      ReactionCore.Log.info("before cart update, call inventory/addReserve");
      Meteor.call("inventory/addReserve", cart.items);
    }
  }
  // or we're adding more quuantity
  if (modifier.$inc) {
    ReactionCore.Log.info("before variant increment, call inventory/addReserve");
    Meteor.call("inventory/addReserve", cart.items);
  }
  // removing  items
  if (modifier.$pull) {
    if (modifier.$pull.items) {
      ReactionCore.Log.info("remove cart items, call inventory/clearReserve");
      Meteor.call("inventory/clearReserve", cart.items);
    }
  }

  // check if modifier is set
  if (modifier.$set) {
    // really this already exists in the schema
    // modifier.$set.updatedAt = new Date();
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

//
// after product update
//
ReactionCore.Collections.Products.after.update(function (userId, product,
  fieldNames, modifier) {
  if (modifier.$push) { // if we're adding a new product or variant
    Meteor.call("inventory/register", product);
  }

  // check if modifier is set
  if (modifier.$set) {
    modifier.$set.updatedAt = new Date();
    // triggers inventory adjustment
    Meteor.call("inventory/adjust", product);
  }

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
