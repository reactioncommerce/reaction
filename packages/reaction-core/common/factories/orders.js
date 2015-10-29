/**
 * order factory
 * @summary Factory for generating reaction orders
 */

Factory.define("order", ReactionCore.Collections.Orders, {
  // Schemas.OrderItems
  additionalField: faker.lorem.sentence(),
  status: faker.lorem.sentence(3),
  history: [],
  documents: [],

  // Schemas.Order
  cartId: Random.id(),
  notes: [],

  // Schemas.Cart
  shopId: faker.reaction.order.shopId(),
  userId: faker.reaction.order.userId(),
  sessionId: "Session",
  email: faker.internet.email(),
  items: function () {
    let product = faker.reaction.products.getProduct();
    let product2 = faker.reaction.products.getProduct();
    return [{
      _id: Random.id(),
      shopId: product.shopId,
      productId: product._id,
      quantity: 1,
      variants: product.variants[0]
    }, {
      _id: Random.id(),
      shopId: product2.shopId,
      productId: product2._id,
      quantity: 1,
      variants: product2.variants[0]
    }];
  },
  requiresShipping: true,
  shipping: [], // Shipping Schema
  billing: [], // Payment Schema
  state: "new",
  createdAt: new Date,
  updatedAt: new Date
});

/**
 * authorizedApprovedPaypalOrder Factory
 * @summary defines order factory which generates an authorized, apporved, paypal order.
 */
Factory.define("authorizedApprovedPaypalOrder", ReactionCore.Collections.Orders,
  Factory.extend("order", {
    billing: [{
      _id: Random.id(),
      address: faker.reaction.address({isBillingDefault: true}),
      paymentMethod: faker.reaction.order.paymentMethod({
        processor: "Paypal",
        mode: "authorize",
        status: "approved"
      })
    }]
  }));
