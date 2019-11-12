import SimpleSchema from "simpl-schema";

const SystemSchema = new SimpleSchema({
  originId: {
    type: String
  }
});

const ContentSchema = new SimpleSchema({
  videoURL: {
    type: String,
    optional: true
  }
});

const DictionarySchema = new SimpleSchema({
  producer: {
    type: String,
    optional: true
  },
  brakeType: {
    type: String,
    optional: true
  },
  engine: {
    type: String,
    optional: true
  },
  frameMaterial: {
    type: String,
    optional: true
  },
  suspension: {
    type: String,
    optional: true
  },
  power: {
    type: String,
    optional: true
  },
  marketplaceCategory: {
    type: String,
    optional: true
  },
  brakeDisc: {
    type: String,
    optional: true
  },
  chain: {
    type: String,
    optional: true
  },
  crankSet: {
    type: String,
    optional: true
  },
  damper: {
    type: String,
    optional: true
  },
  derailleur: {
    type: String,
    optional: true
  },
  display: {
    type: String,
    optional: true
  },
  frame: {
    type: String,
    optional: true
  },
  frontBrake: {
    type: String,
    optional: true
  },
  frontRimsSize: {
    type: String,
    optional: true
  },
  frontTire: {
    type: String,
    optional: true
  },
  frontWheel: {
    type: String,
    optional: true
  },
  gearLever: {
    type: String,
    optional: true
  },
  handlebars: {
    type: String,
    optional: true
  },
  pedals: {
    type: String,
    optional: true
  },
  rearBrake: {
    type: String,
    optional: true
  },
  rearRimsSize: {
    type: String,
    optional: true
  },
  rearTire: {
    type: String,
    optional: true
  },
  rearWheel: {
    type: String,
    optional: true
  },
  saddle: {
    type: String,
    optional: true
  },
  seatpost: {
    type: String,
    optional: true
  },
  speed: {
    type: String,
    optional: true
  },
  stem: {
    type: String,
    optional: true
  },
  brakeLever: {
    type: String,
    optional: true
  }
});

const OptionsSchema = new SimpleSchema({
  year: {
    type: String,
    optional: true
  },
  vendorId: {
    type: String,
    optional: true
  },
  vendorName: {
    type: String,
    optional: true
  },
  vendorCountry: {
    type: String,
    optional: true
  },
  weight: {
    type: String,
    optional: true
  },
  systemWeight: {
    type: String,
    optional: true
  },
  bikeSizeChart: {
    type: Array,
    optional: true
  }, 
  "bikeSizeChart.$": {
    type: Object,
    optional: true
  },
  "bikeSizeChart.$.bodyHeightFrom": {
    type: String,
    optional: true
  },
  "bikeSizeChart.$.bodyHeightTo": {
    type: String,
    optional: true
  },
  "bikeSizeChart.$.bikeSize": {
    type: String,
    optional: true
  },
  "bikeSizeChart.$.bikeSizeName": {
    type: String,
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

const TranslatableFieldsSchema = new SimpleSchema({
  gender: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  },
  metaTitle: {
    type: String,
    optional: true
  },
  metaDescription: {
    type: String,
    optional: true
  }
});

const TranslationsSchema = new SimpleSchema({
  de: {
    type: TranslatableFieldsSchema,
    optional: true
  },
  en: {
    type: TranslatableFieldsSchema,
    optional: true
  }
});

export const AttributesSchema = new SimpleSchema({
  system: {
    type: SystemSchema,
    optional: true
  },
  content: {
    type: ContentSchema,
    optional: true
  },
  dictionary: {
    type: DictionarySchema,
    optional: true
  },
  options: {
    type: OptionsSchema,
    optional: true
  },
  translations: {
    type: TranslationsSchema,
    optional: true
  }
});