import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import addCartItems from "./addCartItems.js";

jest.mock("../util/addCartItems", () => jest.fn().mockImplementation(() => Promise.resolve({
  incorrectPriceFailures: [],
  minOrderQuantityFailures: [],
  updatedItemList: []
})));

const items = [{
  productConfiguration: {
    productId: "444",
    productVariantId: "555"
  },
  quantity: 1
}];

beforeAll(() => {
  if (!mockContext.mutations.saveCart) {
    mockContext.mutations.saveCart = jest.fn().mockName("context.mutations.saveCart").mockImplementation(async (_, cart) => cart);
  }
});

test("add an item to an existing anonymous cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "cartId",
    items: []
  }));

  const result = await addCartItems(mockContext, {
    cartId: "cartId",
    items,
    token: "TOKEN"
  });

  expect(result).toEqual({
    cart: {
      _id: "cartId",
      items: [],
      updatedAt: jasmine.any(Date)
    },
    incorrectPriceFailures: [],
    minOrderQuantityFailures: []
  });
});
