function num() {
  return _.random(1, 5);
}

function newItemsList(number) {
  return  _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'In Stock',
        workflow: []
      }
    };
  });
}

function newItemsSkuLocationList(number) {
  return  _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'In Stock',
        workflow: []
      },
      sku: faker.name.firstName().substr(0, 2) + '-' + _.random(100, 1000),
      location: faker.name.firstName().substr(0, 2) + '-L' + _.random(1, 9) + '-C' + _.random(1, 9)
    };
  });
}

function pickedItemsList(number) {
  return _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'picked',
        workflow: ['In Stock']
      }
    };
  });
}

function packedItemsList(number) {
  return _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'packed',
        workflow: ['In Stock', 'picked']
      }
    };
  });
}

function shippedItemsList(number) {
  return _.times(number, function () {
    return {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      variantId: Random.id(),
      quantity: _.random(1, 5),
      itemDescription: faker.commerce.productName(),
      price: _.random(100, 1500) / 100,
      workflow: {
        status: 'shipped',
        workflow: ['In Stock', 'picked', 'packed']
      },
      sku: faker.name.firstName().substr(0, 2) + '-' + _.random(100, 1000),
      location: faker.name.firstName().substr(0, 2) + '-L' + _.random(1, 9) + '-C' + _.random(1, 9)
    };
  });
}

function shipmentDate() {
  return moment().add(_.random(0, 3), 'days')._d;
}
function returnDate() {
  return moment().add(_.random(4, 6), 'days')._d;
}

Factory.define('newOrder', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderCreated',
        workflow: []
      },
      items: newItemsList(num())
    }
  })
);

Factory.define('orderSKU', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderCreated',
        workflow: []
      },
      items: newItemsSkuLocationList(5)
    }
  })
);

Factory.define('pickingOrder', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderPicking',
        workflow: ['orderCreated']
      },
      items: pickedItemsList(num())
    }
  })
);

Factory.define('packingOrder', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderPacking',
        workflow: ['orderCreated', 'orderPicking']
      },
      items: packedItemsList(num())
    }
  })
);

Factory.define('todaysReturns', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: new Date(2015, 9, 28),
      returnDate: new Date(),
      workflow: {
        status: 'orderShipping',
        workflow: ['orderCreated', 'orderPicking', 'orderPacking', 'orderFulfilled']
      },
      items: shippedItemsList(num())
    }
  })
);


Factory.define('fulfilledOrder', ReactionCore.Collections.Orders,
  Factory.extend('orderForAF', {
    advancedFulfillment: {
      shipmentDate: shipmentDate(),
      returnDate: returnDate(),
      workflow: {
        status: 'orderFulfilled',
        workflow: ['orderCreated', 'orderPicking', 'orderPacking']
      },
      items: packedItemsList(num())
    }
  })
);
