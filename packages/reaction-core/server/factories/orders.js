var randomProcesssor = function() {
  return _.sample(['Stripe', 'Paypal', 'Braintree']);
};

var randomStatus = function() {
  return _.sample([
    'created',
    'approved',
    'failed',
    'canceled',
    'expired',
    'pending',
    'voided',
    'settled']);
};

var randomMode = function() {
  return _.sample(['authorize', 'capture', 'refund', 'void']);
};

var paymentMethod = function(doc) {
  return {
    processor: doc.processor ? doc.processor : randomProcesssor(),
    storedCard: doc.storedCard ? doc.storedCard : '4242424242424242',
    transactionId: doc.transactionId ? doc.transactionId : Random.id(),
    status: doc.status ? doc.status : randomStatus(),
    mode: doc.mode ? doc.mode : randomMode(),
    authorization: 'auth field',
    amount: doc.amount ? doc.amount : _.sample([1.00, 0.99, 100, 123.23])
  };
};

Factory.define('order', ReactionCore.Collections.Orders, {
  // Schemas.OrderItems
  additionalField: Fake.sentence(2),
  status: Fake.sentence(3),
  history: [],
  documents: [],
  
  // Schemas.Order
  cartId: Factory.get('cart'),
  notes: [],
  
  // Schemas.Cart
  shopId: Random.id(),
  userId: Random.id(),
  sessions: ['Session'],
  email: Fake.email,
  items: [
    {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      quantity: _.random(1, 5),
      variants: {
        _id: Random.id(),
        compareAtPrice: _.random(0, 1000),
        weight: _.random(0, 10),
        inventoryManagement: true,
        inventoryPolicy: false,
        lowInventoryWarningThreshold: 1,
        inventoryQuantity: _.random(0, 100),
        price: _.random(10, 1000),
        optionTitle: Fake.word(),
        title: Fake.word(),
        sku: _.random(0, 6),
        taxable: true,
        metafields: [
          {
            key: Fake.word(),
            value: Fake.word(),
            scope: "detail"
          }, {
            key: "facebook",
            value: Fake.paragraph(),
            scope: "socialMessages"
          }, {
            key: "twitter",
            value: Fake.sentence(),
            scope: "socialMessages"
          }
        ]
      }
    }, {
      _id: Random.id(),
      productId: Random.id(),
      shopId: Random.id(),
      quantity: _.random(1, 5),
      variants: {
        _id: Random.id(),
        compareAtPrice: _.random(0, 1000),
        weight: _.random(0, 10),
        inventoryManagement: true,
        inventoryPolicy: false,
        lowInventoryWarningThreshold: 1,
        inventoryQuantity: _.random(0, 100),
        price: _.random(10, 1000),
        optionTitle: Fake.word(),
        title: Fake.word(),
        sku: _.random(0, 6),
        taxable: true,
        metafields: [
          {
            key: Fake.word(),
            value: Fake.word(),
            scope: "detail"
          }, {
            key: "facebook",
            value: Fake.paragraph(),
            scope: "socialMessages"
          }, {
            key: "twitter",
            value: Fake.sentence(),
            scope: "socialMessages"
          }
        ]
      }
    }
  ],
  requiresShipping: true,
  shipping: {}, // Shipping Schema
  payment: {},  // Payment Schema
  totalPrice: _.random(1, 1000),
  state: 'new',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Calls paymentMethod() factory helper
Factory.define('authorizedApprovedPaypalOrder', ReactionCore.Collections.Orders,
  Factory.extend('order', {
  payment: {
    paymentMethod: paymentMethod({
      processor: 'Paypal',
      mode: 'authorize',
      status: 'approved'
    })
  }
}));
