import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/reaction-collections";

export const SearchPackageConfig = new SimpleSchema({}, { check, tracker: Tracker })
  .extend(PackageConfig)
  .extend({
    "settings.products.includes.title": {
      type: Boolean,
      defaultValue: true,
      label: "Include title"
    },
    "settings.products.weights.title": {
      type: SimpleSchema.Integer,
      label: "Title weight",
      defaultValue: 10,
      max: 10,
      min: 1
    },
    "settings.products.includes.description": {
      type: Boolean,
      label: "Include description",
      defaultValue: true
    },
    "settings.products.weights.description": {
      type: SimpleSchema.Integer,
      label: "Desc. weight",
      defaultValue: 5,
      max: 10,
      min: 1
    },
    "settings.products.includes.pageTitle": {
      type: Boolean,
      label: "Include page title",
      defaultValue: false
    },
    "settings.products.weights.pageTitle": {
      type: SimpleSchema.Integer,
      label: "Page title weight",
      defaultValue: 2,
      max: 10,
      min: 1
    },
    "settings.products.includes.metafields": {
      type: Boolean,
      label: "Include details",
      defaultValue: true
    },
    "settings.products.weights.metafields": {
      type: SimpleSchema.Integer,
      label: "Details weight",
      defaultValue: 6,
      max: 10,
      min: 1
    },
    "settings.products.includes.vendor": {
      type: Boolean,
      label: "Include vendor",
      defaultValue: true
    },
    "settings.products.weights.vendor": {
      type: SimpleSchema.Integer,
      label: "Vendor weight",
      defaultValue: 6,
      max: 10,
      min: 1
    }
  });

registerSchema("SearchPackageConfig", SearchPackageConfig);
