import ReactionError from "@reactioncommerce/reaction-error";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Catalog } from "/lib/api";
import { Products } from "/lib/collections";

/**
 * @file Methods for Taxes. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Taxes/Methods
*/

const methods = {
  /**
   * @name taxes/updateTaxCode
   * @method
   * @memberof Methods/Taxes
   * @summary updates the tax code on all options of a product.
   * @param  {String} products array of products to be updated.
   * @return {Number} returns number of options updated
   */
  "taxes/updateTaxCode"(products) {
    check(products, Array);

    // check permissions to create product
    // to check if user can update the product
    if (!Reaction.hasPermission("createProduct")) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // number of options that get updated.
    let updatedOptions = 0;

    products.forEach((product) => {
      let variants = [product];
      if (product.type === "simple") {
        variants = Catalog.getVariants(product._id);
      }
      variants.forEach((variant) => {
        const options = Catalog.getVariants(variant._id);
        options.forEach((option) => {
          updatedOptions += Products.update({
            _id: option._id
          }, {
            $set: {
              taxCode: variant.taxCode
            }
          }, { selector: { type: "variant" }, publish: true });
        });
      });
    });
    return updatedOptions;
  }
};

Meteor.methods(methods);
