Meteor.methods({
  'shopifyOrders/cancelOrder': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    if (this.connection === null) {
      const history = {
        event: 'orderCancelled',
        userId: userId,
        updatedAt: new Date()
      };
      ReactionCore.Collections.Orders.update({shopifyOrderId: orderId}, {
        $addToSet: {
          history: history
        },
        $set: {
          'advancedFulfillment.workflow.status': 'orderCancelled'
        }
      });
      // TODO: add information about what items are included in each package.
    } else {
      throw new Meteor.Error(403, 'Forbidden, method is only available from the server');
    }
  }
});
