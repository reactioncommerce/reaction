Template.orderQueue.helpers({
  myOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({'history.userId': userId});
  },
  myPickedOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({
      'history.userId': userId,
      'history.event': 'orderPicking'
    });
  },
  myCurrentPickingOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({
      'history.userId': userId,
      'history.event': 'orderPicking',
      'advancedFulfillment.workflow.status': 'orderPicking'
    });
  },
  myCurrentPackingOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({
      'history.userId': userId,
      'history.event': 'orderPacking',
      'advancedFulfillment.workflow.status': 'orderPacking'
    });
  },
    // return  ReactionCore.Collections.Orders.find({'history.userId': userId, 'history.event': 'orderPicking'}).sort({'history.$.updatedAt': 1});
  myPackedOrders: function () {
    let userId = Meteor.userId();
    return  ReactionCore.Collections.Orders.find({
      'history.userId': userId,
      'history.event': 'orderPacking'
    });
  }
});

Template.myPastOrders.helpers({
  shippingDate: function () {
    let longDate = this.advancedFulfillment.shipmentDate;
    return moment(longDate).format('MMMM Do, YYYY');
  },
  status: function () {
    return this.advancedFulfillment.workflow.status;
  },
  contactInfo: function () {
    return this.email || 'Checked Out As Guest';
  },
  uniqueItemsCount: function () {
    return this.items.length;
  },
  totalItemsCount: function () {
    let total = _.reduce(this.items, function (sum, item) {
      return sum + item.quantity;
    }, 0);
    return total;
  },
  orderId: function () {
    return this._id;
  },
  nextStatus: function () {
    let currentStatus = this.advancedFulfillment.workflow.status;
    let options = ['orderCreated', 'orderPicking', 'orderPacking', 'orderFulfilled'];
    let indexOfStatus = _.indexOf(options, currentStatus);
    return options[indexOfStatus + 1];
  }
});
