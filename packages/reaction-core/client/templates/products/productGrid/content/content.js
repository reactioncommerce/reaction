/**
 * gridContent helpers
 */

Template.gridContent.helpers({
  displayPrice: function () {
    if (this._id) {
      return this.price;
    }
  }
});
