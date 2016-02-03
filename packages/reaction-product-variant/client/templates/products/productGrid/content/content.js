/**
 * gridContent helpers
 */

Template.gridContent.helpers({
  displayPrice: function () {
    if (this._id) {
      return getProductPriceRange(this._id);
    }
  }
});
