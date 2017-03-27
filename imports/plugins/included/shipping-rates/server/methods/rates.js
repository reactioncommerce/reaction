import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
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
  "shipping/rates/add": function (rate) {
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
      throw new Meteor.Error(403, "Access Denied");
    }
    // a little trickery
    // we passed in the providerId
    // as _id, perhaps cleanup
    let providerId;
    if (rate._id) {
      providerId = rate._id;
    } else {
      // There is no default provider, so add it
      if (!Shipping.find({}).count()) {
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
  "shipping/rates/update": function (method) {
    check(method, ShippingMethod);
    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error(403, "Access Denied");
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
  "shipping/rates/delete": function (rateId) {
    check(rateId, String);

    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Shipping.update({
      "methods._id": rateId
    }, {
      $pull: {
        methods: { _id: rateId }
      }
    });
  }
};

Meteor.methods(methods);
