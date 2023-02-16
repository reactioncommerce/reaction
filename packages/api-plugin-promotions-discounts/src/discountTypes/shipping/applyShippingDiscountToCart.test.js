import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as applyShippingDiscountToCart from "./applyShippingDiscountToCart.js";

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

  const { cart: updatedCart, affected } = await applyShippingDiscountToCart.default(mockContext, parameters, cart);

  expect(affected).toEqual(true);
  expect(updatedCart.shipping[0].shipmentMethod).toEqual({
    _id: "method1",
    discount: 9,
    handling: 2,
    rate: 9,
    shippingPrice: 2,
    undiscountedRate: 11
  });
  expect(updatedCart.shipping[0].discounts).toHaveLength(1);
});

test("getTotalShippingPrice should return total shipping price", () => {
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
          handling: 1,
          shippingPrice: 11
        }
      }
    ]
  };

  const totalShippingPrice = applyShippingDiscountToCart.getTotalShippingPrice(cart.shipping);

  expect(totalShippingPrice).toEqual(22);
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
  const totalShippingPrice = 22;
  const totalShippingDiscount = 10;

  const cart = {
    _id: "cart1",
    shipping: [
      {
        _id: "shipping1",
        shipmentMethod: {
          rate: 9,
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

  const shippingDiscounts = applyShippingDiscountToCart.splitDiscountForShipping(cart.shipping, totalShippingPrice, totalShippingDiscount);

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
