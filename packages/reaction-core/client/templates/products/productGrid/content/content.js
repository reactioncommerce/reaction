/**
 * gridContent helpers
 */

Template.gridContent.helpers({
  // TODO: It seems we need `price` prop denormalization into the product doc
  displayPrice: function () {
    if (this._id) {
      return getProductPriceRange(this._id);
    }
  }
});
