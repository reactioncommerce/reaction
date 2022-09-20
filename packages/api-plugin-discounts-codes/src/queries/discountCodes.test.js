import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import ReactionError from "@reactioncommerce/reaction-error";
import discountCodes from "./discountCodes.js";

beforeEach(() => {
  jest.resetAllMocks();
});

mockContext.shopId = "SHOP_ID";
mockContext.collections.Discounts = mockCollection("Discounts");

test("throws if permission check fails", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  await expect(discountCodes(mockContext, mockContext.shopId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:discounts",
    "read",
    { shopId: mockContext.shopId }
  );
});

test("returns Discounts cursor if user has permission", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Discounts.find.mockReturnValueOnce("CURSOR");
  const result = await discountCodes(mockContext, mockContext.shopId);
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:discounts",
    "read",
    { shopId: mockContext.shopId }
  );
  expect(mockContext.collections.Discounts.find).toHaveBeenCalledWith({
    shopId: mockContext.shopId
  });
  expect(result).toBe("CURSOR");
});
