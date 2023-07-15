import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import mockCollection from "@reactioncommerce/api-utils/tests/mockCollection.js";
import ReactionError from "@reactioncommerce/reaction-error";
import surchargeByIdQuery from "./surchargeById.js";

const fakeShopId = "FAKE_SHOP_ID";
const fakeSurchargeId = "FAKE_SURCHARGE_ID";
const mockSurcharge = { _id: fakeSurchargeId };
mockContext.validatePermissions = jest.fn("validatePermissions");
mockContext.collections.Surcharges = mockCollection("Surcharges");

beforeEach(() => {
  jest.resetAllMocks();
});

test("returns the surcharge if validatePermission returns true", async () => {
  mockContext.collections.Surcharges.findOne.mockReturnValueOnce(Promise.resolve(mockSurcharge));
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(undefined));
  const result = await surchargeByIdQuery(mockContext, { surchargeId: fakeSurchargeId, shopId: fakeShopId });

  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:surcharges",
    "read",
    { shopId: fakeShopId }
  );
  expect(mockContext.collections.Surcharges.findOne).toHaveBeenCalledWith({ _id: fakeSurchargeId, shopId: fakeShopId });
  await expect(result).toBe(mockSurcharge);
});


test("throws access-denied if not allowed", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  const result = surchargeByIdQuery(mockContext, { surchargeId: fakeSurchargeId, shopId: fakeShopId });
  const expectedResult = new ReactionError("access-denied", "Access Denied");
  await expect(result).rejects.toThrow(expectedResult);
});
