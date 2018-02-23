import { Template } from "meteor/templating";
import { getPrimaryMediaForItem, ReactionProduct } from "/lib/api";

/**
 * productList helpers
 */

Template.productList.helpers({
  products() {
    return ReactionProduct.getProductsByTag(this.tag);
  },
  media() {
    const variants = ReactionProduct.getTopVariants();
    if (!variants || variants.length === 0) return null;
    return getPrimaryMediaForItem({ variantId: variants[0]._id });
  }
});
