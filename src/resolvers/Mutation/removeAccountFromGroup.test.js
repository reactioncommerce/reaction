import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { encodeAccountOpaqueId, encodeGroupOpaqueId } from "../../xforms/id.js";
import removeAccountFromGroup from "./removeAccountFromGroup.js";

mockContext.mutations.removeAccountFromGroup = jest.fn().mockName("mutations.removeAccountFromGroup");

test("correctly passes through to internal mutation function", async () => {
  const accountId = encodeAccountOpaqueId("1");
  const groupId = encodeGroupOpaqueId("g1");
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

  expect(mockContext.mutations.removeAccountFromGroup).toHaveBeenCalledWith(mockContext, { accountId: "1", groupId: "g1" });

  expect(result).toEqual({
    group: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
