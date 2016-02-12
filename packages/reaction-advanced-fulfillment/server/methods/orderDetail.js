function shipmentDateChecker(date, isLocalDelivery, transitTime) {
  if (isLocalDelivery) {
    return date;
  }

  let numberOfWeekendDays = 0;
  const shipDate = moment(date);
  const arrivalDate = moment(shipDate).add(transitTime, 'days');
  let additionalDays = 0;
  let daysToAdd = 0;

  if (moment(arrivalDate).isoWeekday() === 7) {
    shipDate.subtract(2, 'days');
    additionalDays += 2;
    arrivalDate.subtract(2, 'days');
  } else if (moment(arrivalDate).isoWeekday() === 6) {
    shipDate.subtract(1, 'days');
    additionalDays += 1;
    arrivalDate.subtract(1, 'days');
  }

  if (moment(shipDate).isoWeekday() === 7) {
    shipDate.subtract(2, 'days');
    additionalDays += 2;
  } else if (moment(shipDate).isoWeekday() === 6) {
    shipDate.subtract(1, 'days');
    additionalDays += 1;
  }

  const shipmentRange = shipDate.twix(arrivalDate, {allDay: true});
  let iter = shipmentRange.iterate('days');
  //
  while (iter.hasNext()) {
    let isoWeekday = iter.next().isoWeekday();
    if (isoWeekday === 7 || isoWeekday === 6) {
      numberOfWeekendDays += 1;
    }
  }

  daysToAdd = numberOfWeekendDays - additionalDays;
  if (daysToAdd <= 0) {
    daysToAdd = 0;
  }

  return shipDate.subtract(daysToAdd, 'days').toDate();
}

function arrivalDateChecker(date, isLocalDelivery) {
  if (isLocalDelivery) {
    return date;
  }
  if (moment(date).isoWeekday() === 7) {
    return moment(date).subtract(2, 'days').toDate();
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).subtract(1, 'days').toDate();
  }
  return date;
}

function returnDateChecker(date, isLocalDelivery) {
  if (isLocalDelivery) {
    return date;
  }
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days').toDate();
  }
  return date;
}

function rushShipmentChecker(date) {
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days').toDate();
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).add(2, 'days').toDate();
  }
  return date;
}

function rushRequired(arriveBy, transitTime, isLocal) {
  if (isLocal) {
    return false;
  }
  const possibleArrival = moment().startOf('day').add(transitTime, 'days'); // shipDate as start of day
  return moment(possibleArrival).diff(moment(arriveBy)) > 0;
}

function isLocalDelivery(postal) {
  let localZips = [
    '80424',
    '80435',
    '80443',
    '80497',
    '80498',
    '81657',
    '81620',
    '81657'
  ];
  return _.contains(localZips, postal);
}

function getFedexTransitTime(address) {
  const shopifyOrders = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-shopify-orders'
  });

  if (!shopifyOrders || !shopifyOrders.settings.fedex) {
    ReactionCore.Log.warn('Fedex API not setup. Transit Days will not be estimated');
    return false;
  }

  let fedexTimeTable = {
    'ONE_DAY': 1,
    'TWO_DAYS': 2,
    'THREE_DAYS': 3,
    'FOUR_DAYS': 4,
    'FIVE_DAYS': 5,
    'SIX_DAYS': 6,
    'SEVEN_DAYS': 7,
    'EIGHT_DAYS': 8,
    'NINE_DAYS': 9,
    'TEN_DAYS': 10,
    'ELEVEN_DAYS': 11,
    'TWELVE_DAYS': 12,
    'THIRTEEN_DAYS': 13,
    'FOURTEEN_DAYS': 14,
    'FIFTEEN_DAYS': 15,
    'SIXTEEN_DAYS': 16,
    'SEVENTEEN_DAYS': 17,
    'EIGHTEEN_DAYS': 18,
    'NINETEEN_DAYS': 19,
    'TWENTY_DAYS': 20
  };

  let fedex = new Fedex({
    'environment': shopifyOrders.settings.fedex.liveApi ? 'live' : 'sandbox',
    'key': shopifyOrders.settings.fedex.key,
    'password': shopifyOrders.settings.fedex.password,
    'account_number': shopifyOrders.settings.fedex.accountNumber,
    'meter_number': shopifyOrders.settings.fedex.meterNumber,
    'imperial': true
  });

  let shipment = {
    ReturnTransitAndCommit: true,
    CarrierCodes: ['FDXE', 'FDXG'],
    RequestedShipment: {
      DropoffType: 'REGULAR_PICKUP',
      ServiceType: 'FEDEX_GROUND', // GROUND_HOME_DELIVERY
      PackagingType: 'YOUR_PACKAGING',
      Shipper: {
        Contact: {
          PersonName: 'Shipper Person',
          CompanyName: 'GetOutfitted',
          PhoneNumber: '5555555555'
        },
        Address: {
          StreetLines: [
            '103 Main St'
          ],
          City: 'Dillon',
          StateOrProvinceCode: 'CO',
          PostalCode: '80435',
          CountryCode: 'US'
        }
      },
      Recipient: {
        Contact: {
          PersonName: address.fullName,
          CompanyName: 'Place',
          PhoneNumber: address.phone
        },
        Address: {
          StreetLines: [
            address.address1,
            address.address2
          ],
          City: address.city,
          StateOrProvinceCode: address.region,
          PostalCode: address.postal,
          CountryCode: address.country,
          Residential: false // Or true
        }
      },
      ShippingChargesPayment: {
        PaymentType: 'SENDER',
        Payor: {
          ResponsibleParty: {
            AccountNumber: fedex.options.account_number
          }
        }
      },
      PackageCount: '1',
      RequestedPackageLineItems: {
        SequenceNumber: 1,
        GroupPackageCount: 1,
        Weight: {
          Units: 'LB',
          Value: '7.0'
        },
        Dimensions: {
          Length: 24,
          Width: 14,
          Height: 6,
          Units: 'IN'
        }
      }
    }
  };

  let fedexRatesSync = Meteor.wrapAsync(fedex.rates);

  let rates = fedexRatesSync(shipment);
  if (!rates.RateReplyDetails) {
    return false;
  }
  let groundRate = rates.RateReplyDetails[0];
  return fedexTimeTable[groundRate.TransitTime];
}

function buffer() {
  let af = ReactionCore.Collections.Packages.findOne({name: 'reaction-advanced-fulfillment'});
  if (af && af.settings && af.settings.buffer) {
    return af.settings.buffer;
  }
  return {shipping: 0, returning: 0};
}

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
  'advancedFulfillment/updateOrderWorkflow': function (orderId, userId, status) {
    check(orderId, String);
    check(userId, String);
    check(status, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let workflow = {
      orderCreated: 'orderPrinted',
      orderPrinted: 'orderPicking',
      orderPicking: 'orderPicked',
      orderPicked: 'orderPacking',
      orderPacking: 'orderPacked',
      orderPacked: 'orderReadyToShip',
      orderReadyToShip: 'orderShipped',
      orderShipped: 'orderReturned',
      orderReturned: 'orderCompleted',
      orderIncomplete: 'orderCompleted'
    };
    let date = new Date();
    let historyEvent = {
      event: workflow[status],
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': status
      },
      $set: {
        'advancedFulfillment.workflow.status': workflow[status]
      }
    });
  },

  'advancedFulfillment/reverseOrderWorkflow': function (orderId, userId, status) {
    check(orderId, String);
    check(userId, String);
    check(status, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    let reverseWorkflow = {
      orderPrinted: 'orderCreated',
      orderPicking: 'orderPrinted',
      orderPicked: 'orderPicking',
      orderPacking: 'orderPicked',
      orderPacked: 'orderPacking',
      orderReadyToShip: 'orderPacked',
      orderShipped: 'orderReadyToShip',
      orderReturned: 'orderShipped',
      orderIncomplete: 'orderReturned',
      orderCompleted: 'orderReturned'
    };
    let date = new Date();
    let historyEvent = {
      event: reverseWorkflow[status],
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': status
      },
      $set: {
        'advancedFulfillment.workflow.status': reverseWorkflow[status]
      }
    });
  },

  'advancedFulfillment/orderCompletionVerifier': function (order, userId) {
    check(order, Object);
    check(userId, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    let afItems = order.advancedFulfillment.items;
    let allItemsReturned = _.every(afItems, function (item) {
      return item.workflow.status === 'returned';
    });
    let orderStatus = 'orderIncomplete';
    if (allItemsReturned) {
      orderStatus = 'orderCompleted';
    }
    let date = new Date();
    let historyEvent = {
      event: orderStatus,
      userId: userId,
      updatedAt: date
    };
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $addToSet: {
        'history': historyEvent,
        'advancedFulfillment.workflow.workflow': order.advancedFulfillment.workflow.status
      },
      $set: {
        'advancedFulfillment.workflow.status': orderStatus
      }
    });
  },
  'advancedFulfillment/updateOrderNotes': function (order, orderNotes, user) {
    check(order, Object);
    check(orderNotes, String);
    check(user, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    if (!order.orderNotes) {
      order.orderNotes = '';
    }
    let userInfo = noteFormattedUser(user);
    let notes = order.orderNotes + '<p>' + orderNotes + userInfo + '</p>';
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $set: {orderNotes: notes}
    });
  },
  'advancedFulfillment/printInvoices': function (startDate, endDate, userId) {
    check(startDate, Date);
    check(endDate, Date);
    check(userId, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    ReactionCore.Collections.Orders.update({
      'advancedFulfillment.shipmentDate': {
        $gte: startDate,
        $lte: endDate
      }
    }, {
      $set: {
        'advancedFulfillment.workflow.status': 'orderPrinted'
      },
      $addToSet: {
        history: {
          event: 'orderPrinted',
          userId: userId,
          updatedAt: new Date()
        }
      }
    }, {
      multi: true
    });
  },

  'advancedFulfillment/printInvoice': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: {
        'advancedFulfillment.workflow.status': 'orderPrinted'
      },
      $addToSet: {
        history: {
          event: 'orderPrinted',
          userId: userId,
          updatedAt: new Date()
        }
      }
    });
  },
  'advancedFulfillment/updateRentalDates': function (orderId, startDate, endDate, userObj) {
    check(orderId, String);
    check(startDate, Date);
    check(endDate, Date);
    check(userObj, Object);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    const order = ReactionCore.Collections.Orders.findOne(orderId);
    const localDelivery = order.advancedFulfillment.localDelivery;
    let user = userNameDeterminer(userObj);

    let impossibleShipDate = order.advancedFulfillment.impossibleShipDate;
    if (order.advancedFulfillment.impossibleShipDate) {
      impossibleShipDate = false; // Resetting impossibleShipDate here, but could probably just set it
    }
    let infoMissing = order.infoMissing;
    if (order.infoMissing) {
      infoMissing = false;
    }
    let fedexTransitTime = getFedexTransitTime(order.shipping[0].address);
    let bufferObject = buffer();
    let shippingBuffer = fedexTransitTime || bufferObject.shipping;
    let returnBuffer = fedexTransitTime || bufferObject.returning;

    let rentalLength = moment(endDate).diff(moment(startDate), 'days');
    let returnDate = returnDateChecker(moment(endDate).add(returnBuffer, 'days').toDate(), localDelivery);
    let arrivalDate = arrivalDateChecker(moment(startDate).subtract(1, 'days').toDate(), localDelivery);
    let shipmentDate = shipmentDateChecker(moment(arrivalDate).subtract(shippingBuffer, 'days').toDate(), localDelivery, shippingBuffer);
    let returnBy = moment(endDate).add(1, 'days').toDate();
    let orderCreated = {status: 'orderCreated'};
    let rushOrder = rushRequired(arrivalDate, fedexTransitTime, localDelivery);
    if (rushOrder && !localDelivery) {
      shipmentDate = rushShipmentChecker(moment().startOf('day'));
    }
    if (localDelivery) {
      shipmentDate = arrivalDate; // Remove transit day from local deliveries
    }

    let orderNotes = anyOrderNotes(order.orderNotes);
    orderNotes = orderNotes + '<p> Rental Dates updated to: '
    + moment(startDate).format('MM/D/YY') + '-'
    + moment(endDate).format('MM/D/YY')
    + noteFormattedUser(user) + '</p>';
    ReactionCore.Collections.Orders.update({_id: orderId}, {
      $set: {
        'startTime': startDate,
        'endTime': endDate,
        'rentalDays': rentalLength,
        'infoMissing': infoMissing,
        'advancedFulfillment.shipmentDate': shipmentDate,
        'advancedFulfillment.returnDate': returnDate,
        'advancedFulfillment.workflow': orderCreated,
        'advancedFulfillment.arriveBy': arrivalDate,
        'advancedFulfillment.shipReturnBy': returnBy,
        'advancedFulfillment.impossibleShipDate': impossibleShipDate,
        'orderNotes': orderNotes
      },
      $addToSet: {
        history: {
          event: 'updatedRentalDates',
          userId: userObj._id,
          updatedAt: new Date()
        }
      }
    });
  },

  'advancedFulfillment/updateShippingAddress': function (orderId, address) {
    check(orderId, String);
    check(address, Object);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    const user = Meteor.user();
    const userName = user.username || user.emails[0].address;
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    const prevAddress = order.shipping[0].address;
    const localDelivery = isLocalDelivery(address.postal);
    const startDate = order.startTime;
    const endDate = order.endTime;
    let fedexTransitTime = getFedexTransitTime(address);
    // Should abstract this section \/
    let bufferObject = buffer();
    let shippingBuffer = fedexTransitTime || bufferObject.shipping;
    let returnBuffer = fedexTransitTime || bufferObject.returning;
    let returnDate = returnDateChecker(moment(endDate).add(returnBuffer, 'days').toDate(), localDelivery);
    let arrivalDate = arrivalDateChecker(moment(startDate).subtract(1, 'days').toDate(), localDelivery);
    let shipmentDate = shipmentDateChecker(moment(arrivalDate).subtract(shippingBuffer, 'days').toDate(), localDelivery, shippingBuffer);
    if (localDelivery) {
      shipmentDate = arrivalDate; // Remove transit day from local deliveries
    }
    let returnBy = moment(endDate).add(1, 'days').toDate();

    let rushOrder = rushRequired(arrivalDate, fedexTransitTime, localDelivery);
    if (rushOrder && !localDelivery) {
      shipmentDate = rushShipmentChecker(moment().startOf('day'));
    }

    let orderNotes = anyOrderNotes(order.orderNotes);
    // Build updated orderNotes
    orderNotes = orderNotes + '<br /><p> Shipping Address updated from: <br />'
    + prevAddress.fullName + '<br />'
    + prevAddress.address1 + '<br />';

    orderNotes = prevAddress.address2 ? orderNotes + prevAddress.address2 + '<br />' : orderNotes;

    orderNotes = orderNotes + prevAddress.city + ' '
    + prevAddress.region + ', ' + prevAddress.postal
    + noteFormattedUser(userName) + '</p>';

    try {
      ReactionCore.Collections.Orders.update({_id: orderId}, {
        $set: {
          'advancedFulfillment.localDelivery': localDelivery,
          // This line adds a day to transit time because we estimate from first ski day during import.
          'advancedFulfillment.transitTime': localDelivery ? fedexTransitTime : fedexTransitTime + 1,
          'advancedFulfillment.shipmentDate': shipmentDate,
          'advancedFulfillment.returnDate': returnDate,
          'advancedFulfillment.arriveBy': arrivalDate,
          'advancedFulfillment.shipReturnBy': returnBy,
          'shipping.0.address': address,
          'orderNotes': orderNotes
        },
        $addToSet: {
          history: {
            event: 'orderShippingAddressUpdated',
            userId: Meteor.userId(),
            updatedAt: new Date()
          }
        }
      });
      ReactionCore.Log.info('Successfully updated shipping address for order: ' + order.shopifyOrderNumber);
    } catch (e) {
      ReactionCore.Log.error('Error updating shipping address for order: ' + order.shopifyOrderNumber, e);
    }
  },

  'advancedFulfillment/updateContactInformation': function (orderId, phone, email) {
    check(orderId, String);
    check(phone, String);
    check(email, String);
    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    const order = ReactionCore.Collections.Orders.findOne(orderId);
    try {
      ReactionCore.Collections.Orders.update({_id: orderId}, {
        $set: {
          'email': email,
          'shipping.0.address.phone': phone
        },
        $addToSet: {
          history: {
            event: 'orderContactInfoUpdated',
            userId: Meteor.userId(),
            updatedAt: new Date()
          }
        }
      });
      ReactionCore.Log.info('Successfully updated contact information for order: ' + order.shopifyOrderNumber);
    } catch (e) {
      ReactionCore.Log.error('Error updating contact information for order: ' + order.shopifyOrderNumber, e);
    }
  },

  'advancedFulfillment/updateItemsColorAndSize': function (order, itemId, productId, variantId, userObj) {
    check(order, Object);
    check(itemId, String);
    check(productId, String);
    check(variantId, String);
    check(userObj, Object);

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let user = userNameDeterminer(userObj);
    let product = Products.findOne(productId);
    let variants = product.variants;
    let variant = _.findWhere(variants, {_id: variantId});
    let orderItems = order.items;
    let orderNotes = anyOrderNotes(order.orderNotes);

    orderNotes = orderNotes + '<p>Item Details Added ' + product.gender + '-'
     + product.vendor + '-' + product.title
     + ' was updated with: color:' + variant.color + ' size: ' + variant.size
     + noteFormattedUser(user) + '</p>';

    _.each(orderItems, function (item) {
      if (item._id === itemId) {
        item.variants = variant;
      }
    });
    let afItems = order.advancedFulfillment.items;
    _.each(afItems, function (item) {
      if (item._id === itemId) {
        item.variantId = variant._id;
        item.location = variant.location;
        item.sku = variant.sku;
      }
    });

    let allItemsUpdated = _.every(afItems, function (item) {
      return item.variantId;
    });
    ReactionCore.Collections.Orders.update({_id: order._id}, {
      $set: {
        'items': orderItems,
        'advancedFulfillment.items': afItems,
        'orderNotes': orderNotes,
        'itemMissingDetails': !allItemsUpdated
      },
      $addToSet: {
        history: {
          event: 'itemDetailsAdded',
          userId: userObj._id,
          updatedAt: new Date()
        }
      }
    });
  },

  'advancedFulfillment/itemExchange': function (order, oldItemId, type, gender, title, color, variantId, userObj) {
    check(order, Object);
    check(oldItemId, String);
    check(type, String);
    check(gender, String);
    check(title, String);
    check(color, String);
    check(variantId, String);
    check(userObj, Object);
    // XXX: Way too many params, lets use an options object.

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let user = userNameDeterminer(userObj);
    let product = Products.findOne({
      productType: type,
      gender: gender,
      title: title
    });
    let variant = _.findWhere(product.variants, {_id: variantId});
    let orderItems = order.items;
    let oldItem = _.findWhere(orderItems, {_id: oldItemId});
    let orderAfItems = order.advancedFulfillment.items;
    let oldAfItem = _.findWhere(orderAfItems, {_id: oldItemId});
    let id = Random.id();
    let shopId = ReactionCore.getShopId();
    let newItem = {
      _id: id,
      shopId: shopId,
      productId: product._id,
      quantity: 1,
      variants: variant,
      workflow: oldItem.workflow
    };
    let newAfItem = {
      _id: id,
      productId: product._id,
      shopId: shopId,
      quantity: 1,
      variantId: variant._id,
      price: variant.price,
      sku: variant.sku,
      location: variant.location,
      itemDescription: product.gender + ' - ' + product.vendor + ' - ' + product.title,
      workflow: oldAfItem.workflow
    };
    let updatedItems = _.map(orderItems, function (item) {
      if (item._id === oldItemId) {
        return newItem;
      }
      return item;
    });
    let updatedAfItems = _.map(orderAfItems, function (item) {
      if (item._id === oldItemId) {
        return newAfItem;
      }
      return item;
    });
    let allItemsUpdated = _.every(updatedAfItems, function (item) {
      return item.variantId;
    });
    if (!order.orderNotes) {
      order.orderNotes = '';
    }
    let orderNotes = order.orderNotes + '<p>Item Replacement: '
      + oldAfItem.itemDescription + '-'
      + oldItem.variants.size + '- '
      + oldItem.variants.color
      + ' with: ' + newAfItem.itemDescription
      + '-' + newItem.variants.size + '-' + newItem.variants.color
      + noteFormattedUser(user)
      + '</p>';
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        'items': updatedItems,
        'advancedFulfillment.items': updatedAfItems,
        'orderNotes': orderNotes,
        'itemMissingDetails': !allItemsUpdated
      },
      $addToSet: {
        history: {
          event: 'itemExchange',
          userId: userObj._id,
          updatedAt: new Date
        }
      }
    });
  },

  'advancedFulfillment/addItem': function (order, type, gender, title, color, variantId, userObj) {
    check(order, Object);
    check(type, String);
    check(gender, String);
    check(title, String);
    check(color, String);
    check(variantId, String);
    check(userObj, Object);
    // XXX: Too many params - use options object.

    if (!ReactionCore.hasPermission(AdvancedFulfillment.server.permissions)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    let user = userNameDeterminer(userObj);
    let product = Products.findOne({
      productType: type,
      gender: gender,
      title: title
    });
    let variant = _.findWhere(product.variants, {_id: variantId});
    let id = Random.id();
    let shopId = ReactionCore.getShopId();
    let newItem = {
      _id: id,
      shopId: shopId,
      productId: product._id,
      quantity: 1,
      variants: variant
    };
    let newAfItem = {
      _id: id,
      productId: product._id,
      shopId: shopId,
      quantity: 1,
      variantId: variant._id,
      price: variant.price,
      sku: variant.sku,
      location: variant.location,
      itemDescription: product.gender + ' - ' + product.vendor + ' - ' + product.title,
      workflow: {
        status: 'In Stock',
        workflow: ['added']
      }
    };
    if (!order.orderNotes) {
      order.orderNotes = '';
    }
    let orderNotes = order.orderNotes + '<p>Item Added: '
      + newAfItem.itemDescription + ' - ' + newItem.variants.size
      + ' - ' + newItem.variants.color
      + noteFormattedUser(user)
      + '</p>';
    ReactionCore.Collections.Orders.update({
      _id: order._id
    }, {
      $set: {
        orderNotes: orderNotes
      },
      $addToSet: {
        'items': newItem,
        'advancedFulfillment.items': newAfItem,
        'history': {
          event: 'itemAdded',
          userId: userObj._id,
          updatedAt: new Date()
        }
      }
    });
  },
  'advancedFulfillment/bypassWorkflowAndComplete': function (orderId, userId) {
    check(orderId, String);
    check(userId, String);
    let history = [
      {
        event: 'bypassedWorkFlowToComplete',
        userId: userId,
        updatedAt: new Date()
      }, {
        event: 'orderCompleted',
        userId: userId,
        updatedAt: new Date()
      }
    ];
    ReactionCore.Collections.Orders.update({
      _id: orderId
    }, {
      $set: {
        'advancedFulfillment.workflow.status': 'orderCompleted'
      },
      $addToSet: {
        history: {
          $each: history
        }
      }
    });
  }
});
