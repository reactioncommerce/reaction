import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import setUserPermissions from "./setUserPermissions.js";

mockContext.mutations.setUserPermissions = jest.fn().mockName("mutations.setUserPermissions");

const mockAccountId = "MockAccountId";
const mockClientMutationTd = "SOME_CLIENT_MUTATION_ID";

test("correctly passes through to internal mutation function", async () => {
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

  mockContext.mutations.setUserPermissions.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await setUserPermissions(null, {
    input: {
      groups,
      shopId: shopIdOpaque,
      accountId: accountIdOpaque,
      clientMutationId: mockClientMutationTd
    }
  }, mockContext);

  expect(mockContext.mutations.setUserPermissions).toHaveBeenCalledWith(
    mockContext,
    expect.objectContaining({
      groups: ["test-group-id"],
      accountId: mockAccountId,
      shopId
    })
  );

  expect(result).toEqual({ account: fakeResult, clientMutationId: mockClientMutationTd });
});
