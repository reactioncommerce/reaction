import { Template } from "meteor/templating";
import { getPrimaryMediaForItem, ReactionProduct } from "/lib/api";

/**
 * productList helpers
 */

Template.productList.helpers({
  products() {
    return ReactionProduct.getProductsByTag(this.tag);
  },
  mediaUrl() {
    const variants = ReactionProduct.getTopVariants();
    if (!variants || variants.length === 0) return "/resources/placeholder.gif";
    const media = getPrimaryMediaForItem({ variantId: variants[0]._id });
    if (!media) return "/resources/placeholder.gif";
    return media.url({ store: "large" });
  }
});
