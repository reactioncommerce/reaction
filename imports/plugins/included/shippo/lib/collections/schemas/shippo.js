import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";
/*
 *  Meteor.settings.stripe =
 *    mode: false  #sandbox
 *    api_key: ""
 *  see: https://stripe.com/docs/api
 */

export const ShippoPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.api_key": {
      type: String,
      label: "API Key"
    }
  }
]);
