//
// product route group
//

product = ReactionRouter.group({
  prefix: "/product"
});

//
//  product detail page
//

product.route("/:handle/:variant?", {
  name: "product",
  action: function () {
    // initialize reaction layout
    renderLayout({
      workflow: "coreProductWorkflow"
    });
  }
});
