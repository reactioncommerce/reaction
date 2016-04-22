Meteor.methods({
  /*
   * add new shipping methods
   */
  addShippingMethod: function (insertDoc, currentDoc) {
    check(insertDoc, Object);
    check(currentDoc, String);
    if (!ReactionCore.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return ReactionCore.Collections.Shipping.update({
      _id: currentDoc
    }, {
      $addToSet: {
        methods: insertDoc
      }
    });
  },

  /**
   * updateShippingMethods
   * @summary update Shipping methods for a provider
   * @param {String} providerId
   * @param {String} methodId
   * @param {Object} updateMethod - updated method itself
   * @return update result
   */
  updateShippingMethods: function (providerId, methodId, updateMethod) {
    check(providerId, String);
    check(methodId, String);
    check(updateMethod, Object);
    if (!ReactionCore.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return ReactionCore.Collections.Shipping.update({
      "_id": providerId,
      "methods._id": methodId
    }, {
      $set: {
        "methods.$": updateMethod
      }
    });
  },

  /*
   * remove shipping method
   */
  removeShippingMethod: function (providerId, removeDoc) {
    check(providerId, String);
    check(removeDoc, Object);
    if (!ReactionCore.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
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
  addShippingProvider: function (doc) {
    check(doc, Object);
    if (!ReactionCore.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return ReactionCore.Collections.Shipping.insert(doc);
  },

  /*
   * update shipping provider
   */
  updateShippingProvider: function (updateDoc, currentDoc) {
    check(updateDoc, Object);
    check(currentDoc, String);
    if (!ReactionCore.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return ReactionCore.Collections.Shipping.update({
      '_id': currentDoc
    }, updateDoc);
  }
});
