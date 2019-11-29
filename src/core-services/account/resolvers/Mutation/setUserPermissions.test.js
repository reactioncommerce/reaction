import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import AddOrRemoveAccountGroupsOperationType from "../../mutations/AddOrRemoveAccountGroupsOperationType";
import setUserPermissions from "./setUserPermissions.js";

mockContext.mutations.addOrRemoveAccountGroups = jest.fn().mockName("mutations.addOrRemoveAccountGroups");
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

  mockContext.mutations.addOrRemoveAccountGroups.mockReturnValueOnce(Promise.resolve(fakeResult));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve({ allow: true }));

  const result = await setUserPermissions(null, {
    input: {
      groups
    }
  }, mockContext);

  expect(mockContext.mutations.addOrRemoveAccountGroups).toHaveBeenCalledWith(
    mockContext,
    { groups: ["test-group-id"] },
    AddOrRemoveAccountGroupsOperationType.ADD_OR_SET
  );

  expect(mockContext.validatePermissions).toHaveBeenCalledWith("reaction:accounts", "create", { });

  expect(result).toEqual(fakeResult);
});
