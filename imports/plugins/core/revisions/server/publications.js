import { Products, Revisions } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * products publication
 * @param {Number} productScrollLimit - optional, defaults to 24
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("ProductRevisions", function (productIds) {
  check(productIds, Array);

  // Authorized content curators fo the shop get special publication of the product
  // all all relevant revisions all is one package
  if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"], shop._id)) {
    return Revisions.find({
      _id: {
        $in: productIds
      }
    });
  }

  return this.ready();
});
