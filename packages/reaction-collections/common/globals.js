if (!ReactionCore.Schemas) ReactionCore.Schemas = {};
if (!ReactionCore.Collections) ReactionCore.Collections = {};
if (!ReactionCore.Helpers) ReactionCore.Helpers = {};
if (!ReactionCore.MetaData) ReactionCore.MetaData = {};
if (!ReactionCore.Locale) ReactionCore.Locale = {};
if (!ReactionCore.Log) ReactionCore.Log = {}; // Move logger create here


//
// Subscription Manager
// See: https://github.com/kadirahq/subs-manager
//
// ReactionCore.Subscriptions = new SubsManager();
ReactionSubscriptions = new SubsManager();
