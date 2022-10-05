import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import enhanceCart from "./enhanceCart.js";

const testEnhancer = jest.fn().mockImplementation((context, cart) => {
  cart.enhancedCartValue = "test";
});

test("should return the enhanced cart", async () => {
  const cart = {
    _id: "cartId"
  };
  const enhancers = [testEnhancer];
  const enhancedCart = await enhanceCart(mockContext, enhancers, cart);
  expect(enhancedCart).toEqual({ ...cart, enhancedCartValue: "test" });
  expect(testEnhancer).toHaveBeenCalledWith(mockContext, { ...cart, enhancedCartValue: "test" });
});
