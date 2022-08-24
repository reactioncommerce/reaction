import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { registerPluginHandlerForTaxes, getTaxServicesForShop } from "./registration.js";

const fakeShopId = "FAKE_SHOP_ID";

const customRatesTaxService = {
  displayName: "Custom Rates",
  name: "custom-rates",
  functions: {
    calculateOrderTaxes() { },
    getTaxCodes() { }
  }
};

const rapidTaxService = {
  displayName: "RapidTaxService",
  name: "rapid-tax-service",
  functions: {
    calculateOrderTaxes() { },
    getTaxCodes() { }
  }
};

// test pluginTaxServices
const pluginTaxServices = [{
  name: "rapid-tax-service",
  taxServices: [rapidTaxService]
}, {
  name: "custom-rates",
  taxServices: [customRatesTaxService]
}];

pluginTaxServices.forEach(({ name, taxServices }) => {
  registerPluginHandlerForTaxes({ name, taxServices });
});

mockContext.queries.appSettings = jest.fn().mockName("context.queries.appSettings");

test("returns object containing primary tax service when available", async () => {
  mockContext.queries.appSettings.mockReturnValueOnce({
    fallbackTaxServiceName: null,
    primaryTaxServiceName: "custom-rates"
  });
  const result = await getTaxServicesForShop(mockContext, fakeShopId);

  expect(mockContext.queries.appSettings).toHaveBeenCalledWith(mockContext, fakeShopId);
  expect(result.fallbackTaxService).toBe(undefined);
  expect(result.primaryTaxService).toEqual({
    ...customRatesTaxService,
    pluginName: "custom-rates"
  });
});

test("returns an empty object when no primary tax service is found", async () => {
  mockContext.queries.appSettings.mockReturnValueOnce({});
  const result = await getTaxServicesForShop(mockContext, fakeShopId);

  expect(mockContext.queries.appSettings).toHaveBeenCalledWith(mockContext, fakeShopId);
  expect(result).toEqual({});
});

test("returns object containing both primary and fallback tax service when both are available", async () => {
  mockContext.queries.appSettings.mockReturnValueOnce({
    fallbackTaxServiceName: "rapid-tax-service",
    primaryTaxServiceName: "custom-rates"
  });
  const result = await getTaxServicesForShop(mockContext, fakeShopId);

  expect(mockContext.queries.appSettings).toHaveBeenCalledWith(mockContext, fakeShopId);
  expect(result.fallbackTaxService).toEqual({
    ...rapidTaxService,
    pluginName: "rapid-tax-service"
  });
  expect(result.primaryTaxService).toEqual({
    ...customRatesTaxService,
    pluginName: "custom-rates"
  });
});
