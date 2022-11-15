import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import getCommonData from "../checkout/checkoutTestsCommon.js";

const AnonymousCartByCartIdQuery = importAsString("../checkout/AnonymousCartByCartIdQuery.graphql");
const SetEmailOnAnonymousCart = importAsString("../checkout/SetEmailOnAnonymousCartMutation.graphql");

let anonymousCartByCartQuery;
let availablePaymentMethods;
let createCart;
let encodeProductOpaqueId;
let internalVariantIds;
let opaqueProductId;
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
    opaqueProductId,
    opaqueShopId,
    placeOrder,
    selectFulfillmentOptionForGroup,
    setShippingAddressOnCart,
    testApp,
    updateFulfillmentOptionsForGroup
  } = getCommonData());

  anonymousCartByCartQuery = testApp.mutate(AnonymousCartByCartIdQuery);
  setEmailOnAnonymousCart = testApp.mutate(SetEmailOnAnonymousCart);

  const now = new Date();
  mockPromotion = Factory.Promotion.makeOne({
    actions: [
      {
        actionKey: "discounts",
        actionParameters: {
          discountType: "order",
          discountCalculationType: "percentage",
          discountValue: 50
        }
      }
    ],
    triggers: [
      {
        triggerKey: "offers",
        triggerParameters: {
          name: "50 percent off your entire order when you spend more then $100",
          conditions: {
            all: [
              {
                fact: "totalItemAmount",
                operator: "greaterThanInclusive",
                value: 100
              }
            ]
          }
        }
      }
    ],
    triggerType: "implicit",
    promotionType: "order-discount",
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
  let opaqueCartId;
  let opaqueCartProductVariantId;
  let opaqueFulfillmentGroupId;
  let opaqueFulfillmentMethodId;
  let latestCartSummary;

  beforeAll(async () => {
    opaqueCartProductVariantId = encodeProductOpaqueId(internalVariantIds[1]);
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

  test("create a new cart", async () => {
    const result = await createCart({
      createCartInput: {
        shopId: opaqueShopId,
        items: {
          price: {
            amount: 19.99,
            currencyCode: "USD"
          },
          productConfiguration: {
            productId: opaqueProductId,
            productVariantId: opaqueCartProductVariantId
          },
          quantity: 6
        }
      }
    });

    cartToken = result.createCart.token;
    opaqueCartId = result.createCart.cart._id;
  });

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
      input: {
        cartId: opaqueCartId,
        cartToken,
        address: {
          address1: "12345 Drive Lane",
          city: "The city",
          country: "USA",
          firstName: "FName",
          fullName: "FName LName",
          lastName: "LName",
          phone: "5555555555",
          postal: "97878",
          region: "CA"
        }
      }
    });

    opaqueFulfillmentGroupId = result.setShippingAddressOnCart.cart.checkout.fulfillmentGroups[0]._id;
  });

  test("get available fulfillment options", async () => {
    const result = await updateFulfillmentOptionsForGroup({
      input: {
        cartId: opaqueCartId,
        cartToken,
        fulfillmentGroupId: opaqueFulfillmentGroupId
      }
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

  test("place an order with discount and get the correct values", async () => {
    let result;

    const paymentMethods = await availablePaymentMethods({
      shopId: opaqueShopId
    });

    const paymentMethodName = paymentMethods.availablePaymentMethods[0].name;

    const { anonymousCartByCartId: anonymousCart } = await anonymousCartByCartQuery({
      cartId: opaqueCartId,
      cartToken
    });

    try {
      result = await placeOrder({
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
                    quantity: 6
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
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    const orderId = decodeOpaqueIdForNamespace("reaction/order")(result.placeOrder.orders[0]._id);
    const newOrder = await testApp.collections.Orders.findOne({ _id: orderId });

    expect(newOrder.shipping[0].invoice.total).toEqual(62.47);
    expect(newOrder.shipping[0].invoice.discounts).toEqual(59.97);
    expect(newOrder.shipping[0].invoice.subtotal).toEqual(119.94);

    expect(newOrder.shipping[0].items[0].quantity).toEqual(6);
    expect(newOrder.shipping[0].items[0].discounts).toHaveLength(1);
    expect(newOrder.shipping[0].items[0].discount).toEqual(59.97);

    expect(newOrder.appliedPromotions[0]._id).toEqual(mockPromotion._id);
    expect(newOrder.discounts).toHaveLength(1);
  });
});
