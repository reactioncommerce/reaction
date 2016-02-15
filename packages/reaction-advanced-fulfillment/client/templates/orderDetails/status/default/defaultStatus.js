function findOrderItem(order, itemId) {
  return _.findWhere(order.items, {_id: itemId});
}

Template.defaultStatus.helpers({
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
  }
});
