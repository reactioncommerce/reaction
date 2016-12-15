import { Packages, Shops } from "/lib/collections";
import { ShippoPackageConfig } from "../../lib/collections/schemas";
import { ShippoApi } from "./shippoapi";

Meteor.methods({
  "shippo/updateApiKey"(modifier, _id) {
    // Important server-side check for security and data integrity
    check(modifier, ShippoPackageConfig);
    check(_id, String);

    // If user wants to delete existing key
    if (modifier.hasOwnProperty("$unset")) {
      const customModifier = { $set: { "settings.apiKey": null } };
      Packages.update(_id, customModifier);
      return { type: "delete" };
    }

    const apiKey = modifier.$set["settings.apiKey"];

    // Tries to use the apiKey . if not possible throws a relative Meteor Error
    ShippoApi.methods.confirmValidApiKey.call({ apiKey });
    Packages.update(_id, modifier);
    return { type: "update" };
  },
  "shippo/getCarrierRates"(cart) {
    const addressFrom = cart && cart.billing && cart.billing[0] && cart.billing[0].address;
    const addressTo = Shops.findOne({_id : cart.shopId}, {fields: {'addressBook':1}})[0];
    const item = cart.items[0];

  }
});
