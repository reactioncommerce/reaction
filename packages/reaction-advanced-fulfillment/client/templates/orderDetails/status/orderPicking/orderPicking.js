function findOrderItem(order, itemId) {
  return _.findWhere(order.items, {_id: itemId});
}

Template.orderPicking.onCreated(function () {
  let orderId = this.data._id;
  let totalItems = this.data.advancedFulfillment.items.length;
  let _ids = _.pluck(this.data.advancedFulfillment.items, '_id');
  let result = _.map(this.data.advancedFulfillment.items, function (item) {
    if (item.workflow.status === 'picked') {
      return false;
    }
    return true;
  });
  let itemStatus = _.object(_ids, result);
  let data = {};
  data.count = totalItems;
  data.itemStatus = itemStatus;
  Session.set('orderPicking-' + orderId, data);
});

Template.orderPicking.helpers({
  items: function () {
    let items = this.advancedFulfillment.items;
    return _.sortBy(items, function (item) {
      if (item.location) {
        return parseInt(item.location.split('A')[1]);
      } else {
        return 999;
      }
    });
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
  unpicked: function (itemId) {
    let orderId = this._id;
    let unpicked = Session.get('orderPicking-' + orderId).itemStatus[itemId];
    return unpicked;
  }
});

Template.orderPicking.events({
  'click .picked': function (event) {
    event.preventDefault();
    let _id = event.target.dataset.itemId;
    let orderId = this._id;
    let session = Session.get('orderPicking-' + orderId);
    session.itemStatus[_id] = false;
    Session.set('orderPicking-' + orderId, session);
    Meteor.call('advancedFulfillment/updateItemWorkflow', orderId, _id, 'In Stock');
  },
  'click #all-items-picked': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    let session = Session.get('orderPicking-' + orderId);
    let allItemsPicked = _.every(session.itemStatus, function (item) {
      return item === false;
    });
    if (allItemsPicked) {
      Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, 'orderPicking');
    } else {
      Alerts.removeSeen();
      Alerts.add('All Items Have Not Been Picked', 'danger', {
        autoHide: false
      });
    }
  },
  'click #all-items-picked-new-order': function (event) {
    event.preventDefault();
    let orderId = this._id;
    let userId = Meteor.userId();
    let session = Session.get('orderPicking-' + orderId);
    let allItemsPicked = _.every(session.itemStatus, function (item) {
      return item === false;
    });
    if (allItemsPicked) {
      Meteor.call('advancedFulfillment/updateOrderWorkflow', orderId, userId, 'orderPicking');
      Router.go('advancedFulfillment.picker');
    } else {
      Alerts.removeSeen();
      Alerts.add('All Items Have Not Been Picked', 'danger', {
        autoHide: false
      });
    }
  }
});
