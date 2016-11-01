import { Templates } from "/lib/collections";
import { Reaction } from "/server/api";

export const methods = {

  /*
   * remove template
   */
  "templates/remove": function (templateId) {
    check(templateId, String);
    // TODO: add permissions here - do we have template permissions?
    // if (!Reaction.hasPermission("shipping")) {
    //   throw new Meteor.Error(403, "Access Denied");
    // }
    return Templates.remove(templateId);
  }




}

Meteor.methods(methods);
