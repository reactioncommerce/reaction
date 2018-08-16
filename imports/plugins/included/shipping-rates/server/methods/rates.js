import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Shipping } from "/lib/collections";
import { ShippingMethod } from "/lib/collections/schemas";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { shippingRoles } from "../lib/roles";

export const methods = {
  /**
   * shipping/rates/add
   * add new shipping flat rate methods
   * @summary insert shipping method for a flat rate provider
   * @param {Object} rate a valid ShippingMethod object
   * @param {String} providerId A shipping provider ID
   * @return {Number} insert result
   */
  "shipping/rates/add"(rate, providerId) {
    check(rate, {
      name: String,
      label: String,
      group: String,
      cost: Match.OneOf(Number, null, undefined),
      handling: Number,
      rate: Number,
      enabled: Boolean
    });

    if (!Reaction.hasPermission(shippingRoles)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    const shopId = Reaction.getShopId();
    if (!Shipping.findOne({ "provider.name": "flatRates", shopId })) {
      Shipping.insert({
        name: "Default Shipping Provider",
        shopId,
        provider: {
          name: "flatRates",
          label: "Flat Rate"
        }
      });
    }

    rate._id = Random.id();
    return Shipping.update({
      shopId,
      "provider.name": "flatRates"
    }, {
      $addToSet: {
        methods: rate
      }
    });
  },

  /**
   * shipping/rates/update
   * @summary update shipping rate methods
   * @param { Object } method shipping method object
   * @return { Number } update result
   */
  "shipping/rates/update"(method) {
    ShippingMethod.validate(method);
    if (!Reaction.hasPermission(shippingRoles)) {
      throw new ReactionError("access-denied", "Access Denied");
    }
    const methodId = method._id;

    return Shipping.update({
      "methods._id": methodId
    }, {
      $set: {
        "methods.$": method
      }
    });
  },

  /**
   * shipping/rates/delete
   * @summary delete shipping rate method
   * @param { String } rateId id of method to delete
   * @return { Number } update result
   */
  "shipping/rates/delete"(rateId) {
    check(rateId, String);

    if (!Reaction.hasPermission(shippingRoles)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    const rates = Shipping.findOne({ "methods._id": rateId });
    const { methods: shippingMethods } = rates;
    const updatedMethods = shippingMethods.filter((method) => method._id !== rateId);

    // HACK: not sure why we need to do this.. but it works.
    // Replaced a $pull which in theory is better, but was broken.
    // Issue w/ pull was introduced during the simpl-schema update
    const deleted = Shipping.update({
      "methods._id": rateId
    }, {
      $set: {
        methods: updatedMethods
      }
    });

    return deleted;
  }
};

Meteor.methods(methods);
