function findOrderItem(order, itemId) {
  return _.findWhere(order.items, {_id: itemId});
}

Template.orderPacking.helpers({
  items: function () {
    return this.advancedFulfillment.items;
  },
  orderId: function () {
    return this._id;
  },
  userName: function () {
    return Meteor.user().username;
  },
  SKU: function (item) {
    if (item.sku) {
      return item.sku;
    }
    return 'No SKU';
  },
  location: function (item) {
    if (item.location) {
      return item.location;
    }
    return 'No Location';
  },
  color: function (item) {
    let itemId = item._id;
    let order = this;
    let orderItem = findOrderItem(order, itemId);
    if (orderItem) {
      return orderItem.variants.color;
    }
  },
  size: function (item) {
    let itemId = item._id;
    let order = this;
    let orderItem = findOrderItem(order, itemId);
    if (orderItem) {
      return orderItem.variants.size;
    }
  },
  packingConfirmed: function () {
    return Session.get('confirm-' + this._id);
  }
});

Template.orderPacking.events({
  'click #confirmPacked': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let session = Session.get('confirm-' + orderId);
    Session.set('confirm-' + orderId, !session);
  },
  'click #packed-items-verified': function (event) {
    event.preventDefault();
    const order = this;
    const userId = Meteor.userId();
    const currentItemStatus = 'picked';
    Meteor.call('advancedFulfillment/updateAllItems', order, currentItemStatus);
    Meteor.call('advancedFulfillment/updateOrderWorkflow', order._id, userId, 'orderPacking');
  }
});
