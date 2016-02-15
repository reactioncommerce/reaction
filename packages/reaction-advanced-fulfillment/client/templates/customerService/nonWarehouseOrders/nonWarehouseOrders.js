Template.nonWarehouseOrders.helpers({
  nonWarehouseOrders: function () {
    return ReactionCore.Collections.Orders.find({
      'advancedFulfillment.workflow.status': 'nonWarehouseOrder'
    }, {
      sort: {
        shopifyOrderNumber: 1
      }
    });
  },
  billingName: function (order) {
    return order.billing[0].address.fullName;
  },
  billingPhone: function (order) {
    return order.billing[0].address.phone;
  },
  email: function (order) {
    return order.email;
  },
  shippingName: function () {
    return this.order.shipping[0].address.fullName;
  },
  shippingPhone: function (order) {
    return order.shipping[0].address.phone;
  },
  shippingAddress: function (order) {
    let address = order.shipping[0].address;
    return address.address1 + ' ' + address.address2 + ' ' + address.city + ', ' + address.region + ' ' + address.postal;
  }
});
