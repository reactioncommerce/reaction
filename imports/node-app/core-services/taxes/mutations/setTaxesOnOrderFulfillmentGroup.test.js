import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import xformOrderGroupToCommonOrder from "../test-util/xformOrderGroupToCommonOrder.js";
import setTaxesOnOrderFulfillmentGroup from "./setTaxesOnOrderFulfillmentGroup.js";

const address = Factory.OrderAddress.makeOne({ _id: undefined });

const group = {
  address,
  items: [
    {
      _id: "1",
      attributes: [],
      isTaxable: true,
      price: {
        amount: 10.99,
        currencyCode: "USD"
      },
      productId: "productId1",
      productVendor: "productVendor",
      quantity: 1,
      shopId: "shopId1",
      taxCode: "123",
      title: "Title",
      variantId: "variantId1",
      variantTitle: "Variant Title"
    }
  ],
  shopId: "shopId1",
  type: "shipping"
};

const orderInput = {
  billingAddress: address,
  currencyCode: "USD"
};

const taxSummary = {
  calculatedAt: new Date("2019-01-01T10:00:00"),
  calculatedByTaxServiceName: "mockService",
  tax: 0.5,
  taxableAmount: 10.99,
  taxes: [
    {
      sourcing: "destination",
      tax: 0.5,
      taxableAmount: 10.99,
      taxName: "City tax",
      taxRate: 0.01
    }
  ]
};

const itemTaxes = [
  {
    sourcing: "destination",
    tax: 0.5,
    taxableAmount: 10.99,
    taxName: "City tax",
    taxRate: 0.01
  }
];

mockContext.mutations.getFulfillmentGroupTaxes = jest.fn().mockName("getFulfillmentGroupTaxes");

mockContext.collections.Shops.findOne.mockReturnValue(Promise.resolve({ _id: "shopId1" }));

test("mutates group.items and group.taxSummary", async () => {
  mockContext.mutations.getFulfillmentGroupTaxes.mockReturnValueOnce(Promise.resolve({
    itemTaxes: [
      {
        itemId: "1",
        tax: 0.5,
        taxableAmount: 10.99,
        taxes: itemTaxes
      }
    ],
    taxSummary
  }));

  const { billingAddress, cartId, currencyCode } = orderInput;

  const commonOrder = await xformOrderGroupToCommonOrder({
    billingAddress,
    cartId,
    collections: mockContext.collections,
    currencyCode,
    group
  });

  await setTaxesOnOrderFulfillmentGroup(mockContext, { group, commonOrder });

  expect(group.items[0].tax).toBe(0.5);
  expect(group.items[0].taxableAmount).toBe(10.99);
  expect(group.items[0].taxes).toEqual(itemTaxes);
  expect(group.taxSummary).toEqual(taxSummary);
});

test("customFields are properly saved", async () => {
  mockContext.mutations.getFulfillmentGroupTaxes.mockReturnValueOnce(Promise.resolve({
    itemTaxes: [
      {
        customFields: {
          foo: "bar2"
        },
        itemId: "1",
        tax: 0.5,
        taxableAmount: 10.99,
        taxes: [
          {
            ...itemTaxes[0],
            customFields: {
              foo: "bar3"
            }
          }
        ]
      }
    ],
    taxSummary: {
      ...taxSummary,
      customFields: {
        foo: "bar1"
      }
    }
  }));

  const { billingAddress, cartId, currencyCode } = orderInput;

  const commonOrder = await xformOrderGroupToCommonOrder({
    billingAddress,
    cartId,
    collections: mockContext.collections,
    currencyCode,
    group
  });

  await setTaxesOnOrderFulfillmentGroup(mockContext, { group, commonOrder });

  expect(group.items[0].taxes[0].customFields).toEqual({ foo: "bar3" });
  expect(group.items[0].customTaxFields).toEqual({ foo: "bar2" });
  expect(group.taxSummary.customFields).toEqual({ foo: "bar1" });
});
