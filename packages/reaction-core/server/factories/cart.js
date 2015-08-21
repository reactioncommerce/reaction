Fake.reactionCartItem = function() {
  return {
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
      sku: Fake.word(),
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
  };
};

Factory.define('cart', ReactionCore.Collections.Cart, {
  shopId: Factory.get('shop'),
  userId: Random.id(),
  sessions: [Random.id()],
  email: Fake.email,
  items: [
    Fake.reactionCartItem(),
    Fake.reactionCartItem()
  ],
  requiresShipping: true,
  shipping: {},
  payment: {},
  totalPrice: _.random(1, 1000),
  state: 'new',
  createdAt: new Date(),
  updatedAt: new Date()
});
