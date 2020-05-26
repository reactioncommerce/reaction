import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { encodeAccountOpaqueId, encodeGroupOpaqueId } from "../../xforms/id.js";
import updateGroupsForAccounts from "./updateGroupsForAccounts.js";

mockContext.mutations.updateGroupsForAccounts = jest.fn().mockName("mutations.updateGroupsForAccounts");

test("correctly passes through to internal mutation function", async () => {
  const accountIds = [encodeAccountOpaqueId("account1"), encodeAccountOpaqueId("account2")];
  const groupIds = [encodeGroupOpaqueId("g1"), encodeGroupOpaqueId("g2"), encodeGroupOpaqueId("g3")];
  const fakeResult = [
    {
      _id: "account1",
      groups: ["g1", "g2", "g3"]
    },
    {
      _id: "account2",
      groups: ["g1", "g2", "g3"]
    }
  ];

  mockContext.mutations.updateGroupsForAccounts.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await updateGroupsForAccounts(null, {
    input: {
      accountIds,
      groupIds,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.updateGroupsForAccounts).toHaveBeenCalledWith(mockContext, {
    accountIds: ["account1", "account2"],
    groupIds: ["g1", "g2", "g3"]
  });

  expect(result).toEqual({
    accounts: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
