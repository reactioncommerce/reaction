import applyItemDiscountToCart from "../util/discountTypes/item/applyItemDiscountToCart.js";
import applyOrderDiscountToCart from "../util/discountTypes/order/applyOrderDiscountToCart.js";
import applyShippingDiscountToCart from "../util/discountTypes/shipping/applyShippingDiscountToCart.js";
import discountAction, { discountActionHandler, discountActionParameters } from "./discountAction.js";

jest.mock("../util/discountTypes/item/applyItemDiscountToCart.js", () => jest.fn());
jest.mock("../util/discountTypes/order/applyOrderDiscountToCart.js", () => jest.fn());
jest.mock("../util/discountTypes/shipping/applyShippingDiscountToCart.js", () => jest.fn());

beforeEach(() => jest.resetAllMocks());

test("discountAction should be a object", () => {
  expect(discountAction).toEqual({
    key: "discounts",
    handler: discountActionHandler,
    paramSchema: discountActionParameters
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
  expect(applyItemDiscountToCart).toHaveBeenCalledWith(context, params.actionParameters, cart);
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
  expect(applyOrderDiscountToCart).toHaveBeenCalledWith(context, params.actionParameters, cart);
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
  expect(applyShippingDiscountToCart).toHaveBeenCalledWith(context, params.actionParameters, cart);
});
