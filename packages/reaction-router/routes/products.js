product = FlowRouter.group({
  name: "product",
  prefix: "/product"
});

//
//  product detail page
//

product.route("/:handle/:variant?", {
  subscriptions: function (params) {
    Meteor.subscribe("Product", params.handle);
  },
  action: function (params) {
    const variant = ReactionCore.currentProduct.get("variantId") || params.variant;
    ReactionCore.setProduct(params.handle, variant);
    let layout = Session.get("ReactionLayout");
    const productDetailLayout = Object.assign({}, layout, {
      template: "productDetail"
    });
    BlazeLayout.render("coreLayout", productDetailLayout);
    // will default to published product
    // let product = selectedProduct() || ReactionCore.Collections.Products.findOne();
    //
    // if (typeof product !== "undefined") {
    //   if (!product.isVisible) {
    //     if (!ReactionCore.hasPermission("createProduct")) {
    //       BlazeLayout.render("coreLayout", {template: "unauthorized"});
    //     }
    //   } else {
    //     BlazeLayout.render("coreLayout", productLayout);
    //   }
    // } else {
    //   BlazeLayout.render("coreLayout", {template: "productNotFound"});
    // }
  }
});
