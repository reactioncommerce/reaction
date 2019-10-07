import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import setEmailOnAnonymousCart from "./setEmailOnAnonymousCart.js";

const dbCart = {
  _id: "cartId"
};
const email = "email@address.com";
const token = "TOKEN";
const hashedToken = "+YED6SF/CZIIVp0pXBsnbxghNIY2wmjIVLsqCG4AN80=";

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

test("sets the email address on an anonymous cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  const result = await setEmailOnAnonymousCart(mockContext, {
    cartId: "cartId",
    email,
    token
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({
    _id: "cartId",
    anonymousAccessToken: hashedToken
  });

  expect(result).toEqual({
    cart: { ...dbCart, email, updatedAt: jasmine.any(Date) }
  });
});
