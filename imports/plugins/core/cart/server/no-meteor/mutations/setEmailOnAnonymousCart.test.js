import mockContext from "/imports/test-utils/helpers/mockContext";
import setEmailOnAnonymousCart from "./setEmailOnAnonymousCart";

const dbCart = {
  _id: "cartId"
};
const email = "email@address.com";
const token = "TOKEN";
const hashedToken = "+YED6SF/CZIIVp0pXBsnbxghNIY2wmjIVLsqCG4AN80=";

test("sets the email address on an anonymous cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve(dbCart));

  const result = await setEmailOnAnonymousCart(mockContext, {
    cartId: "cartId",
    email,
    token
  });

  expect(mockContext.collections.Cart.updateOne).toHaveBeenCalledWith({
    _id: "cartId",
    anonymousAccessToken: hashedToken
  }, {
    $set: { email }
  });

  expect(mockContext.collections.Cart.findOne).toHaveBeenCalledWith({ _id: "cartId" });

  expect(result).toEqual({
    cart: dbCart
  });
});
