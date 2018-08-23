import selectFulfillmentOptionForGroup from "./selectFulfillmentOptionForGroup";

const internalCartId = "555";
const opaqueCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const internalFulfillmentGroupId = "888";
const opaqueFulfillmentGroupId = "cmVhY3Rpb24vZnVsZmlsbG1lbnRHcm91cDo4ODg=";
const internalFulfillmentMethodId = "999";
const opaqueFulfillmentMethodId = "cmVhY3Rpb24vZnVsZmlsbG1lbnRNZXRob2Q6OTk5";
const cartToken = "TOKEN";

test("correctly passes through to mutations.fulfillment.selectFulfillmentOptionForGroup", async () => {
  const fakeResult = {
    cart: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.fulfillment.selectFulfillmentOptionForGroup");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      fulfillment: {
        selectFulfillmentOptionForGroup: mockMutation
      }
    }
  };

  const result = await selectFulfillmentOptionForGroup(null, {
    input: {
      cartId: opaqueCartId,
      cartToken,
      clientMutationId: "clientMutationId",
      fulfillmentGroupId: opaqueFulfillmentGroupId,
      fulfillmentMethodId: opaqueFulfillmentMethodId
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    cartId: internalCartId,
    cartToken,
    fulfillmentGroupId: internalFulfillmentGroupId,
    fulfillmentMethodId: internalFulfillmentMethodId
  });
});
