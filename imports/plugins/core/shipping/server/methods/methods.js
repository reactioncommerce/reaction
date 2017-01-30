import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Shipping } from "/lib/collections";
import { Reaction } from "/server/api";

const shippingRoles = ["admin", "owner", "shipping", "reaction-shippo"];

export const methods = {
  /**
   * shipping/provider/toggle
   * @summary toggle enabled provider
   * @param { String } provider - provider name
   * @return { Number } update - result
   */
  "shipping/provider/toggle": function (provider) {
    check(provider, String);
    if (!Reaction.hasPermission(shippingRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }
    current = Shipping.findOne({
      "provider.name": provider
    });
    if (current && current.provider) {
      const enabled = !current.provider.enabled;
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
};

Meteor.methods(methods);
