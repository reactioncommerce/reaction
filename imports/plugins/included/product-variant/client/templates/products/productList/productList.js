import { ReactionProduct } from "/lib/api";
import { Media } from "/lib/collections";

/**
 * productList helpers
 */

Template.productList.helpers({
  products: function () {
    return ReactionProduct.getProductsByTag(this.tag);
  },
  media: function () {
    let defaultImage;
    const variants = getTopVariants();
    if (variants.length > 0) {
      const variantId = variants[0]._id;
      defaultImage = Media.findOne({
        "metadata.variantId": variantId
      }, {
        sort: { "metadata.priority": 1, "uploadedAt": 1 }
      });
    }
    if (defaultImage) {
      return defaultImage;
    }
    return false;
  }
});
