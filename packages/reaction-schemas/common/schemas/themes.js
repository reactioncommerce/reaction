/**
 * @summary Themes Schema
 * Schema for themes used in reaction-layout
 */

ReactionCore.Schemas.Themes = new SimpleSchema({
  theme: {
    type: String,
    index: true
  },

  author: {
    type: String,
    optional: true
  },

  url: {
    type: String,
    optional: true
  },

  stylesheets: {
    type: [Object],
    optional: true
  },

  "stylesheets.$.name": {
    type: String,
    unique: true
  },

  "stylesheets.$.stylesheet": {
    type: String,
    optional: true
  },
  "stylesheets.$.annotations": {
    type: [Object],
    blackbox: true,
    optional: true
  }
});
