Meteor.methods({
  'shopifyOrders/fixTimezones': function () {
    let orders = Orders.find({}).fetch();
    let d = new Date();
    let timezoneOffset = d.getTimezoneOffset() / 60;
    _.each(orders, function (order) {
      // ReactionCore.Log.info(moment(order.startTime).add(timezoneOffset, 'hours').hour() === 0);
      console.log(moment(order.startTime).hour());
      if (moment(order.startTime).hour() === 0
        && moment(order.endTime).hour() === 0) {
          Orders.update({
            '_id': order._id
          }, {
            $set: {
              'startTime': moment(order.startTime).add(2, 'hours').toDate(),
              'endTime': moment(order.endTime).add(2, 'hours').toDate(),
              'advancedFulfillment.shipmentDate': moment(order.advancedFulfillment.shipmentDate).add(2, 'hours').toDate(),
              'advancedFulfillment.returnDate': moment(order.advancedFulfillment.returnDate).add(2, 'hours').toDate()
            }
          });
      }
      ReactionCore.Log.info('updated timezone issues for order:', order.shopifyOrderNumber);
    });
  }
});
