Template.gridControls.onRendered(function () {
  return this.$("[data-toggle='tooltip']").tooltip({
    position: "top"
  });
});

Template.gridControls.helpers({
  checked() {
    const selectedProducts = Session.get("productGrid/selectedProducts");

    if (_.isArray(selectedProducts)) {
      return selectedProducts.indexOf(this._id) >= 0;
    }

    return false;
  }
});
