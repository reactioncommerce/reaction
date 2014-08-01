// exported, global/window scope
ReactionCore = {};
ReactionCore.Schemas = {};
ReactionCore.Collections = {};
ReactionCore.Helpers = {};
ReactionCore.Packages = {};

if (Meteor.isClient) {
  ReactionCore.Alerts = {};
  ReactionCore.Subscriptions = {};
}

// convenience
Alerts = ReactionCore.Alerts;
Schemas = ReactionCore.Schemas;

// for backwards-compatibility; remove these once no reaction packages depend on them
Meteor.app = ReactionCore;