import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import applyOffersToCart from "./applyOfersToCart.js";

test("when the cart value is over $100, apply a 10% discount", () => {
  const cart = {
    subtotal: {
      amount: 200
    }
  };
  const context = mockContext;
  const results = applyOffersToCart(context, cart);
  return results;
});
