import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import ReactionError from "@reactioncommerce/reaction-error";
import surchargesQuery from "./surcharges.js";

const fakeShopId = "FAKE_SHOP_ID";
mockContext.validatePermissions = jest.fn("validatePermissions");
mockContext.collections.Surcharges = mockCollection("Surcharges");

beforeEach(() => {
  jest.resetAllMocks();
});

test("returns the surcharges cursor if validatePermission returns true", async () => {
  mockContext.collections.Surcharges.find.mockReturnValueOnce(Promise.resolve("CURSOR"));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  const result = await surchargesQuery(mockContext, { shopId: fakeShopId });

  expect(mockContext.collections.Surcharges.find).toHaveBeenCalledWith({ shopId: fakeShopId });
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:surcharges",
    "read",
    { shopId: fakeShopId }
  );
  await expect(result).toBe("CURSOR");
});


test("throws access-denied if not allowed", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  const result = surchargesQuery(mockContext, { shopId: fakeShopId });
  const expectedResult = new ReactionError("access-denied", "Access Denied");
  await expect(result).rejects.toThrow(expectedResult);
});
