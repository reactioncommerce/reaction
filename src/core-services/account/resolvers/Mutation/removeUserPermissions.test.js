import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import removeUserPermissions from "./removeUserPermissions.js";

mockContext.mutations.removeUserPermissions = jest.fn().mockName("mutations.removeUserPermissions");
mockContext.validatePermissions = jest.fn().mockName("validatePermissions");

test("removeUserPermissions must correctly passes through to internal removeUserPermissions mutation function", async () => {
  const groups = ["test-group-id"];
  const clientMutationId = "SOME_CLIENT_MUTATION_ID";

  const fakeResult = {
    _id: "3vx5cqBZsymCfHbpf",
    acceptsMarketing: false,
    createdAt: "2019-11-05T16:34:49.644Z",
    emails: [
      {
        address: "admin@localhost",
        verified: true,
        provides: "default"
      }
    ],
    shopId: "test-shop-id",
    state: "new",
    userId: "3vx5cqBZsymCfHbpf",
    accountId: "3vx5cqBZsymCfHbpf",
    groups: [
      "test-group-id"
    ]
  };

  mockContext.mutations.removeUserPermissions.mockReturnValueOnce(Promise.resolve(fakeResult));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve({ allow: true }));

  const result = await removeUserPermissions(null, {
    input: {
      groups, clientMutationId
    }
  }, mockContext);

  expect(mockContext.mutations.removeUserPermissions).toHaveBeenCalledWith(
    mockContext,
    { groups: ["test-group-id"], clientMutationId }
  );

  expect(mockContext.validatePermissions).toHaveBeenCalledWith("reaction:accounts", "delete", { });

  expect(result).toEqual(fakeResult);
});
