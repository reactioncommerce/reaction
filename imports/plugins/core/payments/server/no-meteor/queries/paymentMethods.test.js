import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import paymentMethodsQuery from "./paymentMethods";

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
  mockShopById.mockReturnValueOnce(fakeShop);
  mockContext.userHasPermission.mockReturnValueOnce(false);

  await expect(paymentMethodsQuery(mockContext, mockContext.shopId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["owner", "admin"], mockContext.shopId);
});

test("returns all payment methods for a shop", async () => {
  mockShopById.mockReturnValueOnce(fakeShop);
  mockContext.userHasPermission.mockReturnValueOnce(true);

  const result = await paymentMethodsQuery(mockContext, mockContext.shopId);
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(result).toEqual([{
    name: "mock",
    displayName: "Mock!",
    isEnabled: false
  }]);
});
