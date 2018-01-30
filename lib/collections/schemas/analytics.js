import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Roles } from "meteor/alanning:roles";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { getShopId } from "/lib/api";
import { PackageConfig } from "./registry";
import { createdAtAutoValue, shopIdAutoValue } from "./helpers";

/**
 * @name AnalyticsEvents
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} eventType required
 * @property {String} category optional
 * @property {String} action optional
 * @property {String} label optional
 * @property {String} value optional
 * @property {Object} user optional
 * @property {String} user.id optional
 * @property {Boolean} user.isAnonymous optional
 * @property {String} shopId AnaltyicsEvents shopId
 * @property {Date} createdAt required
 * @property {Object} data Any additional data, blackbox
 */
export const AnalyticsEvents = new SimpleSchema({
  "eventType": {
    type: String
  },
  "category": {
    type: String,
    optional: true
  },
  "action": {
    type: String,
    optional: true
  },
  "label": {
    type: String,
    optional: true
  },
  "value": {
    type: String,
    optional: true
  },
  "user": {
    type: Object,
    optional: true,
    defaultValue: {}
  },
  "user.id": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoValue() {
      return Meteor.userId();
    }
  },
  "user.isAnonymous": {
    type: Boolean,
    optional: true,
    autoValue() {
      return Roles.userIsInRole(Meteor.user(), "anonymous", getShopId());
    }
  },
  "shopId": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: shopIdAutoValue,
    label: "AnalyticsEvents shopId"
  },
  "createdAt": {
    type: Date,
    autoValue: createdAtAutoValue
  },
  "data": {
    type: Object,
    blackbox: true,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("AnalyticsEvents", AnalyticsEvents);

/**
 * @name ReactionAnalyticsPackageConfig
 * @memberof schemas
 * @summary This schema extends PackageConfig with fields specific to the Analytics package.
 * @type {SimpleSchema}
 * @extends {PackageConfig}
 * @property {Boolean} settings.public.segmentio.enabled Enable Segment.io
 * @property {String} settings.public.segmentio.api_key Segment.io Write Key
 * @property {Boolean} settings.public.googleAnalytics.enabled  Enable Google Analytics
 * @property {String} settings.public.googleAnalytics.api_key Google Analytics API Key, "UA-XXXXX-X"
 * @property {Boolean} settings.public.mixpanel.enabled Enable Mixpanel
 * @property {String} settings.public.mixpanel.api_key Mixpanel API Key
 */
export const ReactionAnalyticsPackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.public.segmentio.enabled": {
    type: Boolean,
    label: "Enabled"
  },
  "settings.public.segmentio.api_key": {
    type: String,
    label: "Segment Write Key",
    optional: true
  },
  "settings.public.googleAnalytics.enabled": {
    type: Boolean,
    label: "Enabled"
  },
  "settings.public.googleAnalytics.api_key": {
    type: String,
    label: "Google Analytics Tracking ID",
    optional: true
  },
  "settings.public.mixpanel.enabled": {
    type: Boolean,
    label: "Enabled"
  },
  "settings.public.mixpanel.api_key": {
    type: String,
    label: "Mixpanel Token",
    optional: true
  }
});

registerSchema("ReactionAnalyticsPackageConfig", ReactionAnalyticsPackageConfig);
