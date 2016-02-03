Template.products.helpers({
  tag: function () {
    const id = ReactionRouter.getParam("_tag");
    return {
      tag: ReactionCore.Collections.Tags.findOne({ slug: id }) || ReactionCore.Collections.Tags.findOne(id)
    };
  }
});

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
    return ReactionRouter.go("/product", {
      _id: this._id
    });
  }
});
