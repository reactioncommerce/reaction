Meteor.methods({
  'advancedFulfillment/shipSelectedOrders': function (orderIds) {
    check(orderIds, [String]);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    this.unblock();
    _.each(orderIds, function (orderId) {
      let order = ReactionCore.Collections.Orders.findOne(orderId);
      let currentStatus = order.advancedFulfillment.workflow.status;
      if (currentStatus === 'orderReadyToShip') {
        Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, Meteor.userId(), currentStatus);
      }
    });
  },
  'advancedFulfillment/unshipSelectedOrders': function (orderIds) {
    check(orderIds, [String]);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    this.unblock();
    _.each(orderIds, function (orderId) {
      let order = ReactionCore.Collections.Orders.findOne(orderId);
      let currentStatus = order.advancedFulfillment.workflow.status;
      if (currentStatus === 'orderShipped') {
        Meteor.call('advancedFulfillment/reverseOrderWorkflow', order._id, Meteor.userId(), currentStatus);
      }
    });
  },
  'advancedFulfillment/printSelectedOrders': function (orderIds) {
    check(orderIds, [String]);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    this.unblock();
    _.each(orderIds, function (orderId) {
      let order = ReactionCore.Collections.Orders.findOne(orderId);
      let currentStatus = order.advancedFulfillment.workflow.status;
      if (currentStatus === 'orderCreated') {
        Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, Meteor.userId(), currentStatus);
      }
    });
  },
  'advancedFulfillment/returnSelectedOrders': function (orderIds) {
    check(orderIds, [String]);
    this.unblock();
    _.each(orderIds, function (orderId) {
      let order = ReactionCore.Collections.Orders.findOne(orderId);
      let currentStatus = order.advancedFulfillment.workflow.status;
      if (currentStatus === 'orderShipped') {
        Meteor.call('advancedFulfillment/updateAllItemsToSpecificStatus', order, 'shipped');
        Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, Meteor.userId(), currentStatus);
      }
    });
  },
  'advancedFulfillment/completeSelectedOrders': function (orderIds) {
    check(orderIds, [String]);
    this.unblock();
    _.each(orderIds, function (orderId) {
      let order = ReactionCore.Collections.Orders.findOne(orderId);
      let currentStatus = order.advancedFulfillment.workflow.status;
      if (currentStatus === 'orderShipped' || currentStatus === 'orderReturned') {
        Meteor.call('advancedFulfillment/bypassWorkflowAndComplete', order._id, Meteor.userId());
      }
    });
  }
});
