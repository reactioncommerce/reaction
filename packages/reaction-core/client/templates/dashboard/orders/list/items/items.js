/**
* ordersListItems helpers
*
*/
Template.ordersListItems.helpers({
  media: function() {
    var defaultImage, img, product;
    if (defaultImage = ReactionCore.Collections.Media.findOne({
      'metadata.variantId': this.variants._id
    })) {
      return defaultImage;
    } else {
      product = ReactionCore.Collections.Products.findOne(this.productId);
      if (!product) {
        return;
      }
      img = null;
      _.any(product.variants, function(v) {
        img = ReactionCore.Collections.Media.findOne({
          'metadata.variantId': v._id
        });
        return !!img;
      });
      return img;
    }
  }
});
