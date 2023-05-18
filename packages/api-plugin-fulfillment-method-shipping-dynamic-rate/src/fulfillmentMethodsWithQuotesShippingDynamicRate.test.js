import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import fulfillmentMethodsWithQuotesShippingDynamicRate from "./fulfillmentMethodsWithQuotesShippingDynamicRate.js";

test("should return previousResults if Shipping is not among FailedRequests", async () => {
  const commonOrder = {
    _id: "order123"
  };
  const previousResults = [
    [], [
      {
        packageName: "some-other-fulfillment-method"
      }
    ]
  ];
  const result = await fulfillmentMethodsWithQuotesShippingDynamicRate(mockContext, commonOrder, previousResults);
  expect(result).toEqual(previousResults);
});


test("should return previousResults if not fulfillment records enabled", async () => {
  const previousResults = [
    [
      {
        carrier: "carrier123",
        handlingPrice: 99,
        rate: 99,
        shippingPrice: 198,
        shopId: "SHOP_ID"
      }
    ], []
  ];
  const commonOrder = {
    _id: "order123"
  };

  mockContext.collections.Fulfillment = {
    find: jest.fn(() => ({ toArray: () => [] }))
  };
  const result = await fulfillmentMethodsWithQuotesShippingDynamicRate(mockContext, commonOrder, previousResults);
  expect(result).toEqual(previousResults);
});


test("should return rates witout error", async () => {
  const previousResults = [
    [
      {
        carrier: "Shipping",
        handlingPrice: 10,
        rate: 5,
        shippingPrice: 15,
        shopId: "SHOP_ID"
      }
    ], []
  ];
  const commonOrder = {
    _id: "order123"
  };
  const shippingDoc = {
    _id: "fulfillment123",
    name: "Default Shipping Provider",
    shopId: "SHOP_ID",
    provider: {
      enabled: true,
      label: "Shipping",
      name: "shipping"
    },
    fulfillmentType: "shipping",
    methods: [{
      shopId: "SHOP_ID",
      cost: 99,
      handling: 99,
      rate: 99,
      fulfillmentTypes: ["shipping"],
      group: "Ground",
      enabled: true,
      label: "Dynamic Rate",
      name: "dynamicRate",
      fulfillmentMethod: "dynamicRate",
      displayMessageMethod: "Sample display message"
    }]
  };
  const expectedNewRate = {
    carrier: "Shipping",
    handlingPrice: 20,
    method: {
      shopId: "SHOP_ID",
      cost: 99,
      handling: 20,
      rate: 10,
      fulfillmentTypes: [
        "shipping"
      ],
      group: "Ground",
      enabled: true,
      label: "Dynamic Rate",
      name: "dynamicRate",
      fulfillmentMethod: "dynamicRate",
      displayMessageMethod: "Sample display message",
      carrier: "DynamicRate",
      methodAdditionalData: {
        gqlType: "dynamicRateData",
        dynamicRateData: "This is additional STRING data from Shipping - DynamicRate"
      }
    },
    rate: 10,
    shippingPrice: 30,
    shopId: "SHOP_ID"
  };
  const expectedResult = [[...previousResults[0], expectedNewRate], []];

  mockContext.collections.Fulfillment = {
    find: jest.fn(() => ({ toArray: () => [shippingDoc] }))
  };
  const result = await fulfillmentMethodsWithQuotesShippingDynamicRate(mockContext, commonOrder, previousResults);
  expect(result).toEqual(expectedResult);
});
