/**
 * ordersListItems helpers
 *
 */
Template.ordersListItems.helpers({
  media: function () {
    const variantImage = ReactionCore.Collections.Media.findOne({
      "metadata.productId": this.productId,
      "metadata.variantId": this.variants._id
    });
    // variant image
    if (variantImage) {
      return variantImage;
    }
    // find a default image
    const productImage = ReactionCore.Collections.Media.findOne({
      "metadata.productId": this.productId
    });
    if (productImage) {
      return productImage;
    }
    return false;
  }
});
