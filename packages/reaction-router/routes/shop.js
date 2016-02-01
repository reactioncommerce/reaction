// define default routing groups
shop = Router.group({
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
