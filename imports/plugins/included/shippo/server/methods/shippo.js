import { Packages } from "/lib/collections";
import { ShippoPackageConfig } from "../../lib/collections/schemas";
import { ShippoApi } from "./shippoapi";

Meteor.methods({
  "shippo/updateApiKey"(modifier, _id) {
    // Important server-side check for security and data integrity
    check(modifier, ShippoPackageConfig);
    check(_id, String);
    const apiKey = modifier.$set["settings.api_key"];

    // Tries to use the apiKey . if not possible throws a relative Meteor Error
    ShippoApi.methods.confirmValidApiKey.call({ apiKey });
    return Packages.update(_id, modifier);
  }
});
