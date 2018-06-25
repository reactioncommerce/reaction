import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Shipping, Packages } from "/lib/collections";
import Reaction from "/server/api/core";
import { shippingRoles } from "../lib/roles";

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
export default function providerToggle(packageId, provider) {
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
}
