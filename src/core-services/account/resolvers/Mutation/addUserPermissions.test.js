import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import addUserPermissions from "./addUserPermissions.js";
import setUserPermissions from "./setUserPermissions.js";

jest.mock("./setUserPermissions.js");
test("addUserPermissionsTests correctly passes through to internal setUserPermissions resolver function", async () => {
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

  setUserPermissions.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await addUserPermissions(null, {
    input: {
      groups
    }
  }, mockContext);

  expect(setUserPermissions).toHaveBeenCalledWith(
    null, {
      input: {
        groups: ["test-group-id"]
      }
    },
    mockContext
  );

  expect(result).toEqual(fakeResult);
});
