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
  items: [
    faker.reaction.cartItem(),
    faker.reaction.cartItem()
  ],
  requiresShipping: true,
  shipping: [], // Shipping Schema
  billing: [], // Payment Schema
  totalPrice: _.random(1, 1000),
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
    payment: {
      paymentMethod: faker.reaction.order.paymentMethod({
        processor: "Paypal",
        mode: "authorize",
        status: "approved"
      })
    }
  }));
