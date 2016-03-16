/**
 * productList helpers
 */

let Media;
Media = ReactionCore.Collections.Media;
Template.productList.helpers({
  products: function () {
    return ReactionProducts.getProductsByTag(this.tag);
  },
  media: function () {
    let defaultImage;
    const variants = getTopVariants();
    if (variants.length > 0) {
      let variantId = variants[0]._id;
      defaultImage = Media.findOne({
        "metadata.variantId": variantId,
        "metadata.priority": 0
      });
    }
    if (defaultImage) {
      return defaultImage;
    }
    return false;
  }
});
