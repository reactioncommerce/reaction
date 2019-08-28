import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import mockContext from "/imports/test-utils/helpers/mockContext";
import addAccountToGroup from "./addAccountToGroup";

mockContext.mutations.addAccountToGroup = jest.fn().mockName("mutations.addAccountToGroup");

test("correctly passes through to internal mutation function", async () => {
  const accountId = encodeAccountOpaqueId("1");
  const groupId = encodeGroupOpaqueId("g1");
  const group = { name: "customer" };

  const fakeResult = { _id: "g1", ...group };

  mockContext.mutations.addAccountToGroup.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await addAccountToGroup(null, {
    input: {
      accountId,
      groupId,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.addAccountToGroup).toHaveBeenCalledWith(mockContext, { accountId: "1", groupId: "g1" });

  expect(result).toEqual({
    group: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
