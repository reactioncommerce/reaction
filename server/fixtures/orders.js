import faker from "faker";
import ReactionFaker from "./reaction-faker";

/**
 * order factory
 * @summary Factory for generating reaction orders
 */

export default function () {

  Factory.define("order", Orders, {
    // Schemas.OrderItems
    additionalField: faker.lorem.sentence(),
    status: faker.lorem.sentence(3),
    history: [],
    documents: [],

    // Schemas.Order
    cartId: Random.id(),
    notes: [],

    // Schemas.Cart
    shopId: ReactionFaker.order.shopId(),
    userId: ReactionFaker.order.userId(),
    sessionId: "Session",
    email: faker.internet.email(),
    items: function () {
      const product = ReactionFaker.products.add();
      const variant = Products.findOne({ ancestors: [product._id] });
      const childVariants = Products.find({ ancestors: [
        product._id, variant._id
      ] }).fetch();
      const selectedOption = Random.choice(childVariants);
      const product2 = ReactionFaker.products.add();
      const variant2 = Products.findOne({ ancestors: [product2._id] });
      const childVariants2 = Products.find({ ancestors: [
        product2._id, variant2._id
      ] }).fetch();
      const selectedOption2 = Random.choice(childVariants2);
      return [{
        _id: Random.id(),
        shopId: product.shopId,
        productId: product._id,
        quantity: 1,
        variants: selectedOption
      }, {
        _id: Random.id(),
        shopId: product2.shopId,
        productId: product2._id,
        quantity: 1,
        variants: selectedOption2
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
  Factory.define("authorizedApprovedPaypalOrder", Orders,
    Factory.extend("order", {
      billing: [{
        _id: Random.id(),
        address: ReactionFaker.address({isBillingDefault: true}),
        paymentMethod: ReactionFaker.order.paymentMethod({
          processor: "Paypal",
          mode: "authorize",
          status: "approved"
        })
      }]
    }));
}
