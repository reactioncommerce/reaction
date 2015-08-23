Fake.reactionCartItem = function() {
  return {
    _id: Random.id(),
    productId: Factory.get("product"),
    shopId: Factory.get("shop"),
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
      optionTitle: faker.commerce.productName(),
      title: faker.lorem.words(),
      sku: faker.commerce.product(),
      taxable: true,
      metafields: [
        {
          key: faker.commerce.productAdjective(),
          value: faker.commerce.productMaterial(),
          scope: "detail"
        }, {
          key: "facebook",
          value: faker.lorem.paragraph(),
          scope: "socialMessages"
        }, {
          key: "twitter",
          value: faker.lorem.sentence(),
          scope: "socialMessages"
        }
      ]
    }
  };
};

Factory.define('cart', ReactionCore.Collections.Cart, {
  shopId: Factory.get('shop'),
  userId: Factory.get('user'),
  sessions: [Random.id()],
  email: faker.internet.email(),
  items: [
    Fake.reactionCartItem(),
    Fake.reactionCartItem()
  ],
  requiresShipping: true,
  shipping: {},
  payment: {},
  totalPrice: _.random(1, 1000),
  state: 'new',
  createdAt: faker.date.past(),
  updatedAt: new Date()
});
