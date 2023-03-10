import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import fulfillmentMethodsWithQuotesPickupStore from "./fulfillmentMethodsWithQuotesPickupStore.js";

test("should return previousResults if pickup is not among FailedRequests", async () => {
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
  const result = await fulfillmentMethodsWithQuotesPickupStore(mockContext, commonOrder, previousResults);
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
    findOne: jest.fn(() => ({}))
  };
  const result = await fulfillmentMethodsWithQuotesPickupStore(mockContext, commonOrder, previousResults);
  expect(result).toEqual(previousResults);
});


test("should return rates witout error", async () => {
  const previousResults = [
    [
      {
        carrier: "Pickup",
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
  const pickupDoc = {
    _id: "fulfillment123",
    name: "Default Pickup Provider",
    shopId: "SHOP_ID",
    provider: {
      enabled: true,
      label: "Pickup",
      name: "pickup"
    },
    fulfillmentType: "pickup",
    methods: [{
      shopId: "SHOP_ID",
      cost: 99,
      handling: 99,
      rate: 99,
      fulfillmentTypes: ["pickup"],
      group: "Ground",
      enabled: true,
      label: "Store",
      name: "store",
      fulfillmentMethod: "store",
      displayMessageMethod: "Sample display message"
    }]
  };
  const expectedNewRate = {
    carrier: "Pickup",
    handlingPrice: 10,
    method: {
      shopId: "SHOP_ID",
      cost: 99,
      handling: 10,
      rate: 5,
      fulfillmentTypes: [
        "pickup"
      ],
      group: "Ground",
      enabled: true,
      label: "Store",
      name: "store",
      fulfillmentMethod: "store",
      displayMessageMethod: "Sample display message",
      carrier: "Store",
      methodAdditionalData: {
        gqlType: "storeData",
        storeData: [
          {
            storeId: "Store-1",
            storeAddress: "123, 5th Main, Some place",
            storeTiming: "7am to 9pm"
          },
          {
            storeId: "Store-2",
            storeAddress: "456, 50th Main, Some other place",
            storeTiming: "7am to 9pm"
          }
        ]
      }
    },
    rate: 5,
    shippingPrice: 15,
    shopId: "SHOP_ID"
  };
  const expectedResult = [[...previousResults[0], expectedNewRate], []];

  mockContext.collections.Fulfillment = {
    findOne: jest.fn(() => (pickupDoc))
  };
  const result = await fulfillmentMethodsWithQuotesPickupStore(mockContext, commonOrder, previousResults);
  expect(result).toEqual(expectedResult);
});
