import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";
import { Shops } from "/lib/collections";
import { shippingRoles } from "../../lib/roles";

export const methods = {
  /**
   * @method shipping/size/save
   * @summary update defaultParcelSize
   * @param {String} shopId - current shopId
   * @param {Object} size - size to be updated
   * @since 1.5.5
 */
  "shipping/size/save": function (shopId, size) {
    check(shopId, String);
    check(size, {
      weight: Number,
      height: Number,
      length: Number,
      width: Number
    });

    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // check if shopId is equal to current shopId
    if (shopId === Reaction.getShopId()) {
      return Shops.update({
        _id: shopId
      }, {
        $set: {
          "defaultParcelSize.weight": size.weight,
          "defaultParcelSize.length": size.length,
          "defaultParcelSize.width": size.width,
          "defaultParcelSize.height": size.height
        }
      }, function (error) {
        if (error) {
          throw new Meteor.Error("server-error", error.message);
        }
      });
    }
    throw new Meteor.Error("does-not-exist", "Package does not exist");
  }
};

Meteor.methods(methods);
