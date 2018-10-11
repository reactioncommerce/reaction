import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import query from "./paymentMethods";

jest.mock("/imports/plugins/core/core/server/no-meteor/pluginRegistration", () => ({
  paymentMethods: {
    mockPaymentMethod: {
      name: "mock",
      displayName: "Mock!"
    }
  }
}));

const fakeShop = Factory.Shop.makeOne();
const mockShopById = jest.fn().mockName("shopById");

beforeAll(() => {
  mockContext.queries = {
    shopById: mockShopById
  };
});

beforeEach(() => {
  jest.resetAllMocks();
  mockShopById.mockClear();
});

test("throws if userHasPermission returns false", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockShopById.mockReturnValueOnce(fakeShop);

  await expect(query(mockContext, mockContext.shopId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin"], mockContext.shopId);
});

test("throws if shop not found", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockShopById.mockReturnValueOnce();

  await expect(query(mockContext, "nonexistent-shop-id")).rejects.toThrowErrorMatchingSnapshot();
  expect(mockShopById).toHaveBeenCalledWith(mockContext, "nonexistent-shop-id");
});

test("returns all payment methods for a shop", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockShopById.mockReturnValueOnce(fakeShop);

  const result = await query(mockContext, mockContext.shopId);
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(result).toEqual([{
    name: "mock",
    displayName: "Mock!",
    isEnabled: false
  }]);
});
