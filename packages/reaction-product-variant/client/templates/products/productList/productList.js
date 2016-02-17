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
    let variants = [];
    for (let variant of this.variants) {
      if (!variant.parentId) {
        variants.push(variant);
      }
    }
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
