Match.OptionalOrNull = function(pattern) {
  return Match.OneOf(void 0, null, pattern);
};

Meteor.methods({

  /*
   * add new shipping methods
   */
  addShippingMethod: function(insertDoc, currentDoc) {
    check(insertDoc, Object);
    check(currentDoc, String);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin', 'shipping'])) {
      return false;
    }
    return ReactionCore.Collections.Shipping.update({
      '_id': currentDoc
    }, {
      $addToSet: {
        'methods': insertDoc
      }
    });
  },

  /*
   * Update Shipping methods for a provider
   */
  updateShippingMethods: function(docId, currentDoc, updateDoc) {
    check(docId, String);
    check(currentDoc, Object);
    check(updateDoc, Object);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin', 'shipping'])) {
      return false;
    }
    updateDoc = ReactionCore.Collections.Shipping.update({
      '_id': docId,
      'methods': currentDoc
    }, {
      $set: {
        'methods.$': updateDoc
      }
    });
    return updateDoc;
  },

  /*
   * remove shipping method
   */
  removeShippingMethod: function(providerId, removeDoc) {
    check(providerId, String);
    check(removeDoc, Object);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin', 'shipping'])) {
      return false;
    }
    return ReactionCore.Collections.Shipping.update({
      '_id': providerId,
      'methods': removeDoc
    }, {
      $pull: {
        'methods': removeDoc
      }
    });
  },

  /*
   * add / insert shipping provider
   */
  addShippingProvider: function(doc) {
    check(doc, Object);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin', 'shipping'])) {
      return false;
    }
    return ReactionCore.Collections.Shipping.insert(doc);
  },

  /*
   * update shipping provider
   */
  updateShippingProvider: function(updateDoc, currentDoc) {
    check(updateDoc, Object);
    check(currentDoc, String);
    if (!Roles.userIsInRole(Meteor.userId(), ['admin', 'shipping'])) {
      return false;
    }
    return ReactionCore.Collections.Shipping.update({
      '_id': currentDoc
    }, updateDoc);
  }
});
