import Factory from "/imports/test-utils/helpers/factory";
import availablePaymentMethodsQuery from "./availablePaymentMethods";
import mockContext from "/imports/test-utils/helpers/mockContext";

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

test("returns empty array when shop has no valid payment methods", async () => {
  mockShopById.mockReturnValueOnce(fakeShop);
  mockContext.userHasPermission.mockReturnValueOnce(true);

  const result = await availablePaymentMethodsQuery(mockContext, mockContext.shopId);
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(result).toEqual([]);
});

test("returns available payment methods for a shop", async () => {
  mockShopById.mockReturnValueOnce(fakeShop);
  mockContext.userHasPermission.mockReturnValueOnce(true);
  fakeShop.availablePaymentMethods.push("mockPaymentMethod");

  const result = await availablePaymentMethodsQuery(mockContext, mockContext.shopId);
  expect(mockShopById).toHaveBeenCalledWith(mockContext, mockContext.shopId);
  expect(result).toEqual([{
    name: "mock",
    displayName: "Mock!",
    isEnabled: true
  }]);
});
