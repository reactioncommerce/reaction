import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";


Meteor.methods({

  "marketplace/updateShopDetails": function (doc, _id) {
    check(_id, String);
    check(doc, Object);

    if (!Reaction.hasPermission("admin", this.userId, Reaction.getSellerShopId(this.userId))) {
      return;
    }

    Shops.update(_id, doc, function (error) {
      if (error) {
        throw new Meteor.Error(500, error.message);
      }
    });
  }

});

