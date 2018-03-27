import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Revisions } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * products publication
 * @param {Number} productScrollLimit - optional, defaults to 24
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("ProductRevisions", function (productIds) {
  check(productIds, Array);

  const shop = Reaction.getShopId();
  // Authorized content curators fo the shop get special publication of the product
  // all all relevant revisions all is one package
  if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"], shop._id)) {
    return Revisions.find({
      "$or": [
        {
          documentId: {
            $in: productIds
          }
        },
        {
          "documentData.ancestors": {
            $in: productIds
          }
        },
        {
          parentDocument: {
            $in: productIds
          }
        }
      ],
      "workflow.status": {
        $nin: [
          "revision/published"
        ]
      }
    });
  }

  return this.ready();
});
