import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import recalculateShippingDiscount from "./recalculateShippingDiscount.js";

test("should recalculate shipping discount", async () => {
  const shipping = {
    _id: "shipping1",
    shipmentMethod: {
      _id: "method1",
      handling: 2,
      rate: 9,
      shippingPrice: 11
    },
    discounts: [
      {
        discountType: "shipping",
        discountCalculationType: "fixed",
        discountValue: 10
      }
    ],
    shipmentQuotes: [
      {
        method: {
          _id: "method1",
          handling: 2,
          rate: 9,
          shippingPrice: 11
        },
        handling: 2,
        rate: 9
      }
    ]
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(2)
  };

  recalculateShippingDiscount(mockContext, shipping);

  expect(shipping.shipmentMethod).toEqual({
    _id: "method1",
    discount: 7,
    handling: 2,
    rate: 7,
    shippingPrice: 7,
    undiscountedRate: 9
  });
});
