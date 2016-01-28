tags = Router.group({
  name: "tags",
  prefix: "/tags"
});

//
// tag grid
//
tags.route("/:_tag", {
  subscriptions: function () {
    Meteor.subscribe("Products", Session.get("productScrollLimit"));
  },
  action: function () {
    // initialize reaction layout
    renderLayout(this, "coreLayout", "coreLayout", {template: "products"});
  }
});
