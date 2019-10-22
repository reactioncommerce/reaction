import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import removeAccountFromGroup from "./removeAccountFromGroup.js";

mockContext.mutations.removeAccountFromGroup = jest.fn().mockName("mutations.removeAccountFromGroup");

test("correctly passes through to internal mutation function", async () => {
  const accountId = encodeAccountOpaqueId("1");
  const groupId = encodeGroupOpaqueId("g2");

  // Removing a customer from a group defaults them the the "customer" group
  const group = { name: "customer" };
  const fakeResult = { _id: "g1", ...group };

  mockContext.mutations.removeAccountFromGroup.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await removeAccountFromGroup(null, {
    input: {
      accountId,
      groupId,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.removeAccountFromGroup).toHaveBeenCalledWith(
    mockContext,
    { accountId: "1", groupId: "g2" }
  );

  expect(result).toEqual({
    group: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
