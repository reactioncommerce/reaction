Template['reaction-shop-widget'].helpers({
  pcount: function () {
    return Products.find().count();
  },
  ocount: function () {
    return Orders.find().count();
  },
  ccount: function () {
    return Customers.find().count();
  }
});
