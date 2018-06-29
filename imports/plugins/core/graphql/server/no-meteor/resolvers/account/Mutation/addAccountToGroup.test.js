import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import addAccountToGroup from "./addAccountToGroup";

test("correctly passes through to group/addUser method", () => {
  const accountId = encodeAccountOpaqueId("1");
  const groupId = encodeGroupOpaqueId("g1");
  const group = { name: "customer" };

  const fakeResult = { _id: "g1", ...group };

  const mockMethod = jest.fn().mockName("group/addUser method");
  mockMethod.mockReturnValueOnce(fakeResult);
  const context = {
    callMeteorMethod: mockMethod
  };

  const result = addAccountToGroup(null, {
    input: {
      accountId,
      groupId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(mockMethod).toHaveBeenCalledWith("group/addUser", "1", "g1");

  expect(result).toEqual({
    group: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
