product = ReactionRouter.group({
  prefix: "/product"
});

//
//  product detail page
//

product.route("/:handle/:variant?", {
  name: "product",
  action: function (params) {
    const variant = ReactionProduct.currentProduct.get("variantId") || params.variant;
    ReactionProduct.setProduct(params.handle, variant);
    // initialize reaction layout
    renderLayout({
      workflow: "coreProductWorkflow"
    });
  }
});
