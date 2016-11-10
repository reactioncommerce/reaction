import { Templates } from "/lib/collections";
import { Reaction } from "/server/api";

export const methods = {

  /**
   * templates/email/remove
   * @summary removes email template from Templates collection
   * @param {String} templateId - id of template to remove
   * @return {Number} remove template
   * TODO: change return type? is number correct?
   */
  "templates/email/remove": function (templateId) {
    check(templateId, String);
    // TODO: add permissions
    // if (!Reaction.hasPermission("shipping")) {
    //   throw new Meteor.Error(403, "Access Denied");
    // }
    return Templates.remove(templateId);
  },

  /**
   * templates/email/update
   * @summary updates email template in Templates collection
   * @param {String} templateId - id of template to remove
   * @param {Object} doc - data to update
   * @return {Number} remove template
   * TODO: change return type? is number correct?
   */
  "templates/email/update": function (templateId, doc) {
    check(templateId, String);
    check(doc, Object);
    // TODO: add permissions
    // if (!Reaction.hasPermission("shipping")) {
    //   throw new Meteor.Error(403, "Access Denied");
    // }
    return Templates.update({
      _id: templateId,
      type: "email"
    }, {
      $set: {
        title: doc.title,
        name: doc.name,
        language: doc.language,
        template: doc.template,
        subject: doc.subject
      }
    });
  }


  // TODO: Cleanup functions below

  // /**
  //  * add new shipping methods
  //  * @summary insert Shipping methods for a provider
  //  * @param {String} insertDoc shipping method
  //  * @param {String} currentDoc current providerId
  //  * @return {Number} insert result
  //  */
  // "shipping/methods/add": function (insertDoc, currentDoc) {
  //   check(insertDoc, Object);
  //   check(currentDoc, Match.Optional(String));
  //   // if no currentDoc we need to insert a default provider.
  //   const id = currentDoc || Random.id();
  //
  //   if (!Reaction.hasPermission("shipping")) {
  //     throw new Meteor.Error(403, "Access Denied");
  //   }
  //
  //   return Shipping.update({
  //     _id: id
  //   }, {
  //     $addToSet: {
  //       methods: insertDoc
  //     }
  //   });
  // },
  //
  // /**
  //  * updateShippingMethods
  //  * @summary update Shipping methods for a provider
  //  * @param {String} providerId providerId
  //  * @param {String} methodId methodId
  //  * @param {Object} updateMethod - updated method itself
  //  * @return {Number} update result
  //  */

  //
  //
  // /*
  //  * add / insert shipping provider
  //  */
  // "shipping/provider/add": function (doc) {
  //   check(doc, Object);
  //   if (!Reaction.hasPermission("shipping")) {
  //     throw new Meteor.Error(403, "Access Denied");
  //   }
  //   return Shipping.insert(doc);
  // },
  //
  // /*
  //  * update shipping provider
  //  */
  // "shipping/provider/update": function (updateDoc, currentDoc) {
  //   check(updateDoc, Object);
  //   check(currentDoc, String);
  //   if (!Reaction.hasPermission("shipping")) {
  //     throw new Meteor.Error(403, "Access Denied");
  //   }
  //   return Shipping.update({
  //     _id: currentDoc
  //   }, updateDoc);
  // },

  //
  //
  // "templates/email/duplicate": function (templateId, doc) {
  //   check(templateId, String);
  //   check(doc, Object);
  //   // if (!Reaction.hasPermission("shipping")) {
  //   //   throw new Meteor.Error(403, "Access Denied");
  //   // }
  //   // return Templates.remove(templateId);
  //   console.log("------templateId-----", templateId);
  //   console.log("------doc-----", doc);
  //   return Templates.insert({
  //     $unset: { _id: "" }
  //   }, doc);
  // },

// const variantNewId = Random.id();

}

Meteor.methods(methods);
