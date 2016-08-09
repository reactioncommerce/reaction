import * as Collections from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * accounts
 */

Meteor.publish("Revisions", function (documentId) {
  check(documentId, String);

  const product = Collections.Products.findOne({
    _id: documentId
  });

  // check(userId, Match.OneOf(String, null));
  // we could additionally make checks of useId defined, but this could lead to
  // situation when user will may not have time to get an account
  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  // global admin can get all accounts
  if (Roles.userIsInRole(this.userId, ["admin", "owner"])) {
    return Collections.Revisions.find({
      // shopId,
      documentId: product._id
    });
  }
  // regular users should get just their account
  return this.ready();
});
