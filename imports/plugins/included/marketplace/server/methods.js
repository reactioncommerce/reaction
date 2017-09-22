import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";

Meteor.methods({
  "marketplace/updateShopDetails": function (doc, _id) {
    check(_id, String);
    check(doc, Object);

    const currentShopId = Reaction.getShopId();
    // in case the method is called though console and another's shop id is passed
    if (_id !== currentShopId) {
      throw new Meteor.Error(403, "Access Denied");
    }

    if (!Reaction.hasPermission("admin", this.userId, _id)) {
      return;
    }

    Shops.update(_id, doc, function (error) {
      if (error) {
        throw new Meteor.Error(500, error.message);
      }
    });
  }
});
