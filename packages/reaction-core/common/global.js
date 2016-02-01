// exported, global/window scope

if (!ReactionCore) ReactionCore = {};
if (!ReactionCore.Schemas) ReactionCore.Schemas = {};
if (!ReactionCore.PropTypes) ReactionCore.PropTypes = {};
if (!ReactionCore.Collections) ReactionCore.Collections = {};
if (!ReactionCore.PropTypes) ReactionCore.PropTypes = {}; // PropTypes for React
if (!ReactionCore.Helpers) ReactionCore.Helpers = {};
if (!ReactionCore.MetaData) ReactionCore.MetaData = {};
if (!ReactionCore.Locale) ReactionCore.Locale = {};

if (!ReactionCore.Log) ReactionCore.Log = {}; // Move logger create here

if (Meteor.isClient) {
  ReactionCore.Alerts = {};
  ReactionCore.Subscriptions = {};
}

// convenience
Alerts = ReactionCore.Alerts;
Schemas = ReactionCore.Schemas;
Jobs = ReactionCore.Collections.Jobs;

// not exported to client (private)
ReactionRegistry = {};
ReactionRegistry.Packages = {};
