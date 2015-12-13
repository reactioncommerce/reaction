/**
 * ordersListItems helpers
 *
 */
Template.ordersListItems.helpers({
  media: function () {
    // not sure what this is supposed to do
    let defaultImage;
    if (defaultImage === ReactionCore.Collections.Media.findOne({
      "metadata.variantId": this.variants._id
    })) {
      return defaultImage;
    }
    // default
    let product = ReactionCore.Collections.Products.findOne(this.productId);
    if (!product) {
      return {};
    }
    let img = null;
    _.any(product.variants, function (v) {
      img = ReactionCore.Collections.Media.findOne({
        "metadata.variantId": v._id
      });
      return !!img;
    });
    return img;
  }
});
