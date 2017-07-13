import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Revisions } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * accounts
 */

Meteor.publish("Revisions", function (documentIds) {
  check(documentIds, Match.OneOf(String, Array));

  // we could additionally make checks of useId defined, but this could lead to
  // situation when user will may not have time to get an account
  if (this.userId === null) {
    return this.ready();
  }
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }

  if (Roles.userIsInRole(this.userId, ["admin", "owner"])) {
    if (Array.isArray(documentIds)) {
      return Revisions.find({
        // shopId,
        documentId: {
          $in: documentIds
        }
      });
    }

    // global admin can get all accounts
    return Revisions.find({
      // shopId,
      documentId: documentIds
    });
  }
  // regular users should get just their account
  return this.ready();
});
