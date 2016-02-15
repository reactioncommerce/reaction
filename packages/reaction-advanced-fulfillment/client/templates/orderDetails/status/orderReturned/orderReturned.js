function findOrderItem(order, itemId) {
  return _.findWhere(order.items, {_id: itemId});
}

Template.orderReturned.onCreated(function () {
  let orderId = this.data._id;
  let data = {};
  let afItems = this.data.advancedFulfillment.items;
  _.each(afItems, function (item) {
    data[item._id] = item.workflow.status;
  });
  Session.set('orderReturned-' + orderId, data);
});

Template.orderReturned.helpers({
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
  itemActionable: function (itemId) {
    let orderId = this._id;
    let itemStatus = Session.get('orderReturned-' + orderId)[itemId];
    return itemStatus === 'shipped';
  }
});

Template.orderReturned.events({
  'click .item-returned': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let itemId = event.target.dataset.itemId;
    let session = Session.get('orderReturned-' + orderId);
    session[itemId] = 'returned';
    Session.set('orderReturned-' + orderId, session);
    Meteor.call('advancedFulfillment/updateItemWorkflow', orderId, itemId, 'shipped');
  },
  'click .item-issue': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let itemId = event.target.dataset.itemId;
    let issue = event.target.dataset.issue;
    let userId = Meteor.userId();
    let session = Session.get('orderReturned-' + orderId);
    session[itemId] = issue;
    Session.set('orderReturned-' + orderId, session);
    Meteor.call('advancedFulfillment/itemIssue', orderId, itemId, userId, issue);
  },
  'click .items-inspected': function (event) {
    event.preventDefault();
    let order = this;
    let orderItems = order.advancedFulfillment.items;
    let userId = Meteor.userId();
    let valid = _.every(orderItems, function (item) {
      return _.contains(['returned', 'missing', 'damaged'], item.workflow.status);
    });
    if (valid) {
      Meteor.call('advancedFulfillment/orderCompletionVerifier', order, userId);
    } else {
      Alerts.removeSeen();
      Alerts.add('All Items Have Not Been Verified, please select: Missing, Damaged or Returned for each Item', 'danger', {
        autoHide: false
      });
    }
  }
});
