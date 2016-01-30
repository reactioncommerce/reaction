tags = Router.group({
  prefix: "/tag"
});

//
// tag grid
//
tags.route("/:_tag", {
  name: "tag",
  subscriptions: function () {
    Meteor.subscribe("Products", Session.get("productScrollLimit"));
  },
  action: function () {
    // initialize reaction layout
    renderLayout({template: "products"});
  }
});
