import { Templates } from "/lib/collections";
import { Reaction } from "/server/api";

 /**
 * Publish Templates
 * @return {Array} templates
 */

Meteor.publish("Templates", function () {
  const shopId = Reaction.getShopId();

  if (!shopId) {
    return this.ready();
  }
  return Templates.find({
    shopId: shopId
  });
});
