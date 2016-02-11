/**
 * @summary Layout Schema
 * Layout are used by the Shops and Packages schemas.
 * They are used to defin both the template layout on the site,
 * as well as the workflow components that will be used in each
 * layout block.
 *
 *  "layout": "coreLayout",
 *  "workflow": "coreWorkflow",
 *  "theme": "default",
 *  "enabled": true,
 *  "structure": {
 *   "template": "products",
 *   "layoutHeader": "layoutHeader",
 *   "layoutFooter": "layoutFooter",
 *   "notFound": "notFound",
 *   "dashboardControls": "dashboardControls",
 *   "adminControlsFooter": "adminControlsFooter"
 */

/**
 * Permissions Schema
 */

ReactionCore.Schemas.Audience = new SimpleSchema({
  permission: {
    type: String
  },
  label: {
    type: String
  }
});

ReactionCore.Schemas.LayoutStructure = new SimpleSchema({
  template: {
    type: String,
    optional: true,
    index: true
  },
  layoutHeader: {
    type: String,
    optional: true,
    index: true
  },
  layoutFooter: {
    type: String,
    optional: true,
    index: true
  },
  notFound: {
    type: String,
    optional: true,
    index: true
  },
  dashboardHeader: {
    type: String,
    optional: true,
    index: true
  },
  dashboardControls: {
    type: String,
    optional: true,
    index: true
  },
  dashboardHeaderControls: {
    type: String,
    optional: true,
    index: true
  },
  adminControlsFooter: {
    type: String,
    optional: true,
    index: true
  }
});

ReactionCore.Schemas.Layout = new SimpleSchema({
  layout: {
    type: String,
    optional: true,
    index: true
  },
  workflow: {
    type: String,
    optional: true
  },
  collection: {
    type: String,
    optional: true
  },
  theme: {
    type: String,
    optional: true
  },
  enabled: {
    type: Boolean,
    defaultValue: true
  },
  status: {
    type: String,
    optional: true
  },
  label: {
    type: String,
    optional: true
  },
  audience: {
    type: [ReactionCore.Schemas.Audience],
    optional: true
  },
  structure: {
    type: ReactionCore.Schemas.LayoutStructure,
    optional: true
  },
  priority: {
    type: Number,
    optional: true,
    defaultValue: 1
  },
  position: {
    type: Number,
    optional: true,
    defaultValue: 1
  }
});
