Meteor.publish('afOrders', function () {
  shopId = ReactionCore.getShopId();

  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      shopId: shopId
    }, {
      fields: {
        'startTime': 1,
        'advancedFulfillment.returnDate': 1,
        'advancedFulfillment.shipmentDate': 1,
        'advancedFulfillment.workflow.status': 1,
        'advancedFulfillment.items._id': 1,
        'advancedFulfillment.items.workflow': 1,
        'advancedFulfillment.arriveBy': 1,
        // 'email': 1,
        'shopifyOrderNumber': 1,
        // 'shipping.address.phone': 1,
        'history': 1,
        'shipping.address.region': 1,
        'shipping.address.city': 1,
        'shipping.address.fullName': 1,
        // 'billing.address.fullName': 1,
        'advancedFulfillment.localDelivery': 1,
        'advancedFulfillment.rushDelivery': 1,
        'advancedFulfillment.kayakRental.vendor': 1,
        'advancedFulfillment.kayakRental.qty': 1,
        'advancedFulfillment.rushShippingPaid': 1
      }
    });
  }
  return this.ready();
});

Meteor.publish('afProducts', function () {
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Products.find({});
  }
  return this.ready();
});

Meteor.publish('advancedFulfillmentOrder', function (orderId) {
  check(orderId, String);
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      _id: orderId,
      shopId: shopId
    });
  }
  return this.ready();
});

Meteor.publish('searchOrders', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      }
    }, {
      fields: {
        _id: 1,
        shopifyOrderNumber: 1
      }
    });
  }
  return this.ready();
});

Meteor.publish('shippingOrders', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'items': {$ne: []},
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderShipping
      },
      'startTime': {$ne: undefined}
    }, {
      fields: AdvancedFulfillment.fields.ordersList
    });
  }
  return this.ready();
});

Meteor.publish('ordersByStatus', function (status) {
  check(status, String);
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': status
    }, {
      fields: AdvancedFulfillment.fields.ordersList
    });
  }
  return this.ready();
});

Meteor.publish('selectedOrders', function (orderIds) {
  check(orderIds, [String]);
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      _id: {
        $in: orderIds
      }
    }, {
      fields: {
        'advancedFulfillment.paymentInformation.refunds': 0,
        'advancedFulfillment.paymentInformation.transactions': 0
      }
    });
  }
  return this.ready();
});

Meteor.publish('nonWarehouseOrders', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': 'nonWarehouseOrder'
    });
  }
  return this.ready();
});

Meteor.publish('userOrderQueue', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderInQueue
      },
      'history.userId': this.userId
    });
  }
  return this.ready();
});

Meteor.publish('custServOrders', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderShipping
      }
    });
  }
  return this.ready();
});

Meteor.publish('ordersWithMissingItems', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.items.workflow.status': 'missing'
    });
  }
  return this.ready();
});

Meteor.publish('ordersWithDamagedItems', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.items.workflow.status': 'damaged'
    });
  }
  return this.ready();
});

Meteor.publish('ordersShippingOnDate', function (date) {
  const shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, AdvancedFulfillment.server.permissions, ReactionCore.getShopId())) {
    const startOfDay = moment(date, 'MM-DD-YYYY').startOf('day').toDate();
    const endOfDay = moment(date, 'MM-DD-YYYY').endOf('day').toDate();
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderActive
      },
      'advancedFulfillment.shipmentDate': {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
  }

  return this.ready();
});

Meteor.publish('afReturnOrders', function () {
  shopId = ReactionCore.getShopId();
  if (Roles.userIsInRole(this.userId, ['admin', 'owner', 'dashboard/advanced-fulfillment', 'reaction-advanced-fulfillment'], ReactionCore.getShopId())) {
    return ReactionCore.Collections.Orders.find({
      'shopId': shopId,
      'advancedFulfillment.workflow.status': {
        $in: AdvancedFulfillment.orderReturning
      }
    }, {
      fields: {
        'endTime': 1,
        'advancedFulfillment.returnDate': 1,
        'advancedFulfillment.workflow.status': 1,
        'advancedFulfillment.items._id': 1,
        'advancedFulfillment.items.workflow': 1,
        'advancedFulfillment.shipReturnBy': 1,
        'shopifyOrderNumber': 1,
        'history': 1,
        'shipping.address.region': 1,
        'shipping.address.city': 1,
        'shipping.address.fullName': 1,
        'advancedFulfillment.localDelivery': 1,
        'advancedFulfillment.rushDelivery': 1,
        'advancedFulfillment.kayakRental.vendor': 1,
        'advancedFulfillment.kayakRental.qty': 1,
        'advancedFulfillment.rushShippingPaid': 1
      }
    });
  }
  return this.ready();
});
