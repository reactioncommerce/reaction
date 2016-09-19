import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

export const SearchPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.products.includes.title": {
      type: Boolean,
      defaultValue: true,
      label: "Include title"
    },
    "settings.products.weights.title": {
      type: Number,
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
      type: Number,
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
      type: Number,
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
      type: Number,
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
      type: Number,
      label: "Vendor weight",
      defaultValue: 6,
      max: 10,
      min: 1
    }
  }
]);
