import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import shopAdministratorsQuery from "./shopAdministrators.js";

const fakeShopId = "FAKE_SHOP_ID_ADMIN_QUERY";

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if userHasPermission returns false", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  await expect(shopAdministratorsQuery(mockContext, fakeShopId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin"], fakeShopId);
});

test("returns accounts cursor if user has permission", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.users.find.mockReturnValueOnce({
    toArray: () => Promise.resolve([{ _id: "user1" }, { _id: "user2" }])
  });
  mockContext.collections.Accounts.find.mockReturnValueOnce("CURSOR");
  const result = await shopAdministratorsQuery(mockContext, fakeShopId);
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin"], fakeShopId);
  expect(mockContext.collections.Accounts.find).toHaveBeenCalledWith({ _id: { $in: ["user1", "user2"] } });
  expect(result).toBe("CURSOR");
});
