import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import setUserPermissions from "./setUserPermissions.js";

mockContext.mutations.setUserPermissions = jest.fn().mockName("mutations.setUserPermissions");
mockContext.validatePermissions = jest.fn().mockName("validatePermissions");

test("correctly passes through to internal mutation function", async () => {
  const permissions = ["perm1", "perm2"];
  const group = "test=group";

  const fakeResult = ["perm1", "perm2"];

  mockContext.mutations.setUserPermissions.mockReturnValueOnce(Promise.resolve(fakeResult));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve({ allow: true }));

  const result = await setUserPermissions(null, {
    input: {
      group,
      permissions
    }
  }, mockContext);

  expect(mockContext.mutations.setUserPermissions).toHaveBeenCalledWith(
    mockContext,
    { permissions: ["perm1", "perm2"], group: "test=group" }
  );

  expect(result).toEqual({
    account: fakeResult
  });
});
