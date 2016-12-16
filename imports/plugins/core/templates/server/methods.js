import { Templates } from "/lib/collections";

export const methods = {
  /**
   * templates/email/update
   * @summary updates email template in Templates collection
   * @param {String} templateId - id of template to remove
   * @param {Object} doc - data to update
   * @return {Number} remove template
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
        subject: doc.subject,
        enabled: doc.enabled
      }
    });
  }
};

Meteor.methods(methods);
