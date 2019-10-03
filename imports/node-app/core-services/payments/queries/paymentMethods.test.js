import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "/imports/test-utils/helpers/factory"; // TODO: research how to add `factory.js` to `api-utils` (https://github.com/reactioncommerce/reaction/issues/5646)
import query from "./paymentMethods.js";

jest.mock("../registration", () => ({
  paymentMethods: {
    mockPaymentMethod: {
      name: "mockPaymentMethod",
      displayName: "Mock!",
      pluginName: "mock-plugin"
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
  fakeShop.availablePaymentMethods = [];
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
    canRefund: true,
    displayName: "Mock!",
    isEnabled: false,
    name: "mockPaymentMethod",
    pluginName: "mock-plugin"
  }]);
});

test("returns payment methods with correct enabled status", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockShopById.mockReturnValueOnce(fakeShop);
  fakeShop.availablePaymentMethods.push("mockPaymentMethod");

  const result = await query(mockContext, mockContext.shopId);
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(result).toEqual([{
    canRefund: true,
    displayName: "Mock!",
    isEnabled: true,
    name: "mockPaymentMethod",
    pluginName: "mock-plugin"
  }]);
});
