/**
 * gridContent helpers
 */

Template.gridContent.helpers({
  displayPrice: function () {
    if (this._id) {
      return ReactionProduct.getProductPriceRange(this._id);
    }
  }
});
