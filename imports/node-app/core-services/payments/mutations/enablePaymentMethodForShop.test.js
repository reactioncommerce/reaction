import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import Factory from "/imports/test-utils/helpers/factory"; // TODO: research how to add `factory.js` to `api-utils` (https://github.com/reactioncommerce/reaction/issues/5646)
import enablePaymentMethodForShop from "./enablePaymentMethodForShop.js";

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
const mockEnablePaymentMethod = jest.fn().mockName("enablePaymentMethodForShop");
const mockPaymentMethods = jest.fn().mockName("paymentMethods");
const mockShopById = jest.fn().mockName("shopById");

beforeAll(() => {
  mockContext.queries = {
    paymentMethods: mockPaymentMethods,
    shopById: mockShopById
  };
  mockContext.mutations = { enablePaymentMethodForShop: mockEnablePaymentMethod };
});

beforeEach(() => {
  jest.resetAllMocks();
  mockShopById.mockClear();
  mockEnablePaymentMethod.mockClear();
  fakeShop.availablePaymentMethods = [];
});

test("throws if userHasPermission returns false", async () => {
  mockContext.userHasPermission.mockReturnValue(false);
  mockShopById.mockReturnValue(fakeShop);

  await expect(enablePaymentMethodForShop(mockContext, {
    shopId: fakeShop._id,
    paymentMethodName: "does not exist",
    isEnabled: true
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("errors on missing arguments", async () => {
  mockContext.userHasPermission.mockReturnValue(true);
  mockShopById.mockReturnValue(fakeShop);

  await expect(enablePaymentMethodForShop(mockContext, {})).rejects.toThrowErrorMatchingSnapshot();
});

test("errors on invalid payment method", async () => {
  mockContext.userHasPermission.mockReturnValue(true);
  mockShopById.mockReturnValue(fakeShop);

  await expect(enablePaymentMethodForShop(mockContext, {
    shopId: fakeShop._id,
    paymentMethodName: "does not exist",
    isEnabled: true
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("errors on invalid shop", async () => {
  mockContext.userHasPermission.mockReturnValue(true);
  mockShopById.mockReturnValue();

  await expect(enablePaymentMethodForShop(mockContext, {
    shopId: "does not exist",
    paymentMethodName: "mockPaymentMethod",
    isEnabled: true
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("enables payment method for valid shop", async () => {
  fakeShop.availablePaymentMethods = ["mockPaymentMethod"];
  mockContext.userHasPermission.mockReturnValue(true);
  mockShopById.mockReturnValue(fakeShop);
  mockPaymentMethods.mockReturnValue([{
    name: "mockPaymentMethod",
    displayName: "Mock!",
    pluginName: "mock-plugin",
    isEnabled: true
  }]);

  await expect(enablePaymentMethodForShop(mockContext, {
    shopId: fakeShop._id,
    paymentMethodName: "mockPaymentMethod",
    isEnabled: true
  })).resolves.toEqual([{
    name: "mockPaymentMethod",
    displayName: "Mock!",
    pluginName: "mock-plugin",
    isEnabled: true
  }]);

  expect(mockPaymentMethods).toHaveBeenCalledWith(mockContext, fakeShop._id);
});

test("disables payment method for valid shop", async () => {
  mockContext.userHasPermission.mockReturnValue(true);
  mockShopById.mockReturnValue(fakeShop);
  mockPaymentMethods.mockReturnValue([{
    name: "mockPaymentMethod",
    displayName: "Mock!",
    pluginName: "mock-plugin",
    isEnabled: false
  }]);

  await expect(enablePaymentMethodForShop(mockContext, {
    shopId: fakeShop._id,
    paymentMethodName: "mockPaymentMethod",
    isEnabled: false
  })).resolves.toEqual([{
    name: "mockPaymentMethod",
    displayName: "Mock!",
    pluginName: "mock-plugin",
    isEnabled: false
  }]);

  expect(mockPaymentMethods).toHaveBeenCalledWith(mockContext, fakeShop._id);
});
