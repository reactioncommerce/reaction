import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Roles } from "meteor/alanning:roles";
import { getShopId } from "/lib/api";
import { PackageConfig } from "./registry";
import { shopIdAutoValue } from "./helpers";

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
    optional: true
  },
  "user.id": {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoValue: function () {
      return Meteor.userId();
    }
  },
  "user.isAnonymous": {
    type: Boolean,
    optional: true,
    autoValue: function () {
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
    autoValue: function () {
      return new Date;
    }
  },
  // Any additional data
  "data": {
    type: Object,
    blackbox: true,
    optional: true
  }
});

/*
 *   Analytics
 *   api_key: "UA-XXXXX-X" (this is your tracking ID)
 */

export const ReactionAnalyticsPackageConfig = new SimpleSchema([
  PackageConfig, {
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
  }
]);
