import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { PackageConfig } from "/lib/collections/schemas/registry";

export const SearchPackageConfig = new SimpleSchema([
  PackageConfig, {
    "settings.products.includes.title": {
      type: Boolean,
      label: "Include product title in search",
      defaultValue: true
    },
    "settings.products.weights.title": {
      type: Number,
      label: "Weight for product title matches",
      defaultValue: 10,
      max: 10,
      min: 1
    },
    "settings.products.includes.description": {
      type: Boolean,
      label: "Include product description in search",
      defaultValue: true
    },
    "settings.products.weights.description": {
      type: Number,
      label: "Weight for product description matches",
      defaultValue: 6,
      max: 10,
      min: 1
    },
    "settings.products.includes.pageTitle": {
      type: Boolean,
      label: "Include page title in search",
      defaultValue: false
    },
    "settings.products.weights.pageTitle": {
      type: Number,
      label: "Weight for page title matches",
      defaultValue: 2,
      max: 10,
      min: 1
    },
    "settings.products.includes.metafields": {
      type: Boolean,
      label: "Include metafields in search",
      defaultValue: true
    },
    "settings.products.weights.metafields": {
      type: Number,
      label: "Weight for metafields matches",
      defaultValue: 6,
      max: 10,
      min: 1
    },
    "settings.products.includes.vendor": {
      type: Boolean,
      label: "Include vendor in search",
      defaultValue: true
    },
    "settings.products.weights.vendor": {
      type: Number,
      label: "Weight for vendor matches",
      defaultValue: 6,
      max: 10,
      min: 1
    }
  }
]);

