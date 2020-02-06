import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import groupsQuery from "./groups.js";

const fakeShopId = "FAKE_SHOP_ID";
mockContext.validatePermissions = jest.fn("validatePermissions");


beforeEach(() => {
  jest.resetAllMocks();
});

test("returns the groups cursor if userHasPermission returns true", async () => {
  mockContext.collections.Groups.find.mockReturnValueOnce("CURSOR");
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  const result = await groupsQuery(mockContext, fakeShopId);

  expect(mockContext.collections.Groups.find).toHaveBeenCalledWith({ shopId: fakeShopId });
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:groups",
    "read",
    { shopId: fakeShopId }
  );
  expect(result).toBe("CURSOR");
});


test("throws access-denied if not allowed", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  const result = groupsQuery(mockContext, fakeShopId);
  return expect(result).rejects.toThrowErrorMatchingSnapshot();
});
