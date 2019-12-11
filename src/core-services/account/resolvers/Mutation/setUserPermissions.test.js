import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import setUserPermissions from "./setUserPermissions.js";

mockContext.mutations.setUserPermissions = jest.fn().mockName("mutations.setUserPermissions");
mockContext.validatePermissions = jest.fn().mockName("validatePermissions");

test("correctly passes through to internal mutation function", async () => {
  const groups = ["test-group-id"];

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

  mockContext.mutations.setUserPermissions.mockReturnValueOnce(Promise.resolve(fakeResult));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve({ allow: true }));

  const result = await setUserPermissions(null, {
    input: {
      groups
    }
  }, mockContext);

  expect(mockContext.mutations.setUserPermissions).toHaveBeenCalledWith(
    mockContext,
    { groups: ["test-group-id"] }
  );

  expect(mockContext.validatePermissions).toHaveBeenCalledWith("reaction:accounts", "create", { });

  expect(result).toEqual(fakeResult);
});
