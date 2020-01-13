import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import shopAdministratorsQuery from "./shopAdministrators.js";

const fakeShopId = "FAKE_SHOP_ID_ADMIN_QUERY";

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if permission check fails", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  await expect(shopAdministratorsQuery(mockContext, fakeShopId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:shops:FAKE_SHOP_ID_ADMIN_QUERY",
    "read",
    { shopId: fakeShopId, legacyRoles: ["owner", "admin"] }
  );
});

test("returns accounts cursor if user has permission", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.users.find.mockReturnValueOnce({
    toArray: () => Promise.resolve([{ _id: "user1" }, { _id: "user2" }])
  });
  mockContext.collections.Accounts.find.mockReturnValueOnce("CURSOR");
  const result = await shopAdministratorsQuery(mockContext, fakeShopId);
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:shops:FAKE_SHOP_ID_ADMIN_QUERY",
    "read",
    { shopId: fakeShopId, legacyRoles: ["owner", "admin"] }
  );
  expect(mockContext.collections.Accounts.find).toHaveBeenCalledWith({ _id: { $in: ["user1", "user2"] } });
  expect(result).toBe("CURSOR");
});
