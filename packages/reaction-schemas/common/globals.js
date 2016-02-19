//
// exported, global/window scope
//
if (!ReactionCore) ReactionCore = {};

// extend ReactionCore and add common methods
//
_.extend(ReactionCore, {
  /**
   * ReactionCore.shopIdAutoValue
   * @summary used for schema injection autoValue
   * @example autoValue: ReactionCore.shopIdAutoValue
   * @return {String} returns current shopId
   */
  shopIdAutoValue: function () {
    // we should always have a shopId
    if (ReactionCore.getShopId()) {
      if (this.isSet && Meteor.isServer) {
        return this.value;
      } else if (Meteor.isServer && !this.isUpdate ||
        Meteor.isClient && this.isInsert) {
        return ReactionCore.getShopId();
      }
      return this.unset();
    }
  },
  /**
   * ReactionCore.schemaIdAutoValue
   * @summary used for schemea injection autoValue
   * @example autoValue: ReactionCore.schemaIdAutoValue
   * @return {String} returns randomId
   */
  schemaIdAutoValue: function () {
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer && this.operator !== "$pull" ||
      Meteor.isClient && this.isInsert) {
      return Random.id();
    }
    return this.unset();
  }
});

if (!ReactionCore.Schemas) ReactionCore.Schemas = {};
if (!ReactionCore.PropTypes) ReactionCore.PropTypes = {};
if (!ReactionCore.Collections) ReactionCore.Collections = {};
if (!ReactionCore.Helpers) ReactionCore.Helpers = {};
if (!ReactionCore.MetaData) ReactionCore.MetaData = {};
if (!ReactionCore.Locale) ReactionCore.Locale = {};
if (!ReactionCore.Log) ReactionCore.Log = {}; // Move logger create here
