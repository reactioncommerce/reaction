import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import * as applyItemDiscountToCart from "./applyItemDiscountToCart.js";

test("createItemDiscount should return correct discount item object", () => {
  const item = {
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 1,
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    }
  };

  const discount = {
    actionKey: "test",
    promotionId: "promotion1",
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10
  };

  const discountedAmount = 2;

  const itemDiscount = applyItemDiscountToCart.createItemDiscount(item, discount, discountedAmount);

  expect(itemDiscount).toEqual({
    actionKey: "test",
    promotionId: "promotion1",
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10,
    dateApplied: expect.any(Date),
    discountedAmount: 2
  });
});

test("addDiscountToItem should add discount to item", () => {
  const discount = {
    actionKey: "test",
    promotionId: "promotion1",
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10
  };

  jest.spyOn(applyItemDiscountToCart, "createItemDiscount").mockReturnValue(discount);

  const item = {
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 1,
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    },
    discounts: []
  };

  const discountedAmount = 2;

  const itemDiscount = applyItemDiscountToCart.createItemDiscount(item, discount, discountedAmount);

  applyItemDiscountToCart.addDiscountToItem({}, discount, { item });

  expect(item.discounts).toEqual([
    {
      ...itemDiscount,
      dateApplied: expect.any(Date)
    }
  ]);
});

test("should return cart with applied discount when parameters not include rule", async () => {
  const item = {
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 1,
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    },
    discounts: []
  };

  const cart = {
    _id: "cart1",
    items: [item]
  };

  const discountParameters = {
    actionKey: "test",
    promotionId: "promotion1",
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10
  };

  jest.spyOn(applyItemDiscountToCart, "addDiscountToItem").mockImplementation(() => {});

  mockContext.promotions = {
    operators: {}
  };

  const result = await applyItemDiscountToCart.default(mockContext, discountParameters, cart);

  expect(result).toEqual({
    cart,
    allResults: [],
    discountedItems: [item]
  });
});

test("should return cart with applied discount when parameters include rule", async () => {
  const item = {
    _id: "item1",
    price: {
      amount: 12
    },
    quantity: 2,
    subtotal: {
      amount: 10,
      currencyCode: "USD",
      discount: 2,
      undiscountedAmount: 12
    },
    discounts: []
  };

  const cart = {
    _id: "cart1",
    items: [item]
  };

  const discountParameters = {
    actionKey: "test",
    promotionId: "promotion1",
    discountType: "test",
    discountCalculationType: "test",
    discountValue: 10,
    rules: {
      conditions: {
        any: [
          {
            fact: "item",
            path: "$.quantity",
            operator: "greaterThanInclusive",
            value: 1
          }
        ]
      }
    }
  };

  jest.spyOn(applyItemDiscountToCart, "addDiscountToItem").mockImplementation(() => {});

  mockContext.promotions = {
    operators: {}
  };

  const result = await applyItemDiscountToCart.default(mockContext, discountParameters, cart);

  expect(result).toEqual({
    cart,
    allResults: expect.any(Object),
    discountedItems: [item]
  });
});
