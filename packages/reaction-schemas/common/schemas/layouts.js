/**
 * @summary Layout Schema
 * package workflow schema for defining workflow patterns
 * defaults are set in Shops.defaultWorkflows
 */

ReactionCore.Schemas.Layout = new SimpleSchema({
  template: {
    type: String,
    optional: true,
    index: true
  },
  label: {
    type: String,
    optional: true
  },
  workflow: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    optional: true
  },
  container: {
    type: String,
    optional: true
  },
  audience: {
    type: [String],
    optional: true
  },
  priority: {
    type: String,
    optional: true,
    defaultValue: 1
  },
  position: {
    type: String,
    optional: true,
    defaultValue: 1
  }
});
