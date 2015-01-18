// exported, global/window scope
ReactionCore = {};
ReactionCore.Schemas = {};
ReactionCore.Collections = {};
ReactionCore.Helpers = {};
ReactionCore.Packages = {};
ReactionCore.MetaData = {};
ReactionCore.Locale = {};
ReactionCore.Events = {};

if (Meteor.isClient) {
  ReactionCore.Alerts = {};
  ReactionCore.Subscriptions = {};
}

// convenience
Alerts = ReactionCore.Alerts;
Schemas = ReactionCore.Schemas;
