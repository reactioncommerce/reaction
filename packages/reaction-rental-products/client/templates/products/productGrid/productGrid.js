Template.gridContent.helpers({
  displayPrice: function () {
    if (this._id) {
      return getProductPriceOrPricePerDayRange(this._id);
    }
  },
  isRentalType: function (productType) {
    return productType === 'rental';
  }
});
