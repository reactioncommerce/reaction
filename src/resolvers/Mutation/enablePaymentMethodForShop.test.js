import enablePaymentMethodForShop from "./enablePaymentMethodForShop.js";

const internalShopId = "555";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDo1NTU=";

test("correctly passes through to mutations.enablePaymentMethodForShop", async () => {
  const fakeResult = {
    shop: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.enablePaymentMethodForShop");
  mockMutation.mockReturnValueOnce(fakeResult);
  const context = {
    mutations: {
      enablePaymentMethodForShop: mockMutation
    }
  };

  const result = await enablePaymentMethodForShop(null, {
    input: {
      shopId: opaqueShopId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    paymentMethods: { ...fakeResult },
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    shopId: internalShopId,
    clientMutationId: "clientMutationId"
  });
});
