// define default routing groups
shop = ReactionRouter.group({
  name: "shop"
});

//
// index / home route
//
shop.route("/", {
  name: "index",
  action: function () {
    renderLayout();
  }
});
