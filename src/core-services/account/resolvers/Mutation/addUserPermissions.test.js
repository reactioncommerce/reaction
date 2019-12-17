import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import addUserPermissions from "./addUserPermissions.js";

mockContext.mutations.addUserPermissions = jest.fn().mockName("mutations.addUserPermissions");

const mockAccountId = "MockAccountId";
const mockClientMutationTd = "SOME_CLIENT_MUTATION_ID";

test("addUserPermissions correctly passes through to internal mutation function", async () => {
  const groups = ["test-group-id"];
  const shopId = "test-shop-id";
  const shopIdOpaque = encodeOpaqueId("reaction/shop", shopId);
  const accountIdOpaque = encodeOpaqueId("reaction/account", mockAccountId);
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
    shopId,
    state: "new",
    userId: "3vx5cqBZsymCfHbpf",
    accountId: "3vx5cqBZsymCfHbpf",
    groups: [
      "test-group-id"
    ]
  };

  mockContext.mutations.addUserPermissions.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await addUserPermissions(null, {
    input: {
      groups,
      shopId: shopIdOpaque,
      accountId: accountIdOpaque,
      clientMutationId: mockClientMutationTd
    }
  }, mockContext);

  expect(mockContext.mutations.addUserPermissions).toHaveBeenCalledWith(
    mockContext,
    expect.objectContaining({
      groups: ["test-group-id"],
      accountId: mockAccountId,
      shopId
    })
  );

  expect(result).toEqual({ account: fakeResult, clientMutationId: mockClientMutationTd });
});
