tags = Router.group({
  name: "tags",
  prefix: "/products"
});

//
// tag grid
//
tags.route("/tag/:_tag", {
  subscriptions: function () {
    Meteor.subscribe("Products", Session.get("productScrollLimit"));
  },
  action: function () {
    let layout = Session.get("ReactionLayout");
    const productGridLayout = Object.assign({}, layout, {
      template: "products"
    });
    BlazeLayout.render("coreLayout", productGridLayout);
  }
});
