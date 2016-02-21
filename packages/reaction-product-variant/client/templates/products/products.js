/**
 * products events
 */

Template.products.events({
  "click #productListView": function () {
    $(".product-grid").hide();
    return $(".product-list").show();
  },
  "click #productGridView": function () {
    $(".product-list").hide();
    return $(".product-grid").show();
  },
  "click .product-list-item": function () {
    // go to new product
    ReactionRouter.go("product", {
      handle: this._id
    });
  }
});
