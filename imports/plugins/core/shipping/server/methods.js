import { Shipping } from "/lib/collections";
import { Reaction } from "/server/api";

export const methods = {
  /**
   * add new shipping methods
   * @summary insert Shipping methods for a provider
   * @param {String} insertDoc shipping method
   * @param {String} currentDoc current providerId
   * @return {Number} insert result
   */
  "shipping/methods/add": function (insertDoc, currentDoc) {
    check(insertDoc, Object);
    check(currentDoc, Match.Optional(String));
    // if no currentDoc we need to insert a default provider.
    const id = currentDoc || Random.id();

    if (!Reaction.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Shipping.update({
      _id: id
    }, {
      $addToSet: {
        methods: insertDoc
      }
    });
  },

  /**
   * updateShippingMethods
   * @summary update Shipping methods for a provider
   * @param {String} providerId providerId
   * @param {String} methodId methodId
   * @param {Object} updateMethod - updated method itself
   * @return {Number} update result
   */
  "shipping/methods/update": function (providerId, methodId, updateMethod) {
    check(providerId, String);
    check(methodId, String);
    check(updateMethod, Object);
    if (!Reaction.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Shipping.update({
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
  "shipping/methods/remove": function (providerId, removeDoc) {
    check(providerId, String);
    check(removeDoc, Object);
    if (!Reaction.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Shipping.update({
      _id: providerId,
      methods: removeDoc
    }, {
      $pull: {
        methods: removeDoc
      }
    });
  },

  /*
   * add / insert shipping provider
   */
  "shipping/provider/add": function (doc) {
    check(doc, Object);
    if (!Reaction.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return Shipping.insert(doc);
  },

  /*
   * update shipping provider
   */
  "shipping/provider/update": function (updateDoc, currentDoc) {
    check(updateDoc, Object);
    check(currentDoc, String);
    if (!Reaction.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return Shipping.update({
      _id: currentDoc
    }, updateDoc);
  },
  /*
   * remove shipping provider
   */
  "shipping/provider/remove": function (providerId) {
    check(providerId, String);
    if (!Reaction.hasPermission("shipping")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return Shipping.remove(providerId);
  }
}

Meteor.methods(methods);
