import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { Layout } from "./layouts";

/**
 * @name Permissions
 * @memberof schemas
 * @summary The Permissions schema is part of the Registry. The Registry Schema allows package settings to be defined.
 * For more, read the in-depth {@link https://blog.reactioncommerce.com/an-intro-to-architecture-the-registry/ Intro to Architecture: The Registry}.
 * @type {SimpleSchema}
 * @property {String} permission
 * @property {String} label
 */
export const Permissions = new SimpleSchema({
  permission: {
    type: String
  },
  label: {
    type: String
  }
}, { check, tracker: Tracker });

registerSchema("Permissions", Permissions);

/**
 * @name Registry
 * @memberof schemas
 * @type {SimpleSchema}
 * @summary The Registry Schema allows package settings to be defined. For more, read the in-depth {@link https://blog.reactioncommerce.com/an-intro-to-architecture-the-registry/ Intro to Architecture: The Registry}.
 * @property {String[]} provides Legacy `provides` apps use a String rather than an array. These are transformed in loadPackages.
 * @property {String} route optional
 * @property {String} name optional, Registry name must be unique. Namespace your plugin (e.g. `yourorg-plugin-name`) to avoid conflicts.
 * @property {String} template optional, Assign to a Blaze template
 * @property {String} workflow optional, A layout for a template in the package
 * @property {String} layout optional, Force the app to render a specific layout
 * @property {String[]} triggersEnter optional, Trigger on Enter
 * @property {String[]} triggersExit optional, Trigger on Exit
 * @property {Object} options optional, Routing Options
 * @property {String} description optional, deprecated
 * @property {String} icon optional, A set of CSS classes, often Font Awesome classes, used to define the package in the sidebar.
 * @property {String} label optional, Human-readable name for a Registry entry
 * @property {String} container optional, Used to group plugins
 * @property {Number} priority optional, Plugin load order. Lower values loaded first.
 * @property {Boolean} enabled optional, Enable or not
 * @property {Permissions[]} permissions optional, Define a new user permission
 * @property {String[]} audience optional, Define what permissions are required to view a step in a workflow
 * @property {Object} meta optional, Set `dashboardSize` for the `actionView`
 * @property {String[]} showForShopTypes optional, Shop Types this plugin should show for
 * @property {String[]} hideForShopTypes optional, Shop Types this plugin should not show for
 */
export const Registry = new SimpleSchema({
  // TODO: This should _not_ be optional in the future, but we need to organize our packages better
  "provides": {
    // Legacy `provides` apps use a String rather than an array. These are transformed in loadPackages
    type: Array,
    index: true,
    optional: true
  },
  "provides.$": {
    type: String
  },
  "route": {
    type: String,
    optional: true,
    index: true
  },
  // TODO: This should _not_ be optional in the future, but we need to organize our packages better
  "name": {
    type: String,
    label: "Registry Name",
    index: true,
    optional: true
  },
  "template": {
    type: String,
    optional: true
  },
  "workflow": {
    type: String,
    optional: true
  },
  "layout": {
    type: String,
    optional: true
  },
  "triggersEnter": {
    type: Array,
    label: "Trigger on Entry",
    optional: true
  },
  "triggersEnter.$": {
    type: String
  },
  "triggersExit": {
    type: Array,
    label: "Trigger on Exit",
    optional: true
  },
  "triggersExit.$": {
    type: String
  },
  "options": {
    label: "Routing Options",
    type: Object,
    optional: true,
    defaultValue: {}
  },
  "description": {
    type: String,
    optional: true
  },
  "icon": {
    type: String,
    optional: true
  },
  "label": {
    type: String,
    optional: true
  },
  "container": {
    type: String,
    optional: true
  },
  "priority": {
    type: SimpleSchema.Integer,
    optional: true
  },
  "enabled": {
    type: Boolean,
    optional: true
  },
  "permissions": {
    type: Array,
    optional: true
  },
  "permissions.$": {
    type: Permissions
  },
  "audience": {
    type: Array,
    label: "Audience",
    optional: true
  },
  "audience.$": {
    type: String
  },
  "meta": {
    label: "Meta",
    type: Object,
    optional: true,
    blackbox: true
  },
  "showForShopTypes": {
    label: "Shop Types this plugin should show for",
    type: Array,
    optional: true
  },
  "showForShopTypes.$": {
    type: String
  },
  "hideForShopTypes": {
    type: Array,
    label: "Shop Types this plugin should not show for",
    optional: true
  },
  "hideForShopTypes.$": {
    type: String
  }
}, { check, tracker: Tracker });

registerSchema("Registry", Registry);

/**
 * @name PackageConfig
 * @memberof schemas
 * @type {SimpleSchema}
 * @summary The PackageConfig is part of the configuration settings required for packages in the Registry.
 * The Registry Schema allows package settings to be defined. For more, read the in-depth {@link https://blog.reactioncommerce.com/an-intro-to-architecture-the-registry/ Intro to Architecture: The Registry}.
 * @property {String} shopId Autovalue removed {@link https://github.com/reactioncommerce/reaction/issues/646#issuecomment-169351842 here}
 * @property {String} name required
 * @property {Boolean} enabled defalut value: true
 * @property {String} icon optional
 * @property {Object} settings optional
 * @property {Registry[]} registry optional
 * @property {Layout[]} layout optional
 */
export const PackageConfig = new SimpleSchema({
  "shopId": {
    type: String,
    index: 1,
    // see: https://github.com/reactioncommerce/reaction/issues/646#issuecomment-169351842
    // autoValue: shopIdAutoValue,
    label: "PackageConfig ShopId",
    optional: true
  },
  "name": {
    type: String,
    index: 1
  },
  "enabled": {
    type: Boolean,
    defaultValue: true
  },
  "icon": {
    type: String,
    optional: true
  },
  "settings": {
    type: Object,
    optional: true,
    blackbox: true,
    defaultValue: {}
  },
  "registry": {
    type: Array,
    optional: true
  },
  "registry.$": {
    type: Registry
  },
  "layout": {
    type: Array,
    optional: true
  },
  "layout.$": {
    type: Layout
  }
}, { check, tracker: Tracker });

registerSchema("PackageConfig", PackageConfig);

/**
 * @name CorePackageConfig
 * @memberof schemas
 * @type {SimpleSchema}
 * @summary The Core Package Config is part of the Registry.
 * The Registry Schema allows package settings to be defined. For more, read the in-depth {@link https://blog.reactioncommerce.com/an-intro-to-architecture-the-registry/ Intro to Architecture: The Registry}.
 * @extends {PackageConfig}
 * @property {Object} settings.mail optional, Mail settings
 * @property {String} settings.mail.user Mail user
 * @property {String} settings.mail.password Mail password
 * @property {String} settings.mail.host Mail host
 * @property {String} settings.mail.port Mail port
 * @property {String} settings.openexchangerates.appId OpenExchangeRates Id
 * @property {String} settings.openexchangerates.refreshPeriod default value: `"every 1 hour"`
 * @property {String} settings.google.clientId default value: `null`
 * @property {String} settings.google.apiKey default value: `null`
 * @property {Object} settings.public optional Settings in `public` are published to the client.
 * @property {Boolean} settings.public.allowGuestCheckout allows guest checkout
 * @property {String} settings.cart.cleanupDurationDays default value: `"older than 3 days"`
 */
export const CorePackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
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
  "settings.openexchangerates": {
    type: Object,
    optional: true
  },
  "settings.openexchangerates.appId": {
    type: String,
    label: "Open Exchange Rates App Id"
  },
  "settings.openexchangerates.refreshPeriod": {
    type: String,
    label: "Open Exchange Rates refresh period",
    defaultValue: "every 1 hour"
  },
  "settings.google": {
    type: Object,
    optional: true
  },
  "settings.google.clientId": {
    type: String,
    label: "Google Client Id"
  },
  "settings.google.apiKey": {
    type: String,
    label: "Google Api Key"
  },
  "settings.public": {
    type: Object,
    optional: true,
    defaultValue: {}
  },
  "settings.public.allowGuestCheckout": {
    type: Boolean,
    label: "Allow Guest Checkout",
    defaultValue: true
  },
  "settings.cart.cleanupDurationDays": {
    type: String,
    label: "Cleanup Schedule",
    defaultValue: "older than 3 days"
  }
});

registerSchema("CorePackageConfig", CorePackageConfig);
