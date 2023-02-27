import applyItemDiscountToCart from "../discountTypes/item/applyItemDiscountToCart.js";
import applyOrderDiscountToCart from "../discountTypes/order/applyOrderDiscountToCart.js";
import applyShippingDiscountToCart from "../discountTypes/shipping/applyShippingDiscountToCart.js";
import discountAction, { discountActionCleanup, discountActionHandler, discountActionParameters } from "./discountAction.js";

jest.mock("../discountTypes/item/applyItemDiscountToCart.js", () => jest.fn());
jest.mock("../discountTypes/order/applyOrderDiscountToCart.js", () => jest.fn());
jest.mock("../discountTypes/shipping/applyShippingDiscountToCart.js", () => jest.fn());

beforeEach(() => jest.resetAllMocks());

test("discountAction should be a object", () => {
  expect(discountAction).toEqual({
    key: "discounts",
    handler: discountActionHandler,
    paramSchema: discountActionParameters,
    cleanup: discountActionCleanup
  });
});

test("should call discount item function when discountType parameters is item", () => {
  const context = {};
  const cart = {};
  const params = {
    promotion: {},
    actionParameters: {
      discountType: "item"
    }
  };
  discountAction.handler(context, cart, params);
  expect(applyItemDiscountToCart).toHaveBeenCalledWith(context, params, cart);
});

test("should call discount order function when discountType parameters is order", () => {
  const context = {};
  const cart = {};
  const params = {
    promotion: {},
    actionParameters: {
      discountType: "order"
    }
  };
  discountAction.handler(context, cart, params);
  expect(applyOrderDiscountToCart).toHaveBeenCalledWith(context, params, cart);
});

test("should call discount shipping function when discountType parameters is shipping", () => {
  const context = {};
  const cart = {};
  const params = {
    promotion: {},
    actionParameters: {
      discountType: "shipping"
    }
  };
  discountAction.handler(context, cart, params);
  expect(applyShippingDiscountToCart).toHaveBeenCalledWith(context, params, cart);
});

describe("cleanup", () => {
  test("should reset the cart discount state", async () => {
    const cart = {
      discounts: [{ _id: "discount1" }],
      discount: 10,
      items: [
        {
          _id: "item1",
          discounts: [{ _id: "discount1" }],
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
        }
      ]
    };

    const updatedCart = await discountActionCleanup({}, cart);

    expect(updatedCart).toEqual({
      discounts: [],
      discount: 0,
      items: [
        {
          _id: "item1",
          discounts: [],
          price: {
            amount: 12
          },
          quantity: 1,
          subtotal: {
            amount: 12,
            currencyCode: "USD"
          }
        }
      ]
    });
  });
});
