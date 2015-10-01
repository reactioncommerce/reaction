/**
 * shopIdAutoValue
 *
 * used for schemea injection autoValue
 */

_.extend(ReactionCore, {
  shopIdAutoValue: function () {
    // we should always have a shopId
    if (ReactionCore.getShopId()) {
      if (this.isSet && this.isFromTrustedCode) {
        return ReactionCore.getShopId();
      }
      if (Meteor.isClient && this.isInsert) {
        return ReactionCore.getShopId();
      } else if (Meteor.isServer && (this.isInsert || this.isUpsert)) {
        return ReactionCore.getShopId();
      }
      return this.unset();
    }
  }
});
