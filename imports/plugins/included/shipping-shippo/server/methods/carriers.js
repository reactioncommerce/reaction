import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Shipping } from "/lib/collections";
import { Reaction } from "/server/api";
import { shippingRoles } from "../lib/roles";

export const methods = {
  /**
   * shippo/carrier/update
   * @summary update Shipping methods for a provider
   * @param {String} provider provider object
   * @return {Number} update result
   */
  "shippo/carrier/update"(provider) {
    check(provider, Object); // ShippingProvider
    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const method = {};
    method.provider = provider;
    const flatten = require("flatten-obj")();
    const update = flatten(method);
    return Shipping.update({
      "provider._id": provider._id
    }, {
      $set: update
    });
  }
};

Meteor.methods(methods);
