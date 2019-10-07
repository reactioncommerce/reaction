import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import getUpdatedCartItems from "./getUpdatedCartItems.js";

const address = Factory.CartAddress.makeOne({ _id: undefined });

const group = {
  address,
  itemIds: ["1"],
  shopId: "shopId1",
  type: "shipping"
};

const cart = {
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
  shipping: [
    group
  ]
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

const commonOrders = [
  {
    billingAddress: null,
    fulfillmentPrices: {
      handling: null,
      shipping: null,
      total: null
    },
    fulfillmentType: "shipping",
    items: [
      {
        _id: "1",
        attributes: [],
        isTaxable: true,
        price: {
          amount: 10.99
        },
        productId: "productId1",
        productVendor: "productVendor",
        quantity: 1,
        shopId: "shopId1",
        subtotal: {
          amount: 10.99
        },
        taxCode: "123",
        title: "Title",
        variantId: "variantId1",
        variantTitle: "Variant Title"
      }
    ],
    orderId: null,
    originAddress: null,
    shippingAddress: {
      fullName: "mockFullName",
      firstName: "mockFirstName",
      lastName: "mockLastName",
      address1: "mockAddress1",
      address2: "mockAddress2",
      city: "mockCity",
      company: "mockCompany",
      phone: "mockPhone",
      region: "mockRegion",
      postal: "mockPostal",
      country: "mockCountry",
      isCommercial: false,
      isBillingDefault: false,
      isShippingDefault: false,
      failedValidation: false,
      metafields: [
        {
          key: "mockKey",
          namespace: "mockNamespace",
          scope: "mockScope",
          value: "mockValue",
          valueType: "mockValueType",
          description: "mockDescription"
        }
      ]
    },
    shopId: "shopId1",
    sourceType: "cart",
    totals: {
      groupDiscountTotal: {
        amount: 0
      },
      groupItemTotal: {
        amount: 10.99
      },
      groupTotal: {
        amount: 10.99
      },
      orderDiscountTotal: {
        amount: 0
      },
      orderItemTotal: {
        amount: 10.99
      },
      orderTotal: {
        amount: 10.99
      }
    }
  }
];

if (!mockContext.mutations) mockContext.mutations = {};
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

  const { cartItems, taxSummary: taxSummaryResult } = await getUpdatedCartItems(mockContext, cart, commonOrders);

  expect(cartItems[0].tax).toBe(0.5);
  expect(cartItems[0].taxableAmount).toBe(10.99);
  expect(cartItems[0].taxes).toEqual(itemTaxes);
  expect(taxSummaryResult).toEqual(taxSummary);
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

  const { cartItems, taxSummary: taxSummaryResult } = await getUpdatedCartItems(mockContext, cart, commonOrders);

  expect(cartItems[0].taxes[0].customFields).toEqual({ foo: "bar3" });
  expect(cartItems[0].customTaxFields).toEqual({ foo: "bar2" });
  expect(taxSummaryResult.customFields).toEqual({ foo: "bar1" });
});
