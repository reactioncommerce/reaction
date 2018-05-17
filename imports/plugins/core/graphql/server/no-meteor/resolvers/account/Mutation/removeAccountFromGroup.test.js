import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import removeAccountFromGroup from "./removeAccountFromGroup";

test("correctly passes through to group/removeUser method", () => {
  const accountId = encodeAccountOpaqueId("1");
  const groupId = encodeGroupOpaqueId("g2");

  // Removing a customer from a group defaults them the the "customer" group
  const group = { name: "customer" };
  const fakeResult = { _id: "g1", ...group };

  const mockMethod = jest.fn().mockName("group/removeUser method");
  mockMethod.mockReturnValueOnce(fakeResult);
  const context = {
    callMeteorMethod: mockMethod
  };

  const result = removeAccountFromGroup(null, {
    input: {
      accountId,
      groupId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(mockMethod).toHaveBeenCalledWith("group/removeUser", "1", "g2");

  expect(result).toEqual({
    group: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
