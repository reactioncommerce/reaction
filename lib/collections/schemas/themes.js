import { SimpleSchema } from "meteor/aldeed:simple-schema";

/**
 * @summary Themes Schema
 * Schema for themes used in reaction-layout
 */

export const Themes = new SimpleSchema({
  name: {
    type: String,
    index: true
  },

  author: {
    type: String,
    optional: true
  },

  layout: {
    type: String,
    optional: true,
    defaultValue: "coreLayout"
  },

  url: {
    type: String,
    optional: true
  },

  components: {
    type: [Object],
    optional: true,
    blackbox: true
  }
});
