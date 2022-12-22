import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import getCommonData from "../checkout/checkoutTestsCommon.js";
import { fixedDiscountPromotion } from "./fixtures/promotions.js";

const AnonymousCartByCartIdQuery = importAsString("../checkout/AnonymousCartByCartIdQuery.graphql");
const SetEmailOnAnonymousCart = importAsString("../checkout/SetEmailOnAnonymousCartMutation.graphql");

let anonymousCartByCartQuery;
let availablePaymentMethods;
let createCart;
let updateCartItemsQuantity;
let encodeProductOpaqueId;
let internalVariantIds;
let internalVariantTwoIds;
let opaqueProductId;
let opaqueProductTwoId;
let opaqueShopId;
let placeOrder;
let selectFulfillmentOptionForGroup;
let setEmailOnAnonymousCart;
let setShippingAddressOnCart;
let testApp;
let updateFulfillmentOptionsForGroup;
let mockPromotion;

beforeAll(async () => {
  ({
    availablePaymentMethods,
    createCart,
    encodeProductOpaqueId,
    internalVariantIds,
    internalVariantTwoIds,
    opaqueProductId,
    opaqueProductTwoId,
    opaqueShopId,
    placeOrder,
    selectFulfillmentOptionForGroup,
    setShippingAddressOnCart,
    testApp,
    updateFulfillmentOptionsForGroup,
    updateCartItemsQuantity
  } = getCommonData());

  anonymousCartByCartQuery = testApp.mutate(AnonymousCartByCartIdQuery);
  setEmailOnAnonymousCart = testApp.mutate(SetEmailOnAnonymousCart);

  const now = new Date();
  mockPromotion = Factory.Promotion.makeOne({
    ...fixedDiscountPromotion,
    startDate: now,
    endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
    enabled: true,
    shopId: decodeOpaqueIdForNamespace("reaction/shop")(opaqueShopId)
  });

  await testApp.collections.Promotions.insertOne(mockPromotion);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

describe("Promotions", () => {
  let cartToken;
  let testCart;
  let opaqueCartId;
  let opaqueCartProductVariantId;
  let opaqueCartProductVariantTwoId;
  let opaqueFulfillmentGroupId;
  let opaqueFulfillmentMethodId;
  let latestCartSummary;
  let placedOrderId;
  let opaqueCartItemId;

  beforeAll(async () => {
    opaqueCartProductVariantId = encodeProductOpaqueId(internalVariantIds[1]);
    opaqueCartProductVariantTwoId = encodeProductOpaqueId(internalVariantTwoIds[1]);
    await testApp.clearLoggedInUser();
  });

  const shippingAddress = {
    address1: "12345 Drive Lane",
    city: "The city",
    country: "USA",
    firstName: "FName",
    fullName: "FName LName",
    isBillingDefault: false,
    isCommercial: false,
    isShippingDefault: false,
    lastName: "LName",
    phone: "5555555555",
    postal: "97878",
    region: "CA"
  };

  const createTestCart = ({ quantity = 6 }) => {
    test("create a new cart", async () => {
      const result = await createCart({
        createCartInput: {
          shopId: opaqueShopId,
          items: {
            price: { amount: 19.99, currencyCode: "USD" },
            productConfiguration: { productId: opaqueProductId, productVariantId: opaqueCartProductVariantId },
            quantity
          }
        }
      });

      testCart = result.createCart.cart;
      cartToken = result.createCart.token;
      opaqueCartId = result.createCart.cart._id;
    });
  };

  const createCartAndPlaceOrder = ({ quantity = 6 }) => {
    createTestCart({ quantity });

    test("set email on anonymous cart", async () => {
      const result = await setEmailOnAnonymousCart({
        input: {
          cartId: opaqueCartId,
          cartToken,
          email: "test@email.com"
        }
      });

      opaqueCartId = result.setEmailOnAnonymousCart.cart._id;
    });

    test("set shipping address on cart", async () => {
      const result = await setShippingAddressOnCart({
        input: { cartId: opaqueCartId, cartToken, address: shippingAddress }
      });

      opaqueFulfillmentGroupId = result.setShippingAddressOnCart.cart.checkout.fulfillmentGroups[0]._id;
    });

    test("get available fulfillment options", async () => {
      const result = await updateFulfillmentOptionsForGroup({
        input: { cartId: opaqueCartId, cartToken, fulfillmentGroupId: opaqueFulfillmentGroupId }
      });

      const option = result.updateFulfillmentOptionsForGroup.cart.checkout.fulfillmentGroups[0].availableFulfillmentOptions[0];
      opaqueFulfillmentMethodId = option.fulfillmentMethod._id;
    });

    test("select the `Standard mockMethod` fulfillment option", async () => {
      const result = await selectFulfillmentOptionForGroup({
        input: {
          cartId: opaqueCartId,
          cartToken,
          fulfillmentGroupId: opaqueFulfillmentGroupId,
          fulfillmentMethodId: opaqueFulfillmentMethodId
        }
      });

      latestCartSummary = result.selectFulfillmentOptionForGroup.cart.checkout.summary;
    });

    test("place order", async () => {
      const paymentMethods = await availablePaymentMethods({
        shopId: opaqueShopId
      });

      const paymentMethodName = paymentMethods.availablePaymentMethods[0].name;

      const { anonymousCartByCartId: anonymousCart } = await anonymousCartByCartQuery({
        cartId: opaqueCartId,
        cartToken
      });

      try {
        const result = await placeOrder({
          input: {
            order: {
              cartId: opaqueCartId,
              currencyCode: "USD",
              email: anonymousCart.email,
              fulfillmentGroups: [
                {
                  data: {
                    shippingAddress
                  },
                  items: [
                    {
                      price: 19.99,
                      productConfiguration: {
                        productId: opaqueProductId,
                        productVariantId: opaqueCartProductVariantId
                      },
                      quantity
                    }
                  ],
                  selectedFulfillmentMethodId: opaqueFulfillmentMethodId,
                  shopId: opaqueShopId,
                  type: "shipping",
                  totalPrice: latestCartSummary.total.amount
                }
              ],
              shopId: opaqueShopId
            },
            payments: [
              {
                amount: latestCartSummary.total.amount,
                method: paymentMethodName
              }
            ]
          }
        });
        placedOrderId = result.placeOrder.orders[0]._id;
      } catch (error) {
        expect(error).toBeUndefined();
        return;
      }
    });
  };

  describe("when a promotion is applied to an order with fixed promotion", () => {
    createCartAndPlaceOrder({ quantity: 6 });

    test("placed order get the correct values", async () => {
      const orderId = decodeOpaqueIdForNamespace("reaction/order")(placedOrderId);
      const newOrder = await testApp.collections.Orders.findOne({ _id: orderId });

      expect(newOrder.shipping[0].invoice.total).toEqual(112.44);
      expect(newOrder.shipping[0].invoice.discounts).toEqual(10);
      expect(newOrder.shipping[0].invoice.subtotal).toEqual(119.94);

      expect(newOrder.shipping[0].items[0].quantity).toEqual(6);
      expect(newOrder.shipping[0].items[0].discounts).toHaveLength(1);
      expect(newOrder.shipping[0].items[0].discount).toEqual(10);

      expect(newOrder.appliedPromotions[0]._id).toEqual(mockPromotion._id);
      expect(newOrder.discounts).toHaveLength(1);
    });
  });

  describe("when a promotion is applied to an order percentage discount", () => {
    beforeAll(async () => {
      mockPromotion.actions[0].actionParameters = {
        discountType: "order",
        discountCalculationType: "percentage",
        discountValue: 10
      };
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    createCartAndPlaceOrder({ quantity: 6 });

    test("placed order get the correct values", async () => {
      const orderId = decodeOpaqueIdForNamespace("reaction/order")(placedOrderId);
      const newOrder = await testApp.collections.Orders.findOne({ _id: orderId });

      expect(newOrder.shipping[0].invoice.total).toEqual(110.45);
      expect(newOrder.shipping[0].invoice.discounts).toEqual(11.99);
      expect(newOrder.shipping[0].invoice.subtotal).toEqual(119.94);

      expect(newOrder.shipping[0].items[0].discounts).toHaveLength(1);
      expect(newOrder.shipping[0].items[0].discount).toEqual(11.99);

      expect(newOrder.appliedPromotions[0]._id).toEqual(mockPromotion._id);
      expect(newOrder.discounts).toHaveLength(1);
    });
  });

  describe("when a promotion isn't applied to an order", () => {
    createTestCart({ quantity: 1 });

    test("placed order get the correct values", async () => {
      expect(testCart.appliedPromotions).toBeUndefined();
    });
  });

  describe("when a promotion applied via inclusion criteria", () => {
    beforeAll(async () => {
      mockPromotion.triggers[0].triggerParameters.inclusionRules = {
        conditions: {
          all: [
            {
              fact: "item",
              path: "$.productVendor",
              operator: "equal",
              value: "Nike"
            }
          ]
        }
      };
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    test("create a new cart", async () => {
      const result = await createCart({
        createCartInput: {
          shopId: opaqueShopId,
          items: {
            price: { amount: 19.99, currencyCode: "USD" },
            productConfiguration: { productId: opaqueProductTwoId, productVariantId: opaqueCartProductVariantTwoId },
            quantity: 6
          }
        }
      });

      testCart = result.createCart.cart;
      cartToken = result.createCart.token;
      opaqueCartId = result.createCart.cart._id;
      opaqueCartItemId = result.createCart.cart.items.nodes[0]._id;
    });

    test("created cart get the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      const total = cart.items.reduce((acc, item) => acc + item.subtotal.amount, 0);
      expect(total).toEqual(107.95);
      expect(cart.discount).toEqual(11.99);
      expect(cart.appliedPromotions[0]._id).toEqual(mockPromotion._id);
      expect(cart.appliedPromotions).toHaveLength(1);
      expect(cart.discounts).toHaveLength(1);
    });

    test("Cart disqualified: reduce the cart items quantity to 1", async () => {
      await updateCartItemsQuantity({
        updateCartItemsQuantityInput: {
          cartId: opaqueCartId,
          cartToken,
          items: [
            {
              cartItemId: opaqueCartItemId,
              quantity: 1
            }
          ]
        }
      });
    });

    test("cart shouldn't contains any promotions", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      expect(cart.appliedPromotions).toHaveLength(0);
    });
  });

  describe("when a promotion isn't applied via exclusion criteria", () => {
    beforeAll(async () => {
      mockPromotion.triggers[0].triggerParameters.inclusionRules = {
        conditions: {
          all: [
            {
              fact: "item",
              path: "$.productVendor",
              operator: "equal",
              value: "Nike"
            }
          ]
        }
      };
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    createTestCart({ quantity: 6 });

    test("placed order get the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      const total = cart.items.reduce((acc, item) => acc + item.subtotal.amount, 0);
      expect(total).toEqual(119.94);
      expect(cart.discount).toEqual(0);
      expect(cart.appliedPromotions).toHaveLength(0);
      expect(cart.discounts).toHaveLength(0);
    });
  });

  describe("when a promotion isn't applied by exclusion criteria", () => {
    beforeAll(async () => {
      delete mockPromotion.triggers[0].triggerParameters.inclusionRules;
      mockPromotion.triggers[0].triggerParameters.exclusionRules = {
        conditions: {
          all: [
            {
              fact: "item",
              path: "$.productVendor",
              operator: "equal",
              value: "Nike"
            }
          ]
        }
      };
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    test("create a new cart", async () => {
      // Nike vendor
      const result = await createCart({
        createCartInput: {
          shopId: opaqueShopId,
          items: {
            price: { amount: 19.99, currencyCode: "USD" },
            productConfiguration: { productId: opaqueProductTwoId, productVariantId: opaqueCartProductVariantTwoId },
            quantity: 6
          }
        }
      });

      testCart = result.createCart.cart;
      cartToken = result.createCart.token;
      opaqueCartId = result.createCart.cart._id;
    });

    test("placed order get the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      const total = cart.items.reduce((acc, item) => acc + item.subtotal.amount, 0);
      expect(total).toEqual(119.94);
      expect(cart.discount).toEqual(0);
      expect(cart.appliedPromotions).toHaveLength(0);
      expect(cart.discounts).toHaveLength(0);
    });
  });

  describe("cart shouldn't contains any promotion when qualified promotion is change to disabled", () => {
    beforeAll(async () => {
      delete mockPromotion.triggers[0].triggerParameters.inclusionRules;
      delete mockPromotion.triggers[0].triggerParameters.exclusionRules;
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    createTestCart({ quantity: 6 });

    test("created cart: should have the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      expect(cart.appliedPromotions).toHaveLength(1);
    });

    test("disable the promotion", async () => {
      mockPromotion.enabled = false;
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    test("make cart update", async () => {
      await updateCartItemsQuantity({
        updateCartItemsQuantityInput: {
          cartId: opaqueCartId,
          cartToken,
          items: [{ cartItemId: opaqueCartItemId, quantity: 7 }]
        }
      });
    });

    test("created cart: shouldn't contains any promotions but contains a message", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      expect(cart.appliedPromotions).toHaveLength(0);
      expect(cart.messages).toHaveLength(1);
    });
  });

  describe("cart applied promotion with 10% but max discount is $20", () => {
    beforeAll(async () => {
      mockPromotion.enabled = true;
      mockPromotion.actions[0].actionParameters = {
        discountType: "order",
        discountCalculationType: "percentage",
        discountValue: 10,
        discountMaxValue: 20
      };
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    createTestCart({ quantity: 20 });

    test("created cart: should have the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });
      expect(cart.items).toHaveLength(1);

      const total = cart.items.reduce((acc, item) => acc + item.subtotal.amount, 0);
      expect(total).toEqual(379.8);
      expect(cart.discount).toEqual(20);
      expect(cart.appliedPromotions[0]._id).toEqual(mockPromotion._id);
      expect(cart.appliedPromotions).toHaveLength(1);
      expect(cart.discounts).toHaveLength(1);
    });

    test("make promotion expired", async () => {
      const now = new Date();
      now.setDate(now.getDate() - 1);
      mockPromotion.endDate = now;
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    test("make cart update", async () => {
      await updateCartItemsQuantity({
        updateCartItemsQuantityInput: {
          cartId: opaqueCartId,
          cartToken,
          items: [{ cartItemId: opaqueCartItemId, quantity: 7 }]
        }
      });
    });

    test("created cart: shouldn't contains any promotions but contains a message", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      expect(cart.appliedPromotions).toHaveLength(0);
      expect(cart.messages).toHaveLength(1);
    });
  });

  describe("Stackability: shouldn't stack with other promotion when stackability is none", () => {
    beforeAll(async () => {
      mockPromotion.enabled = true;
      mockPromotion.stackability.key = "none";
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });
    });

    beforeAll(async () => {
      const now = new Date();
      const mockPromotionTwo = Factory.Promotion.makeOne({
        ...fixedDiscountPromotion,
        startDate: now,
        endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
        enabled: true,
        shopId: decodeOpaqueIdForNamespace("reaction/shop")(opaqueShopId)
      });

      await testApp.collections.Promotions.insertOne(mockPromotionTwo);
    });

    createTestCart({ quantity: 20 });

    test("created cart: should have the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      expect(cart.appliedPromotions).toHaveLength(1);
    });
  });

  describe("Stackability: should applied with other promotions when stackability is all", () => {
    beforeAll(async () => {
      const now = new Date();
      mockPromotion.stackability.key = "all";
      mockPromotion.endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: mockPromotion });

      const mockPromotionTwo = Factory.Promotion.makeOne({
        ...fixedDiscountPromotion,
        startDate: now,
        endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
        enabled: true,
        shopId: decodeOpaqueIdForNamespace("reaction/shop")(opaqueShopId)
      });

      await testApp.collections.Promotions.insertOne(mockPromotionTwo);
    });

    createTestCart({ quantity: 20 });

    test("created cart: should have the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      expect(cart.appliedPromotions).toHaveLength(2);
    });
  });
});
