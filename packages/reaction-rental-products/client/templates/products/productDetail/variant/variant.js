/**
 * variant helpers
 */
Template.variant.helpers({
  displayPrice: function () {
    return getVariantPriceOrPricePerDayRange(this._id);
  }
});
