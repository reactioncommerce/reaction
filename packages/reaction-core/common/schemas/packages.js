/**
* Permissions Schema
*/

ReactionCore.Schemas.Permissions = new SimpleSchema({
  permission: {
    type: String
  },
  label: {
    type: String
  }
});

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

/**
 * workflow schema for attaching to collection where
 * PackageWorkflow is controlling view flow
 * Shop defaultWorkflow is defined in Shop
 */

ReactionCore.Schemas.Workflow = new SimpleSchema({
  status: {
    type: String,
    defaultValue: "new"
  },
  workflow: {
    type: [String],
    optional: true
  }
});

/**
* PackageConfig Schema
*/

ReactionCore.Schemas.PackageConfig = new SimpleSchema({
  shopId: {
    type: String,
    index: 1,
    autoValue: ReactionCore.shopIdAutoValue
  },
  name: {
    type: String,
    index: 1
  },
  enabled: {
    type: Boolean,
    defaultValue: true
  },
  icon: {
    type: String,
    optional: true
  },
  settings: {
    type: Object,
    optional: true,
    blackbox: true
  },
  layout: {
    type: [ReactionCore.Schemas.Layout],
    optional: true
  },
  registry: {
    type: [Object],
    optional: true
  },
  'registry.$.provides': {
    type: String
  },
  'registry.$.route': {
    type: String,
    optional: true
  },
  'registry.$.template': {
    type: String,
    optional: true
  },
  'registry.$.description': {
    type: String,
    optional: true
  },
  'registry.$.icon': {
    type: String,
    optional: true
  },
  'registry.$.label': {
    type: String,
    optional: true
  },
  'registry.$.container': {
    type: String,
    optional: true
  },
  'registry.$.cycle': {
    type: Number,
    optional: true
  },
  'registry.$.enabled': {
    type: Boolean,
    optional: true
  },
  'registry.$.permissions': {
    type: [ReactionCore.Schemas.Permissions],
    optional: true
  }
});


/**
* CorePackageConfig Schema
* Core Reaction Settings
*/

ReactionCore.Schemas.CorePackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
    "settings.mail": {
      type: Object,
      optional: true,
      label: "Mail Settings"
    },
    "settings.mail.user": {
      type: String,
      label: "Username"
    },
    "settings.mail.password": {
      type: String,
      label: "Password"
    },
    "settings.mail.host": {
      type: String,
      label: "Host"
    },
    "settings.mail.port": {
      type: String,
      label: "Port"
    },
    "settings.openexchangerates.appId": {
      type: String,
      label: "Open Exchange Rates App Id"
    },
    "settings.public": {
      type: Object,
      optional: true
    },
    "settings.public.allowGuestCheckout": {
      type: Boolean,
      label: "Allow Guest Checkout"
    }
  }
]);
