import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import Factory from "../tests/factory.js";
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

test("throws if permission check fails", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });
  mockShopById.mockReturnValueOnce(fakeShop);

  await expect(query(mockContext, mockContext.shopId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    `reaction:legacy:shops:${mockContext.shopId}`,
    "read",
    { shopId: mockContext.shopId }
  );
});

test("throws if shop not found", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
  mockShopById.mockReturnValueOnce();

  await expect(query(mockContext, "nonexistent-shop-id")).rejects.toThrowErrorMatchingSnapshot();
  expect(mockShopById).toHaveBeenCalledWith(mockContext, "nonexistent-shop-id");
});

test("returns all payment methods for a shop", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
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
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
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
