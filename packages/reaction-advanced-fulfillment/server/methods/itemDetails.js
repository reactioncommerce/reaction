Meteor.methods({
  'advancedFulfillment/updateItemWorkflow': function (orderId, itemId, itemStatus) {
    check(orderId, String);
    check(itemId, String);
    check(itemStatus, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let workflow = {
      'In Stock': 'picked',
      'picked': 'packed',
      'packed': 'shipped',
      'shipped': 'returned',
      'returned': 'completed'
    };
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: { 'advancedFulfillment.items.$.workflow.status': workflow[itemStatus] },
      $addToSet: {'advancedFulfillment.items.$.workflow.workflow': itemStatus }
    });
  },

  'advancedFulfillment/updateAllItems': function (order, currentItemStatus) {
    check(order, Object);
    check(currentItemStatus, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let items = order.advancedFulfillment.items;
    let allItems = _.every(items, function (item) {
      return item.workflow.status === currentItemStatus;
    });
    if (!allItems) {
      throw new Meteor.Error('Invalid Item Status');
    }
    let indexOfNextStatus = AdvancedFulfillment.itemStatus.indexOf(currentItemStatus) + 1;
    _.each(items, function (item) {
      item.workflow.status = AdvancedFulfillment.itemStatus[indexOfNextStatus];
      item.workflow.workflow.push(currentItemStatus);
    });
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        'advancedFulfillment.items': items
      }
    });
  },

  'advancedFulfillment/itemIssue': function (orderId, itemId, userId, issue) {
    check(orderId, String);
    check(itemId, String);
    check(userId, String);
    check(issue, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let historyEvent = {
      event: issue + 'Item',
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {'advancedFulfillment.items.$.workflow.status': issue},
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.items.$.workflow.workflow': issue
      }
    });
  },

  'advancedFulfillment/itemResolved': function (orderId, itemId, issue) {
    check(orderId, String);
    check(itemId, String);
    check(issue, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.items._id': itemId
    }, {
      $set: {
        'advancedFulfillment.items.$.workflow.status': 'returned'
      },
      $addToSet: {
        'advancedFulfillment.items.$.workflow.status': issue
      }
    });
    return ReactionCore.Collections.Orders.findOne(orderId);
  },
  'advancedFulfillment/updateAllItemsToSpecificStatus': function (order, desiredItemStatus) {
    check(order, Object);
    check(desiredItemStatus, String);
    let items = order.advancedFulfillment.items;
    _.each(items, function (item) {
      item.workflow.status = desiredItemStatus;
    });
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        'advancedFulfillment.items': items
      }
    });
  }
});
