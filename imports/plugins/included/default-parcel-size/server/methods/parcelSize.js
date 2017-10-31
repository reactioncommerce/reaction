import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";
import { Packages } from "/lib/collections";
import { shippingRoles } from "../../lib/roles";

export const methods = {
  /**
   * shipping/dimension/add
   * add new parcel dimension method
   * @summary insert parcel dimension: weight, height, length, and width
   * @param { Object } dimension a valid dimension object
   */
  "shipping/size/save": function (size) {
    check(size, {
      _id: String,
      weight: Number,
      height: Number,
      length: Number,
      width: Number
    });

    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const pkg =  Reaction.getShopId();

    if (pkg) {
      return Packages.update(
        {
          name: "reaction-shipping-parcel-size",
          shopId: Reaction.getShopId()
        },
        {
          $set: {
            settings: {
              size: {
                weight: size.weight,
                height: size.height,
                length: size.length,
                width: size.width
              }
            }
          }
        }
      );
    }
    throw new Meteor.Error("does-not-exist", "Package does not exist");
  }
};

Meteor.methods(methods);
