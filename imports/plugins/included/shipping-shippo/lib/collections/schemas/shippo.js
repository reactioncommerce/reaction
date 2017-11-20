import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const ShippoPackageConfig = new SimpleSchema({}, { check, tracker: Tracker })
  .extend(PackageConfig)
  .extend({
    "settings.apiKey": {
      type: String,
      label: "API Key",
      min: 10,
      optional: true
    }
  });

registerSchema("ShippoPackageConfig", ShippoPackageConfig);
