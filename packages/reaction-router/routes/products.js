product = ReactionRouter.group({
  prefix: "/product"
});

//
//  product detail page
//

product.route("/:handle/:variant?", {
  name: "product",
  action: function (params) {
    const variant = ReactionCore.currentProduct.get("variantId") || params.variant;
    ReactionCore.setProduct(params.handle, variant);
    // initialize reaction layout
    renderLayout({
      workflow: "coreProductWorkflow"
    });
  }
});
