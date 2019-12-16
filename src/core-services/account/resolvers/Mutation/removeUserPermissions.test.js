import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import removeUserPermissions from "./removeUserPermissions.js";

mockContext.mutations.removeUserPermissions = jest.fn().mockName("mutations.removeUserPermissions");
mockContext.validatePermissions = jest.fn().mockName("validatePermissions");

test("removeUserPermissions must correctly passes through to internal removeUserPermissions mutation function", async () => {
  const groups = ["test-group-id"];
  const clientMutationId = "SOME_CLIENT_MUTATION_ID";
  const accountId = "3vx5cqBZsymCfHbpf";
  const shopId = "test-shop-id";
  const shopIdOpaque = encodeOpaqueId("reaction/shop", shopId);
  const accountIdOpaque = encodeOpaqueId("reaction/account", accountId);

  const fakeResult = {
    account: {
      _id: accountId,
      acceptsMarketing: false,
      createdAt: "2019-11-05T16:34:49.644Z",
      emails: [
        {
          address: "admin@localhost",
          verified: true,
          provides: "default"
        }
      ],
      shopId,
      state: "new",
      userId: "3vx5cqBZsymCfHbpf",
      accountId: "3vx5cqBZsymCfHbpf",
      groups: [
        "test-group-id"
      ]
    },
    clientMutationId
  };

  mockContext.mutations.removeUserPermissions.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await removeUserPermissions(null, {
    input: {
      groups,
      clientMutationId,
      shopId: shopIdOpaque,
      accountId: accountIdOpaque
    }
  }, mockContext);

  expect(mockContext.mutations.removeUserPermissions).toHaveBeenCalledWith(
    mockContext,
    {
      groups: ["test-group-id"],
      accountId,
      clientMutationId,
      shopId
    }
  );

  expect(result).toEqual(fakeResult);
});
