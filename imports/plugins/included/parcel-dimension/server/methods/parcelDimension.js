import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Reaction } from "/server/api";
import { Packages, Shipping } from "/lib/collections";
import { ShippingParcel } from "/lib/collections/schemas";
import { shippingRoles } from "../lib/roles";

export const methods = {
  /**
   * shipping/dimension/add
   * add new parcel dimension method
   * @summary insert parcel dimension: weight, height, length, and width
   * @param { Object } dimension a valid dimension object
   */
  "shipping/dimension/add": function (dimension) {
    check(dimension, {
      _id: String,
      weight: Number,
      height: Number,
      length: Number,
      width: Number
    });
    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }
    const parcel = Packages.findOne({
      name: "reaction-shipping-parcel-size",
      shopId: Reaction.getShopId()
    });
    console.log("primary shopId: ", Reaction.getPrimaryShopId());
    console.log("reaction-shipping-parcel-size: ", parcel);
  },

  /**
   * shipping/dimension/update
   * @summary update parcel dimension
   * @param { Object } dimension a valid dimension object
   */
  "shipping/dimension/update": function (dimension) {
    check(dimension);
  }
};

Meteor.methods(methods);
