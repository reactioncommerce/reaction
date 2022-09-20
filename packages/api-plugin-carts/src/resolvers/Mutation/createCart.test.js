import createCart from "./createCart.js";

const shopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const productId = "444";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo0NDQ=";
const productVariantId = "555";
const opaqueProductVariantId = "cmVhY3Rpb24vcHJvZHVjdDo1NTU=";

const items = [{
  productConfiguration: {
    productId: opaqueProductId,
    productVariantId: opaqueProductVariantId
  },
  quantity: 1
}];

test("correctly passes through to mutations.createCart", async () => {
  const fakeResult = {
    cart: {
      _id: "123"
    },
    incorrectPriceFailures: [],
    minOrderQuantityFailures: [],
    token: "TOKEN"
  };

  const mockMutation = jest.fn().mockName("mutations.createCart");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      createCart: mockMutation
    }
  };

  const result = await createCart(null, {
    input: {
      items,
      shopId: opaqueShopId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    items: [{
      productConfiguration: {
        productId,
        productVariantId
      },
      quantity: 1
    }],
    shopId
  });
});
