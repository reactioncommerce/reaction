import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Random } from "meteor/random";
import { Shipping } from "/lib/collections";
import { ShippingMethod } from "/lib/collections/schemas";
import { Reaction } from "/server/api";
import { shippingRoles } from "../lib/roles";

export const methods = {
  /**
   * shipping/rates/add
   * add new shipping flat rate methods
   * @summary insert shipping method for a flat rate provider
   * @param { Object } rate a valid ShippingMethod object
   * @return { Number } insert result
   */
  "shipping/rates/add"(rate) {
    check(rate, {
      _id: Match.Optional(String),
      name: String,
      label: String,
      group: String,
      cost: Match.Optional(Number),
      handling: Match.Optional(Number),
      rate: Number,
      enabled: Boolean
    });
    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    // a little trickery
    // we passed in the providerId
    // as _id, perhaps cleanup
    let providerId;
    if (rate._id) {
      providerId = rate._id;
    } else if (!Shipping.find({}).count()) { // There is no default provider, so add it
      const defaultProvider = Shipping.insert({
        name: "Default Shipping Provider",
        provider: {
          name: "flatRates",
          label: "Flat Rate"
        }
      });
      providerId = defaultProvider;
    } else {
      throw new Meteor.Error("bad-provider-id", "No Provider ID provided when adding methods");
    }

    rate._id = Random.id();
    return Shipping.update({
      _id: providerId
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
      throw new Meteor.Error("access-denied", "Access Denied");
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
      throw new Meteor.Error("access-denied", "Access Denied");
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
