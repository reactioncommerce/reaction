tags = ReactionRouter.group({
  prefix: "/tag"
});

//
// tag grid
//
tags.route("/:_tag", {
  name: "tag",
  action: function () {
    // initialize reaction layout
    renderLayout({template: "products"});
  }
});
