/*
 *  AnalyticsEvents Collection
 *  Store the Analytics Events in a Collection
 */


ReactionCore.Schemas.AnalyticsEvents = new SimpleSchema({
  eventType: {
    type: String
  },
  category: {
    type: String,
    optional: true
  },
  action: {
    type: String,
    optional: true
  },
  label: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  },
  user: {
    type: Object,
    optional: true
  },
  'user.id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  'user.role': {
    type: String,
    optional: true
  },
  shopId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function() {
      return ReactionCore.getShopId();
    }
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      return new Date
    }
  },
  // Any additional data
  data: {
    type: Object,
    blackbox: true,
    optional: true
  }
})

ReactionCore.Collections.AnalyticsEvents = new Mongo.Collection('AnalyticsEvents');

ReactionCore.Collections.AnalyticsEvents.attachSchema(ReactionCore.Schemas.AnalyticsEvents);


/*
 *   Analytics
 *   api_key: "UA-XXXXX-X" (this is your tracking ID)
 */

ReactionCore.Schemas.ReactionAnalyticsPackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig, {
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
