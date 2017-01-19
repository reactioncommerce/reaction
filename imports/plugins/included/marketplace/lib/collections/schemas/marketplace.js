import { SimpleSchema } from "meteor/aldeed:simple-schema";
import * as Schemas from "/lib/collections/schemas";
import { PackageConfig } from "/lib/collections/schemas/registry";

/*
 *  Meteor.settings.marketplace =
 *    allowGuestSellers: false
 *
 *
 */
export const MarketplacePackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.public": {
      type: Object,
      optional: true
    }
  },
  {
    "settings.public.allowGuestSellers": {
      type: Boolean,
      defaultValue: false
    }
  }
]);

/**
 * Taxes Collection
 */
export const SellerShops = new Mongo.Collection("SellerShops");

SellerShops.attachSchema(Schemas.Shops);
