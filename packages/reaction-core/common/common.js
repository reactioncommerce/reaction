/**
 * shopIdAutoValue
 *
 * used for schemea injection autoValue
 */

_.extend(ReactionCore, {
  shopIdAutoValue: function() {
    if (this.isSet && this.isFromTrustedCode) {
      return;
    }
    if (Meteor.isClient && this.isInsert) {
      return ReactionCore.getShopId() || "1";
    } else if (Meteor.isServer && (this.isInsert || this.isUpsert)) {
      return ReactionCore.getShopId();
    } else {
      return this.unset();
    }
  }
});
