import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import reconcileCartsKeepAccountCart from "./reconcileCartsKeepAccountCart.js";

const { Cart } = mockContext.collections;
const accountId = "accountId";
const accountCart = { _id: "ACCOUNT_CART", accountId };
const anonymousCartSelector = { _id: "123" };

test("deletes the anonymous cart and returns the account cart", async () => {
  const result = await reconcileCartsKeepAccountCart({
    accountCart,
    anonymousCartSelector,
    Cart
  });

  expect(Cart.deleteOne).toHaveBeenCalledWith(anonymousCartSelector);

  expect(result).toEqual(accountCart);
});

test("throws if deleteOne fails", async () => {
  Cart.deleteOne.mockReturnValueOnce(Promise.resolve({ deletedCount: 0 }));

  const promise = reconcileCartsKeepAccountCart({
    accountCart,
    anonymousCartSelector,
    Cart
  });

  return expect(promise).rejects.toThrowErrorMatchingSnapshot();
});
