import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import setUserPermissions from "./setUserPermissions.js";

mockContext.mutations.setUserPermissions = jest.fn().mockName("mutations.setUserPermissions");

test("correctly passes through to internal mutation function", async () => {
  const groups = ["test-group-id"];
  const shopId = "test-shop-id";
  const shopIdOpaque = encodeOpaqueId("reaction/shop", shopId);
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
      shopId: shopIdOpaque
    }
  }, mockContext);

  expect(mockContext.mutations.setUserPermissions).toHaveBeenCalledWith(
    mockContext,
    {
      groups: ["test-group-id"],
      shopId
    }
  );

  expect(result).toEqual(fakeResult);
});
