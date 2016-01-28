// define default routing groups
shop = Router.group({
  name: "shop"
});

//
// index / home route
//
shop.route("/", {
  name: "index",
  subscriptions: function () {
    Meteor.subscribe("Products", Session.get("productScrollLimit"));
  },
  action: function () {
    renderLayout(this);
  }
});
