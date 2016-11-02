import { Templates } from "/lib/collections";
import { Reaction } from "/server/api";

 /**
 * Templates
 * @param {string} type - Type of template to look for (i.e. 'email').
 * @param {string} isOriginalTemplate - determines if this is the original or a copy.
 * @param {string} shopId - shopId for the shop template is used with.
 * @return {Array} templates
 */

Meteor.publish("Templates", function (type, isOriginalTemplate) {
  const shopId = Reaction.getShopId();
  check(type, Match.OneOf(String, null));
  check(isOriginalTemplate, Match.OneOf(Boolean, undefined, null));

  if (!shopId) {
    return this.ready();
  }
  return Templates.find({
    shopId: shopId,
    type: type,
    // TODO: make this optional
    isOriginalTemplate: isOriginalTemplate
  });
});
