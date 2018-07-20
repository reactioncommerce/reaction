import mockContext from "/imports/test-utils/helpers/mockContext";
import addCartItems from "./addCartItems";

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

test("add an item to an existing anonymous cart", async () => {
  mockContext.collections.Cart.findOne.mockReturnValueOnce(Promise.resolve({
    _id: "cartId",
    items: []
  }));

  mockContext.collections.Cart.updateOne.mockReturnValueOnce(Promise.resolve({
    modifiedCount: 1
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
