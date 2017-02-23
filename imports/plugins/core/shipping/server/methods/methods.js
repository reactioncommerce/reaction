import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Shipping, Packages } from "/lib/collections";
import { Reaction } from "/server/api";
import { shippingRoles } from "../lib/roles";

export const methods = {
  "shipping/status/refresh": function (orderId) {
    check(orderId, String);
    // this is a stub for future core processing
    // it also serves as a place for Method Hooks
    // in other shipping packages, like Shippo
    return orderId;
  },
  /**
   * shipping/provider/toggle
   * @summary toggle enabled provider
   * @param { String } packageId - packageId
   * @param { String } provider - provider name
   * @return { Number } update - result
   */
  "shipping/provider/toggle": function (packageId, provider) {
    check(packageId, String);
    check(provider, String);
    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }
    const pkg = Packages.findOne(packageId);
    if (pkg && pkg.settings[provider]) {
      const current = Shipping.findOne({ "provider.name": provider });
      const enabled = pkg.settings[provider].enabled;
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
  }
};

Meteor.methods(methods);
