import Factory from "/imports/test-utils/helpers/factory";
import PluginFactory from "../test-util/factory.js";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getFulfillmentGroupTaxes from "./getFulfillmentGroupTaxes.js";
import { rewire$getTaxServicesForShop, restore as restoreRegistration } from "../registration";

const orderItem = Factory.CommonOrderItem.makeOne();

const order = Factory.CommonOrder.makeOne({
  items: [orderItem]
});
delete order._id; // There is a bug where Factory package adds _id even if it isn't in the schema

const getTaxServicesForShopMock = jest.fn().mockName("getTaxServicesForShop");

beforeAll(() => {
  rewire$getTaxServicesForShop(getTaxServicesForShopMock);
});

afterAll(() => {
  restoreRegistration();
});

test("no registered tax services, do not force zeroes", async () => {
  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({}));

  const result = await getFulfillmentGroupTaxes(mockContext, {
    forceZeroes: false,
    order
  });

  expect(result).toEqual({ itemTaxes: [], taxSummary: null });
});

test("no registered tax services, force zeroes", async () => {
  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({}));

  const result = await getFulfillmentGroupTaxes(mockContext, {
    forceZeroes: true,
    order
  });

  expect(result).toEqual({
    taxSummary: {
      calculatedAt: jasmine.any(Date),
      tax: 0,
      taxableAmount: 0,
      taxes: []
    },
    itemTaxes: [
      { itemId: orderItem._id, tax: 0, taxableAmount: 0, taxes: [] }
    ]
  });
});

test("null result from primary tax service, no fallback, do not force zeroes", async () => {
  const calculateOrderTaxes = jest.fn().mockName("calculateOrderTaxes").mockReturnValueOnce(Promise.resolve(null));

  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({
    primaryTaxService: {
      displayName: "Primary Tax Service",
      name: "primary-tax-service-mock",
      functions: {
        calculateOrderTaxes
      }
    }
  }));

  const result = await getFulfillmentGroupTaxes(mockContext, {
    forceZeroes: false,
    order
  });

  expect(result).toEqual({ itemTaxes: [], taxSummary: null });
});

test("null result from primary tax service, no fallback, force zeroes", async () => {
  const calculateOrderTaxes = jest.fn().mockName("calculateOrderTaxes").mockReturnValueOnce(Promise.resolve(null));

  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({
    primaryTaxService: {
      displayName: "Primary Tax Service",
      name: "primary-tax-service-mock",
      functions: {
        calculateOrderTaxes
      }
    }
  }));

  const result = await getFulfillmentGroupTaxes(mockContext, {
    forceZeroes: true,
    order
  });

  expect(result).toEqual({
    taxSummary: {
      calculatedAt: jasmine.any(Date),
      tax: 0,
      taxableAmount: 0,
      taxes: []
    },
    itemTaxes: [
      { itemId: orderItem._id, tax: 0, taxableAmount: 0, taxes: [] }
    ]
  });
});

test("null result from both tax services, do not force zeroes", async () => {
  const calculateOrderTaxes = jest.fn().mockName("calculateOrderTaxes").mockReturnValueOnce(Promise.resolve(null));
  const fallbackCalculateOrderTaxes = jest.fn().mockName("fallbackCalculateOrderTaxes").mockReturnValueOnce(Promise.resolve(null));

  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({
    fallbackTaxService: {
      displayName: "Fallback Tax Service",
      name: "fallback-tax-service-mock",
      functions: {
        calculateOrderTaxes: fallbackCalculateOrderTaxes
      }
    },
    primaryTaxService: {
      displayName: "Primary Tax Service",
      name: "primary-tax-service-mock",
      functions: {
        calculateOrderTaxes
      }
    }
  }));

  const result = await getFulfillmentGroupTaxes(mockContext, {
    forceZeroes: false,
    order
  });

  expect(result).toEqual({ itemTaxes: [], taxSummary: null });
});

test("null result from both tax services, force zeroes", async () => {
  const calculateOrderTaxes = jest.fn().mockName("calculateOrderTaxes").mockReturnValueOnce(Promise.resolve(null));
  const fallbackCalculateOrderTaxes = jest.fn().mockName("fallbackCalculateOrderTaxes").mockReturnValueOnce(Promise.resolve(null));

  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({
    fallbackTaxService: {
      displayName: "Fallback Tax Service",
      name: "fallback-tax-service-mock",
      functions: {
        calculateOrderTaxes: fallbackCalculateOrderTaxes
      }
    },
    primaryTaxService: {
      displayName: "Primary Tax Service",
      name: "primary-tax-service-mock",
      functions: {
        calculateOrderTaxes
      }
    }
  }));

  const result = await getFulfillmentGroupTaxes(mockContext, {
    forceZeroes: true,
    order
  });

  expect(result).toEqual({
    taxSummary: {
      calculatedAt: jasmine.any(Date),
      tax: 0,
      taxableAmount: 0,
      taxes: []
    },
    itemTaxes: [
      { itemId: orderItem._id, tax: 0, taxableAmount: 0, taxes: [] }
    ]
  });
});

test("minimal result from primary tax service", async () => {
  const taxes = [
    {
      _id: "mockTax",
      customFields: {
        taxesField: "abc123"
      },
      sourcing: "destination",
      tax: 15,
      taxName: "mockTaxName",
      taxRate: 0.05,
      taxableAmount: 90
    }
  ];

  const itemTax = {
    customFields: {
      taxesField: "abc123"
    },
    itemId: orderItem._id,
    tax: 15,
    taxableAmount: 90,
    taxes
  };

  const taxSummary = {
    calculatedAt: new Date(),
    calculatedByTaxServiceName: "primary-tax-service-mock",
    customFields: {
      taxesField: "abc123"
    },
    tax: 15,
    taxableAmount: 90,
    taxes
  };

  const mockResult = PluginFactory.TaxServiceResult.makeOne({
    itemTaxes: [itemTax],
    taxSummary
  });
  delete mockResult._id; // There is a bug where Factory package adds _id even if it isn't in the schema

  const calculateOrderTaxes = jest.fn().mockName("calculateOrderTaxes").mockReturnValueOnce(Promise.resolve(mockResult));

  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({
    primaryTaxService: {
      displayName: "Primary Tax Service",
      name: "primary-tax-service-mock",
      functions: {
        calculateOrderTaxes
      }
    }
  }));

  const result = await getFulfillmentGroupTaxes(mockContext, {
    forceZeroes: false,
    order
  });

  expect(result).toEqual({
    itemTaxes: [itemTax],
    taxSummary
  });
});

test("null result from primary tax service, minimal result from fallback tax service", async () => {
  const taxes = [
    {
      _id: "mockTax",
      sourcing: "destination",
      tax: 15,
      taxName: "mockTaxName",
      taxRate: 0.05,
      taxableAmount: 90
    }
  ];

  const itemTax = {
    itemId: orderItem._id,
    tax: 15,
    taxableAmount: 90,
    taxes
  };

  const taxSummary = {
    calculatedAt: new Date(),
    calculatedByTaxServiceName: "primary-tax-service-mock",
    tax: 15,
    taxableAmount: 90,
    taxes
  };

  const mockResult = PluginFactory.TaxServiceResult.makeOne({
    itemTaxes: [itemTax],
    taxSummary
  });
  delete mockResult._id; // There is a bug where Factory package adds _id even if it isn't in the schema

  const calculateOrderTaxes = jest.fn().mockName("calculateOrderTaxes").mockReturnValueOnce(Promise.resolve(null));
  const fallbackCalculateOrderTaxes = jest.fn().mockName("fallbackCalculateOrderTaxes").mockReturnValueOnce(Promise.resolve(mockResult));

  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({
    fallbackTaxService: {
      displayName: "Fallback Tax Service",
      name: "fallback-tax-service-mock",
      functions: {
        calculateOrderTaxes: fallbackCalculateOrderTaxes
      }
    },
    primaryTaxService: {
      displayName: "Primary Tax Service",
      name: "primary-tax-service-mock",
      functions: {
        calculateOrderTaxes
      }
    }
  }));

  const result = await getFulfillmentGroupTaxes(mockContext, {
    forceZeroes: false,
    order
  });

  expect(result).toEqual({
    itemTaxes: [itemTax],
    taxSummary
  });
});

test("throws if the result doesn't match the schema", async () => {
  const taxes = [
    {
      _id: "mockTax",
      tax: 15,
      taxName: "mockTaxName",
      taxRate: 0.05,
      taxableAmount: 90
    }
  ];

  const itemTax = {
    itemId: orderItem._id,
    tax: 15,
    taxableAmount: 90,
    taxes
  };

  const taxSummary = {
    calculatedAt: new Date(),
    calculatedByTaxServiceName: "primary-tax-service-mock",
    tax: 15,
    taxableAmount: 90,
    taxes
  };

  const mockResult = PluginFactory.TaxServiceResult.makeOne({
    itemTaxes: [itemTax],
    taxSummary
  });
  delete mockResult._id; // There is a bug where Factory package adds _id even if it isn't in the schema

  const calculateOrderTaxes = jest.fn().mockName("calculateOrderTaxes").mockReturnValueOnce(Promise.resolve(mockResult));

  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({
    primaryTaxService: {
      displayName: "Primary Tax Service",
      name: "primary-tax-service-mock",
      functions: {
        calculateOrderTaxes
      }
    }
  }));

  const result = getFulfillmentGroupTaxes(mockContext, { forceZeroes: false, order });
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if the calculation function throws", async () => {
  const calculateOrderTaxes = jest.fn().mockName("calculateOrderTaxes").mockImplementationOnce(async () => {
    throw new Error("Internal problem");
  });

  getTaxServicesForShopMock.mockReturnValueOnce(Promise.resolve({
    primaryTaxService: {
      displayName: "Primary Tax Service",
      name: "primary-tax-service-mock",
      functions: {
        calculateOrderTaxes
      }
    }
  }));

  const result = getFulfillmentGroupTaxes(mockContext, { forceZeroes: false, order });
  expect(result).rejects.toThrowErrorMatchingSnapshot();
});
