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
    return Router.go("/product", {
      _id: this._id
    });
  }
});
