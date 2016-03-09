/**
 * gridContent helpers
 */

Template.gridContent.helpers({
  displayPrice: function () {
    return this._id && this.price.range;
  }
});
