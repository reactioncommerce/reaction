import { Templates } from "/lib/collections";
import { Reaction } from "/server/api";

export const methods = {

  /**
   * templates/email/remove
   * @summary delete Template method for a email templates
   * @param {String} templateId - id of template to remove
   * @return {Number} remove template
   * TODO: change return type? is number correct? copied from above
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
   * @summary update Template methods for a email templates
   * @param {String} templateId - id of template to remove
   * @param {String} doc - data to update doc with
   * @return {Number} remove template
   * TODO: change return type? is number correct? copied from above
   */
  "templates/email/update": function (templateId, doc) {
    check(templateId, String);
    check(doc, Object);
    // TODO: add permissions
    // if (!Reaction.hasPermission("shipping")) {
    //   throw new Meteor.Error(403, "Access Denied");
    // }
    return Templates.update({
      _id: templateId
    }, {
      $set: {
        title: doc.title
      }
    });
  }
}

Meteor.methods(methods);
