/**
 * searchGridNotice helpers
 */
Template.searchGridNotice.helpers({
  isLowQuantity: function () {
    return this.isLowQuantity;
  },
  isSoldOut: function () {
    return this.isSoldOut;
  },
  isBackorder: function () {
    return this.isBackorder;
  }
});
