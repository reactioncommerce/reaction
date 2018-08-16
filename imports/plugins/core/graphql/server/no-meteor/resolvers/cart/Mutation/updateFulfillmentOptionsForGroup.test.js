import updateFulfillmentOptionsForGroup from "./updateFulfillmentOptionsForGroup";

const internalCartId = "555";
const opaqueCartId = "cmVhY3Rpb24vY2FydDo1NTU=";
const internalFulfillmentGroupId = "888";
const opaqueFulfillmentGroupId = "cmVhY3Rpb24vZnVsZmlsbG1lbnRHcm91cDo4ODg=";
const cartToken = "TOKEN";

test("correctly passes through to mutations.fulfillment.updateFulfillmentOptionsForGroup", async () => {
  const fakeResult = {
    cart: { _id: "123" }
  };

  const mockMutation = jest.fn().mockName("mutations.fulfillment.updateFulfillmentOptionsForGroup");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      fulfillment: {
        updateFulfillmentOptionsForGroup: mockMutation
      }
    }
  };

  const result = await updateFulfillmentOptionsForGroup(null, {
    input: {
      cartId: opaqueCartId,
      cartToken,
      clientMutationId: "clientMutationId",
      fulfillmentGroupId: opaqueFulfillmentGroupId
    }
  }, context);

  expect(result).toEqual({
    ...fakeResult,
    clientMutationId: "clientMutationId"
  });

  expect(mockMutation).toHaveBeenCalledWith(context, {
    cartId: internalCartId,
    cartToken,
    fulfillmentGroupId: internalFulfillmentGroupId
  });
});
