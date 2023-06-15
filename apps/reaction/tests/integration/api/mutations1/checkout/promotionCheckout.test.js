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
let createPromotion;
let updateCartItemsQuantity;
let encodeProductOpaqueId;
let internalVariantIds;
let internalVariantTwoIds;
let opaqueProductId;
let opaqueProductTwoId;
let opaqueShopId;
let internalShopId;
let placeOrder;
let selectFulfillmentOptionForGroup;
let setEmailOnAnonymousCart;
let setShippingAddressOnCart;
let testApp;
let updateFulfillmentOptionsForGroup;
let mockPromotion;
let mockAdminAccount;

beforeAll(async () => {
  ({
    availablePaymentMethods,
    createCart,
    createPromotion,
    encodeProductOpaqueId,
    internalVariantIds,
    internalVariantTwoIds,
    opaqueProductId,
    opaqueProductTwoId,
    opaqueShopId,
    internalShopId,
    placeOrder,
    selectFulfillmentOptionForGroup,
    setShippingAddressOnCart,
    testApp,
    updateFulfillmentOptionsForGroup,
    updateCartItemsQuantity
  } = getCommonData());

  anonymousCartByCartQuery = testApp.mutate(AnonymousCartByCartIdQuery);
  setEmailOnAnonymousCart = testApp.mutate(SetEmailOnAnonymousCart);

  mockAdminAccount = Factory.Account.makeOne({
    groups: ["adminGroup"],
    shopId: internalShopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);
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

  const cleanup = async () => {
    await testApp.collections.Promotions.deleteMany();
    await testApp.collections.Orders.deleteMany();
    await testApp.collections.Cart.deleteMany();
  };

  const createTestPromotion = (overlay = {}) => {
    test("create new promotion", async () => {
      await testApp.setLoggedInUser(mockAdminAccount);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 7);

      mockPromotion = {
        ...fixedDiscountPromotion,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        enabled: true,
        shopId: internalShopId,
        ...overlay
      };
      try {
        const result = await createPromotion({ input: mockPromotion });
        mockPromotion._id = result.createPromotion.promotion._id;
      } catch (error) {
        expect(error).toBeUndefined();
      }

      await testApp.clearLoggedInUser();
    });
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
    afterAll(async () => {
      await cleanup();
    });

    createTestPromotion();
    createCartAndPlaceOrder({ quantity: 6 });

    test("placed order get the correct values", async () => {
      const orderId = decodeOpaqueIdForNamespace("reaction/order")(placedOrderId);
      const newOrder = await testApp.collections.Orders.findOne({ _id: orderId });
      expect(newOrder.shipping[0].invoice.total).toEqual(139.94);
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
    afterAll(async () => {
      await cleanup();
    });

    createTestPromotion({
      actions: [
        {
          actionKey: "discounts",
          actionParameters: {
            discountType: "order",
            discountCalculationType: "percentage",
            discountValue: 10
          }
        }
      ]
    });

    createCartAndPlaceOrder({ quantity: 6 });

    test("placed order get the correct values", async () => {
      const orderId = decodeOpaqueIdForNamespace("reaction/order")(placedOrderId);
      const newOrder = await testApp.collections.Orders.findOne({ _id: orderId });

      expect(newOrder.shipping[0].invoice.total).toEqual(137.95);
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
    afterAll(async () => {
      await cleanup();
    });

    const triggerParameters = { ...fixedDiscountPromotion.triggers[0].triggerParameters };
    triggerParameters.inclusionRules = {
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
    createTestPromotion({
      triggers: [
        {
          triggerKey: "offers",
          triggerParameters
        }
      ]
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
      expect(total).toEqual(109.94);
      expect(cart.discount).toEqual(10);
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

  describe("when a promotion isn't applied via inclusion criteria", () => {
    afterAll(async () => {
      await cleanup();
    });

    const triggerParameters = { ...fixedDiscountPromotion.triggers[0].triggerParameters };
    triggerParameters.inclusionRules = {
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

    createTestPromotion({
      triggers: [
        {
          triggerKey: "offers",
          triggerParameters
        }
      ]
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
    afterAll(async () => {
      await cleanup();
    });

    const triggerParameters = { ...fixedDiscountPromotion.triggers[0].triggerParameters };
    triggerParameters.exclusionRules = {
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

    createTestPromotion({
      triggers: [
        {
          triggerKey: "offers",
          triggerParameters
        }
      ]
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
    afterAll(async () => {
      await cleanup();
    });

    createTestPromotion();
    createTestCart({ quantity: 6 });

    test("created cart: should have the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      expect(cart.appliedPromotions).toHaveLength(1);
    });

    test("disable the promotion", async () => {
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: { enabled: false } });
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

      await cleanup();
    });
  });

  describe("cart applied promotion with 10% but max discount is $20", () => {
    afterAll(async () => {
      await cleanup();
    });

    createTestPromotion({
      actions: [
        {
          actionKey: "discounts",
          actionParameters: {
            discountType: "order",
            discountCalculationType: "percentage",
            discountValue: 10,
            discountMaxValue: 20
          }
        }
      ]
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
      await testApp.collections.Promotions.updateOne({ _id: mockPromotion._id }, { $set: { endDate: now } });
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
    afterAll(async () => {
      await cleanup();
    });

    createTestPromotion();
    createTestPromotion({
      stackability: { key: "none", parameters: {} }
    });

    createTestCart({ quantity: 20 });

    test("created cart: should have the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });

      expect(cart.appliedPromotions).toHaveLength(1);
    });
  });

  describe("Stackability: should applied with other promotions when stackability is all", () => {
    afterAll(async () => {
      await cleanup();
    });

    createTestPromotion();
    createTestPromotion();
    createTestCart({ quantity: 20 });

    test("created cart: should have the correct values", async () => {
      const cartId = decodeOpaqueIdForNamespace("reaction/cart")(opaqueCartId);
      const cart = await testApp.collections.Cart.findOne({ _id: cartId });
      expect(cart.appliedPromotions).toHaveLength(2);
    });
  });

  describe("apply with single shipping promotion", () => {
    afterAll(async () => {
      await cleanup();
    });

    createTestPromotion({
      actions: [
        {
          actionKey: "discounts",
          actionParameters: {
            discountType: "shipping",
            discountCalculationType: "percentage",
            discountValue: 50
          }
        }
      ]
    });

    createCartAndPlaceOrder({ quantity: 6 });

    test("placed order get the correct values", async () => {
      const orderId = decodeOpaqueIdForNamespace("reaction/order")(placedOrderId);
      const newOrder = await testApp.collections.Orders.findOne({ _id: orderId });
      expect(newOrder.shipping[0].invoice.total).toEqual(144.94);
      expect(newOrder.shipping[0].invoice.discounts).toEqual(0);
      expect(newOrder.shipping[0].invoice.subtotal).toEqual(119.94);
      expect(newOrder.shipping[0].invoice.shipping).toEqual(25);
      expect(newOrder.shipping[0].shipmentMethod.discount).toEqual(5);
      expect(newOrder.shipping[0].shipmentMethod.rate).toEqual(5);
      expect(newOrder.shipping[0].shipmentMethod.handling).toEqual(20);

      expect(newOrder.shipping[0].items[0].quantity).toEqual(6);

      expect(newOrder.appliedPromotions[0]._id).toEqual(mockPromotion._id);
      expect(newOrder.discounts).toHaveLength(1);
    });
  });

  describe("apply with two shipping promotions", () => {
    beforeAll(async () => {
      await cleanup();
    });

    createTestPromotion({
      label: "shipping promotion 1",
      actions: [
        {
          actionKey: "discounts",
          actionParameters: {
            discountType: "shipping",
            discountCalculationType: "percentage",
            discountValue: 50
          }
        }
      ]
    });

    createTestPromotion({
      label: "shipping promotion 2",
      actions: [
        {
          actionKey: "discounts",
          actionParameters: {
            discountType: "shipping",
            discountCalculationType: "percentage",
            discountValue: 10
          }
        }
      ]
    });

    createCartAndPlaceOrder({ quantity: 6 });

    test("placed order get the correct values", async () => {
      const orderId = decodeOpaqueIdForNamespace("reaction/order")(placedOrderId);
      const newOrder = await testApp.collections.Orders.findOne({ _id: orderId });
      expect(newOrder.shipping[0].invoice.total).toEqual(144.44);
      expect(newOrder.shipping[0].invoice.discounts).toEqual(0);
      expect(newOrder.shipping[0].invoice.subtotal).toEqual(119.94);
      expect(newOrder.shipping[0].invoice.shipping).toEqual(24.5);
      expect(newOrder.shipping[0].shipmentMethod.discount).toEqual(5.5);
      expect(newOrder.shipping[0].shipmentMethod.rate).toEqual(4.5);
      expect(newOrder.shipping[0].shipmentMethod.handling).toEqual(20);

      expect(newOrder.appliedPromotions).toHaveLength(2);
      expect(newOrder.discounts).toHaveLength(2);
    });
  });
});
