import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import rolesQuery from "./roles.js";

beforeEach(() => {
  jest.resetAllMocks();
});

mockContext.shopId = "SHOP_ID";

test("throws if permission check fails", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  await expect(rolesQuery(mockContext, mockContext.shopId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    `reaction:legacy:shops:${mockContext.shopId}`,
    "read",
    { shopId: mockContext.shopId }
  );
});

test("returns roles cursor if user has permission", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.roles.find.mockReturnValueOnce("CURSOR");
  const result = await rolesQuery(mockContext, mockContext.shopId);
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    `reaction:legacy:shops:${mockContext.shopId}`,
    "read",
    { shopId: mockContext.shopId }
  );
  expect(mockContext.collections.roles.find).toHaveBeenCalledWith({});
  expect(result).toBe("CURSOR");
});
