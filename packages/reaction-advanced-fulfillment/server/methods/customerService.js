function noteFormattedUser(user) {
  check(user, String);
  let date = moment().format('MM/DD/YY h:mma');
  return  '| <em>' + user + '-' + date + '</em>';
}

function userNameDeterminer(user) {
  check(user, Object);
  if (user.username) {
    return user.username;
  }
  return user.emails[0].address;
}

function anyOrderNotes(orderNotes) {
  if (!orderNotes) {
    return '';
  }
  return orderNotes;
}

Meteor.methods({
  'advancedFulfillment/cancelOrder': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    const history = {
      event: 'orderCancelled',
      userId: userId,
      updatedAt: new Date()
    };
    const userObj = Meteor.users.findOne(userId);
    let userName = 'Guest';
    if (userObj) {
      userName = userNameDeterminer(userObj);
    }
    let order = ReactionCore.Collections.Orders.findOne({
      _id: orderId
    }, {
      fields: {
        orderNotes: 1
      }
    });
    let orderNotes = anyOrderNotes(order.orderNotes);
    orderNotes = orderNotes + '<p><strong>Order Cancelled</strong>' + noteFormattedUser(userName) + '</p>';

    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $addToSet: {
        history: history
      },
      $set: {
        'advancedFulfillment.workflow.status': 'orderCancelled',
        'advancedFulfillment.impossibleShipDate': false,
        'orderNotes': orderNotes
      }
    });
  },
  'advancedFulfillment/bundleColorConfirmation': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let history = {
      event: 'bundleColorConfirmed',
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $addToSet: {
        history: history
      },
      $set: {
        bundleMissingColor: false
      }
    });
  },
  'advancedFulfillment/updateSkiPackageWithCustomerInfo': function (orderId, userId, skiId, age, shoeSize, level) {
    check(orderId, String);
    check(userId, String);
    check(skiId, String);
    check(age, Number);
    check(shoeSize, String);
    check(level, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    ReactionCore.Collections.Orders.update({
      '_id': orderId,
      'advancedFulfillment.skiPackages._id': skiId
    }, {
      $set: {
        'advancedFulfillment.skiPackages.$.age': age,
        'advancedFulfillment.skiPackages.$.shoeSize': shoeSize,
        'advancedFulfillment.skiPackages.$.skiLevel': level,
        'advancedFulfillment.skiPackages.$.contactedCustomer': true
      }
    });
  },
  'advancedFulfillment/nonWarehouseOrder': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let history = {
      event: 'nonWarehouseOrder',
      userId: userId,
      updatedAt: new Date()
    };
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: {
        'advancedFulfillment.workflow.status': 'nonWarehouseOrder'
      },
      $addToSet: {
        history: history
      }
    });
  }
});
