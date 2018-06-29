import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Shipping, Packages, Shops } from "/lib/collections";
import { Reaction } from "/server/api";
import { shippingRoles } from "../lib/roles";

/**
 *
 * @namespace Shipping/Methods
 */

export const methods = {
  /**
   * @name shipping/status/refresh
   * @method
   * @memberof Shipping/Methods
   * @todo This is a stub for future core processing
   * @summary Blank method. Serves as a place for Method Hooks,
   * in other shipping packages, like Shippo
   * @param  {String} orderId order ID
   * @return {String}         order ID
   */
  "shipping/status/refresh"(orderId) {
    check(orderId, String);
    // this is a stub for future core processing
    // it also serves as a place for Method Hooks
    // in other shipping packages, like Shippo
    return orderId;
  },

  /**
   * @name shipping/provider/toggle
   * @method
   * @memberof Shipping/Methods
   * @example Meteor.call("shipping/provider/toggle", packageId, settingsKey)
   * @summary Toggle enabled provider
   * @param { String } packageId packageId
   * @param { String } provider provider name
   * @return { Number } update result
   */
  "shipping/provider/toggle"(packageId, provider) {
    check(packageId, String);
    check(provider, String);
    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const pkg = Packages.findOne(packageId);
    if (pkg && pkg.settings[provider]) {
      const current = Shipping.findOne({ "provider.name": provider });
      const { enabled } = pkg.settings[provider];
      // const enabled = !current.provider.enabled;
      if (current && current.provider) {
        return Shipping.update({
          "_id": current._id,
          "provider.name": provider
        }, {
          $set: {
            "provider.enabled": enabled
          }
        }, {
          multi: true
        });
      }
    }
  },

  /**
   * @method shipping/updateParcelSize
   * @summary update defaultParcelSize
   * @param {Object} parcel - size to be updated
   * @since 1.1.12
  */
  "shipping/updateParcelSize"(parcel) {
    check(parcel, {
      weight: Match.Optional(Number),
      height: Match.Optional(Number),
      length: Match.Optional(Number),
      width: Match.Optional(Number)
    });

    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const modifier = Object.keys(parcel).reduce((mod, key) => {
      mod[`defaultParcelSize.${key}`] = parcel[key];
      return mod;
    }, {});

    return Shops.update({
      _id: Reaction.getShopId()
    }, {
      $set: modifier
    }, (error) => {
      if (error) {
        throw new Meteor.Error("server-error", error.message);
      }
    });
  }
};

Meteor.methods(methods);
