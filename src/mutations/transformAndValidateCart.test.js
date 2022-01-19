import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { Cart } from "../simpleSchemas.js";
import transformAndValidateCart from "./transformAndValidateCart.js";

mockContext.simpleSchemas = {};
mockContext.simpleSchemas.Cart = Cart;

const accountCart = {
  _id: "cartId",
  accountId: "accountId",
  shopId: "shopId",
  currencyCode: "currencyCode",
  createdAt: new Date()
};
const expectedResult = { ...accountCart, shipping: [] };
test("valid account cart", async () => {
  await transformAndValidateCart(mockContext, accountCart);
  expect(accountCart).toEqual(expectedResult);
});


const anonymousCart = {
  _id: "cartId",
  anonymousAccessToken: "anonymousAccessToken",
  shopId: "shopId",
  currencyCode: "currencyCode",
  createdAt: new Date()
};
const expectedAnonymousResult = { ...anonymousCart, shipping: [] };
test("valid anonymous cart", async () => {
  await transformAndValidateCart(mockContext, anonymousCart);
  expect(anonymousCart).toEqual(expectedAnonymousResult);
});


const accountCartNoShopId = {
  _id: "cartId",
  accountId: "accountId",
  currencyCode: "currencyCode",
  createdAt: new Date()
};
test("invalid account cart - no shopId", async () => {
  try {
    await transformAndValidateCart(mockContext, accountCartNoShopId);
  } catch (error) {
    expect(error.details[0].message).toEqual("Cart ShopId is required");
  }
});


const accountCartNoCurrencyCode = {
  _id: "cartId",
  accountId: "accountId",
  shopId: "shopId",
  createdAt: new Date()
};
test("invalid account cart - no currency code", async () => {
  try {
    await transformAndValidateCart(mockContext, accountCartNoCurrencyCode);
  } catch (error) {
    expect(error.details[0].message).toEqual("Currency code is required");
  }
});


const accountCartInvalidDate = {
  _id: "cartId",
  accountId: "accountId",
  shopId: "shopId",
  currencyCode: "currencyCode",
  createdAt: "date"
};
test("invalid account cart - invalid date format", async () => {
  try {
    await transformAndValidateCart(mockContext, accountCartInvalidDate);
  } catch (error) {
    expect(error.details[0].message).toEqual("Created at must be of type Date");
  }
});
