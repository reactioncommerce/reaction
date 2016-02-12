Meteor.methods({
  'shopifyOrders/newFulfillment': function (fulfillment, shopifyOrderNumber) {
    check(fulfillment, Match.Any);
    check(shopifyOrderNumber, Number);
    if (this.connection === null) {
      const trackingNumbers = fulfillment.tracking_numbers;
      const trackingUrls = fulfillment.tracking_urls;
      const order = ReactionCore.Collections.Orders.findOne({shopifyOrderNumber: shopifyOrderNumber});

      if (_.contains(['orderPacked', 'orderPacking', 'orderPicked'], order.advancedFulfillment.workflow.status)) {
        ReactionCore.Collections.Orders.update({shopifyOrderNumber: shopifyOrderNumber}, {
          $addToSet: {
            'advancedFulfillment.outboundTrackingNumbers': { $each: trackingNumbers },
            'advancedFulfillment.outboundTrackingUrls': { $each: trackingUrls },
            'advancedFulfillment.workflow.workflow': 'orderPacked'
          },
          $set: {
            'advancedFulfillment.workflow.status': 'orderReadyToShip'
          }
        });
      } else {
        ReactionCore.Log.warn(
          'Warning: fulfillment caught for order ' + shopifyOrderNumber
           + ' which was currently in ' + order.advancedFulfillment.workflow.status + ' state.'
           + ' Order was not advaned into orderReadyToShip state.');
      }
    } else {
      throw new Meteor.Error(403, 'Forbidden, method is only available from the server');
    }
  }
});
