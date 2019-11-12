import SimpleSchema from "simpl-schema";

const SystemSchema = new SimpleSchema({
  originId: {
    type: String
  },
  priceDiscountPercentage: {
    type: String,
    defaultValue: 0
  },
  priceDiscountAbsolute: {
    type: String,
    defaultValue: 0
  },
  priceDiscountMileage: {
    type: String,
    defaultValue: 0
  }
});

const DictionarySchema = new SimpleSchema({
  condition: {
    type: String,
    optional: true
  },
  color: {
    type: String,
    optional: true
  }
});

const OptionsSchema = new SimpleSchema({
  new: {
    type: String,
    optional: true
  },
  code: {
    type: String,
    optional: true
  },
  frameHeight: {
    type: String,
    optional: true
  },
  frameNumber: {
    type: String,
    optional: true
  },
  wheelDiameter: {
    type: String,
    optional: true
  },
  mileage: {
    type: Number,
    optional: true
  },
  images: {
    type: Array,
    optional: true
  },
  "images.$": {
    type: Object,
    optional: true
  },
  "images.$.thumbnail": {
    type: String,
    optional: true
  },
  "images.$.small": {
    type: String,
    optional: true
  },
  "images.$.medium": {
    type: String,
    optional: true
  },
  "images.$.original": {
    type: String,
    optional: true
  }
});

export const AttributesSchema = new SimpleSchema({
  system: {
    type: SystemSchema,
    optional: true
  },
  dictionary: {
    type: DictionarySchema,
    optional: true
  },
  options: {
    type: OptionsSchema,
    optional: true
  }
});