tags = ReactionRouter.group({
  prefix: "/tag"
});

//
// tag grid
//
tags.route("/:slug", {
  name: "tag",
  action: function () {
    // initialize reaction layout
    renderLayout({template: "products"});
  }
});
