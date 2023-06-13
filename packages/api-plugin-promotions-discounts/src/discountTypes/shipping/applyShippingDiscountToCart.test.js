import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as applyShippingDiscountToCart from "./applyShippingDiscountToCart.js";
import checkShippingStackable from "./checkShippingStackable.js";

jest.mock("./checkShippingStackable.js", () => jest.fn());

test("createDiscountRecord should create discount record", () => {
  const parameters = {
    actionKey: "test",
    promotion: {
      _id: "promotion1"
    },
    actionParameters: {
      discountType: "item",
      discountCalculationType: "fixed",
      discountValue: 10
    }
  };

  const discountedItem = {
    _id: "item1",
    amount: 2
  };

  const discountRecord = applyShippingDiscountToCart.createDiscountRecord(parameters, discountedItem);

  expect(discountRecord).toEqual({
    promotionId: "promotion1",
    discountType: "item",
    discountCalculationType: "fixed",
    discountValue: 10,
    dateApplied: expect.any(Date),
    discountedItemType: "shipping",
    discountedAmount: 2,
    stackability: undefined
  });
});

test("should apply shipping discount to cart", async () => {
  const cart = {
    _id: "cart1",
    items: [],
    shipping: [
      {
        _id: "shipping1",
        shipmentMethod: {
          _id: "method1",
          handling: 2,
          rate: 9,
          shippingPrice: 11
        },
        shipmentQuotes: [
          {
            method: {
              _id: "method1",
              handling: 2,
              rate: 9,
              shippingPrice: 11
            },
            handlingPrice: 2,
            rate: 9
          }
        ],
        discounts: []
      }
    ],
    discounts: []
  };

  const parameters = {
    actionKey: "test",
    promotion: {
      _id: "promotion1"
    },
    actionParameters: {
      discountType: "shipping",
      discountCalculationType: "fixed",
      discountValue: 10
    }
  };

  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockReturnValue(2)
  };
  checkShippingStackable.mockReturnValue(true);

  const { cart: updatedCart, affected } = await applyShippingDiscountToCart.default(mockContext, parameters, cart);

  expect(affected).toEqual(true);
  expect(updatedCart.shipping[0].shipmentMethod).toEqual({
    _id: "method1",
    discount: 7,
    handling: 2,
    rate: 2,
    shippingPrice: 4,
    undiscountedRate: 9
  });
  expect(updatedCart.shipping[0].discounts).toHaveLength(1);
});

test("getTotalShippingRate should return total shipping price", () => {
  const cart = {
    shipping: [
      {
        shipmentMethod: {
          rate: 9,
          handling: 2,
          shippingPrice: 11
        }
      },
      {
        shipmentMethod: {
          rate: 10,
          handling: 2,
          shippingPrice: 12
        }
      }
    ]
  };

  const totalShippingRate = applyShippingDiscountToCart.getTotalShippingRate(cart.shipping);

  expect(totalShippingRate).toEqual(19);
});

test("getTotalShippingDiscount should return total shipping discount", () => {
  const totalShippingPrice = 22;

  const actionParameters = {
    discountType: "shipping",
    discountCalculationType: "fixed",
    discountValue: 10
  };
  mockContext.discountCalculationMethods = {
    fixed: jest.fn().mockImplementation((discountValue) => discountValue)
  };
  const totalShippingDiscount = applyShippingDiscountToCart.getTotalShippingDiscount(mockContext, totalShippingPrice, actionParameters);

  expect(totalShippingDiscount).toEqual(10);
});

test("splitDiscountForShipping should split discount for shipping", () => {
  const totalShippingRate = 22;
  const totalDiscountRate = 10;

  const cart = {
    _id: "cart1",
    shipping: [
      {
        _id: "shipping1",
        shipmentMethod: {
          rate: 11,
          handling: 2
        }
      },
      {
        _id: "shipping2",
        shipmentMethod: {
          rate: 9,
          handling: 2
        }
      }
    ]
  };

  const shippingDiscounts = applyShippingDiscountToCart.splitDiscountForShipping(cart.shipping, totalShippingRate, totalDiscountRate);

  expect(shippingDiscounts).toEqual([
    {
      _id: "shipping1",
      amount: 5
    },
    {
      _id: "shipping2",
      amount: 5
    }
  ]);
});

test("canBeApplyDiscountToShipping should return true if discount can be applied to shipping", () => {
  const shipping = {
    discounts: [
      {
        discountType: "shipping"
      }
    ]
  };

  const discount = {
    discountType: "shipping",
    neverStackWithOtherShippingDiscounts: false
  };

  const canBeApplyDiscountToShipping = applyShippingDiscountToCart.canBeApplyDiscountToShipping(shipping, discount);

  expect(canBeApplyDiscountToShipping).toEqual(true);
});

test("canBeApplyDiscountToShipping should return false if discount can not be applied to shipping", () => {
  const shipping = {
    discounts: [
      {
        discountType: "shipping"
      }
    ]
  };

  const discount = {
    discountType: "shipping",
    neverStackWithOtherShippingDiscounts: true
  };

  const canBeApplyDiscountToShipping = applyShippingDiscountToCart.canBeApplyDiscountToShipping(shipping, discount);

  expect(canBeApplyDiscountToShipping).toEqual(false);
});
