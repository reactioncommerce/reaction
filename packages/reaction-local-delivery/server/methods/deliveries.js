function isPickUp(order) {
  if (order.advancedFulfillment.delivered) {
    return true;
  }
  return false;
}

Meteor.methods({
  'localDelivery/addToMyRoute': function (orderIds, userId) {
    check(orderIds, [String]);
    check(userId, String);
    if (!ReactionCore.hasPermission(LocalDelivery.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    _.each(orderIds, function (orderId) {
      let coordinates = {};
      const order = Orders.findOne(orderId);
      if (order.advancedFulfillment.workflow.status === 'orderReadyToShip') {
        Meteor.call(
          'advancedFulfillment/updateOrderWorkflow',
          order._id,
          userId,
          order.advancedFulfillment.workflow.status
        );
      }
      const shopifyOrder = ShopifyOrders.findOne({
        shopifyOrderNumber: order.shopifyOrderNumber
      });
      const orderAddress = order.shipping[0].address;
      let address = orderAddress.address1 + ' '
        + orderAddress.address2 + ' '
        + orderAddress.city + ' '
        + orderAddress.region + ', '
        + orderAddress.postal;

      const shopifyAddress = shopifyOrder.information.shipping_address;
      if (orderAddress.address1 === shopifyAddress.address1
        && orderAddress.address2 === shopifyAddress.address2
        && orderAddress.city === shopifyAddress.city
        && orderAddress.postal === shopifyAddress.zip
        && orderAddress.region === shopifyAddress.province_code) {
        coordinates.longitude = shopifyAddress.longitude;
        coordinates.latitude = shopifyAddress.latitude;
      } else {
        const settings = ReactionCore.Collections.Packages.findOne({
          name: 'reaction-local-delivery'
        }).settings;
        let token;
        if (settings) {
          token = settings.googlemap.key;
        }
        let apiReadyAddress = address.replace(/ /g, '+');
        let result = HTTP.get('https://maps.googleapis.com/maps/api/geocode/json?'
          + 'address=' + apiReadyAddress
          + '&key=' + token
        );
        coordinates.longitude = result.data.results[0].geometry.location.lng;
        coordinates.latitude = result.data.results[0].geometry.location.lat;
      }
      let color = '#7FBEDE';
      let symbol = 'clothing-store';
      if (isPickUp(order)) {
        color = '#E0AC4D';
        symbol = 'shop';
      }

      let geoJson = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        },
        properties: {
          'title': '#' + order.shopifyOrderNumber,
          'marker-symbol': symbol,
          'description': address,
          'marker-color': color
        }
      };

      let event = 'Assigned to Driver for Delivery';
      if (order.advancedFulfillment.delivered) {
        event = 'Assigned to Driver for PickUp';
      }

      const history = {
        event: event,
        userId: userId,
        updatedAt: new Date()
      };

      Orders.update({
        _id: order._id
      }, {
        $set: {
          'delivery.delivererId': userId,
          'delivery.deliveryStatus': 'Assigned to Driver',
          'delivery.deliveryDate': new Date(),
          'delivery.pickUp': isPickUp(order),
          'delivery.geoJson': geoJson,
          'delivery.location': address
        },
        $addToSet: {
          history: history
        }
      });
    });
  },
  'localDelivery/updateLocalDelivery': function (order, userId) {
    check(order, Object);
    check(userId, String);
    if (!ReactionCore.hasPermission(LocalDelivery.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    if (order.delivery.pickUp) {
      Orders.update({
        _id: order._id
      }, {
        $set: {
          'delivery.pickUp': true,
          'delivery.deliveryStatus': 'Picked Up',
          'delivery.geoJson.properties.marker-symbol': 'shop',
          'delivery.geoJson.properties.marker-color': '#E0AC4D'
        },
        $addToSet: {
          history: {
            event: 'orderPickedUp',
            userId: userId,
            updatedAt: new Date()
          }
        }
      });
    } else {
      Orders.update({
        _id: order._id
      }, {
        $set: {
          'delivery.pickUp': true,
          'delivery.deliveryStatus': 'Delivered',
          'delivery.geoJson.properties.marker-symbol': 'shop',
          'delivery.geoJson.properties.marker-color': '#E0AC4D'
        }
      });
      Meteor.call('localDelivery/orderDelivered', order._id, userId);
    }
  },
  'localDelivery/orderDelivered': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    let history = {
      event: 'orderDelivered',
      userId: userId,
      updatedAt: new Date()
    };

    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: {
        'advancedFulfillment.delivered': true
      },
      $addToSet: {
        history: history
      }
    });
  },
  'localDelivery/updateMyDeliveries': function (orderIds, userId) {
    check(orderIds, [String]);
    check(userId, String);
    if (!ReactionCore.hasPermission(LocalDelivery.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    _.each(orderIds, function (orderId) {
      let order = Orders.findOne(orderId);
      if (order.delivery.deliveryStatus === 'Assigned to Driver') {
        let failedMessage = 'Delivery Attempt Failed';
        if (order.advancedFulfillment.delivered) {
          failedMessage = 'PickUp Attempt Failed';
        }
        Orders.update({
          _id: orderId
        }, {
          $set: {
            'delivery.delivererId': null,
            'delivery.deliveryStatus': failedMessage
          },
          $addToSet: {
            history: {
              event: failedMessage,
              userId: userId,
              updatedAt: new Date()
            }
          }
        });
      } else {
        Orders.update({
          _id: orderId
        }, {
          $set: {
            'delivery.delivererId': null
          }
        });
      }
    });
  }
});
