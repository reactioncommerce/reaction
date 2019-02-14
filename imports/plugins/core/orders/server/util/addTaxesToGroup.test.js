import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import addTaxesToGroup from "./addTaxesToGroup";

const address = Factory.Address.makeOne({ _id: undefined });

if (!mockContext.mutations) mockContext.mutations = {};
mockContext.mutations.getFulfillmentGroupTaxes = jest.fn().mockName("getFulfillmentGroupTaxes");

test("mutates group.items and group.taxSummary", async () => {
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

  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve({ _id: "shopId1" }));

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

  await addTaxesToGroup(mockContext, group, orderInput);

  expect(group.items[0].tax).toBe(0.5);
  expect(group.items[0].taxableAmount).toBe(10.99);
  expect(group.items[0].taxes).toEqual(itemTaxes);
  expect(group.taxSummary).toEqual(taxSummary);
});
