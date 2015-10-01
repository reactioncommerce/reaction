/**
* Cart Factory
* @summary define cart Factory
*/

Factory.define("cart", ReactionCore.Collections.Cart, {
  shopId: Factory.get("shop"),
  userId: Factory.get("user"),
  sessionId: Random.id(),
  email: faker.internet.email(),
  items: [
    faker.reaction.cartItem(),
    faker.reaction.cartItem()
  ],
  requiresShipping: true,
  shipping: {},
  payment: {},
  totalPrice: _.random(1, 1000),
  state: "new",
  createdAt: faker.date.past(),
  updatedAt: new Date()
});
