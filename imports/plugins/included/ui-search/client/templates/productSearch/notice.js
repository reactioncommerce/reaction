/**
 * searchGridNotice helpers
 */
Template.searchGridNotice.helpers({
  isLowQuantity: function () {
    return this.product.isLowQuantity;
  },
  isSoldOut: function () {
    return this.product.isSoldOut;
  },
  isBackorder: function () {
    return this.product.isBackorder;
  }
});
