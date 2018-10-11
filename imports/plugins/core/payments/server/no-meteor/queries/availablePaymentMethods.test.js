import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import query from "./availablePaymentMethods";

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

test("throws if shop not found", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockShopById.mockReturnValueOnce();

  await expect(query(mockContext, "nonexistent-shop-id")).rejects.toThrowErrorMatchingSnapshot();
  expect(mockShopById).toHaveBeenCalledWith(mockContext, "nonexistent-shop-id");
});

test("returns empty array when shop has no valid payment methods", async () => {
  mockShopById.mockReturnValueOnce(fakeShop);
  mockContext.userHasPermission.mockReturnValueOnce(true);

  const result = await query(mockContext, mockContext.shopId);
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(result).toEqual([]);
});

test("returns available payment methods for a shop", async () => {
  mockShopById.mockReturnValueOnce(fakeShop);
  mockContext.userHasPermission.mockReturnValueOnce(true);
  fakeShop.availablePaymentMethods.push("mockPaymentMethod");

  const result = await query(mockContext, mockContext.shopId);
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(result).toEqual([{
    name: "mock",
    displayName: "Mock!",
    isEnabled: true
  }]);
});
