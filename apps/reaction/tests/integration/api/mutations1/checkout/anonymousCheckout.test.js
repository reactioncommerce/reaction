import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import getCommonData from "./checkoutTestsCommon.js";

const AnonymousCartByCartIdQuery = importAsString("./AnonymousCartByCartIdQuery.graphql");
const SetEmailOnAnonymousCart = importAsString("./SetEmailOnAnonymousCartMutation.graphql");

let addCartItems;
let anonymousCartByCartQuery;
let availablePaymentMethods;
let createCart;
let encodeProductOpaqueId;
let internalVariantIds;
let opaqueProductId;
let opaqueShopId;
let placeOrder;
let removeCartItems;
let selectFulfillmentOptionForGroup;
let setEmailOnAnonymousCart;
let setShippingAddressOnCart;
let testApp;
let updateCartItemsQuantity;
let updateFulfillmentOptionsForGroup;

beforeAll(async () => {
  ({
    addCartItems,
    availablePaymentMethods,
    createCart,
    encodeProductOpaqueId,
    internalVariantIds,
    opaqueProductId,
    opaqueShopId,
    placeOrder,
    removeCartItems,
    selectFulfillmentOptionForGroup,
    setShippingAddressOnCart,
    testApp,
    updateCartItemsQuantity,
    updateFulfillmentOptionsForGroup
  } = getCommonData());

  anonymousCartByCartQuery = testApp.mutate(AnonymousCartByCartIdQuery);
  setEmailOnAnonymousCart = testApp.mutate(SetEmailOnAnonymousCart);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

describe("as an anonymous user", () => {
  let cartToken;
  let opaqueCartId;
  let opaqueCartItemId;
  let opaqueCartItemIdToRemove;
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

  // create a new cart
  test("create a new cart with one item", async () => {
    let result;
    try {
      result = await createCart({
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
            quantity: 1
          }
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    cartToken = result.createCart.token;
    opaqueCartId = result.createCart.cart._id;
    opaqueCartItemId = result.createCart.cart.items.nodes[0]._id;

    expect(result.createCart.cart.items.nodes[0].quantity).toEqual(1);
    expect(result.createCart.cart.items.nodes[0].price.amount).toEqual(19.99);
  });

  test("add 1 more quantity to an existing cart item", async () => {
    let result;
    try {
      result = await updateCartItemsQuantity({
        updateCartItemsQuantityInput: {
          cartId: opaqueCartId,
          cartToken, // Defined in test "create a new cart with one item"
          items: [
            {
              cartItemId: opaqueCartItemId,
              quantity: 2
            }
          ]
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    expect(result.updateCartItemsQuantity.cart.items.nodes[0].quantity).toEqual(2);
    expect(result.updateCartItemsQuantity.cart.items.nodes[0].price.amount).toEqual(19.99);
  });

  test("add another item to the cart with a quantity of 5", async () => {
    let result;
    try {
      result = await addCartItems({
        addCartItemsInput: {
          cartId: opaqueCartId,
          cartToken,
          items: {
            price: {
              amount: 29.99,
              currencyCode: "USD"
            },
            productConfiguration: {
              productId: opaqueProductId,
              productVariantId: encodeProductOpaqueId(internalVariantIds[2])
            },
            quantity: 5
          }
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    opaqueCartItemIdToRemove = result.addCartItems.cart.items.nodes[0]._id;

    expect(result.addCartItems.cart.items.nodes[0].quantity).toEqual(5);
    expect(result.addCartItems.cart.items.nodes[0].price.amount).toEqual(29.99);
    expect(result.addCartItems.cart.items.nodes[1].quantity).toEqual(2);
    expect(result.addCartItems.cart.items.nodes[1].price.amount).toEqual(19.99);
  });

  test("remove recently added item from cart", async () => {
    let result;
    try {
      result = await removeCartItems({
        removeCartItemsInput: {
          cartId: opaqueCartId,
          cartItemIds: [opaqueCartItemIdToRemove],
          cartToken
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }
    expect(result.removeCartItems.cart.items.nodes.length).toEqual(1);
    expect(result.removeCartItems.cart.items.nodes[0].quantity).toEqual(2);
    expect(result.removeCartItems.cart.items.nodes[0].price.amount).toEqual(19.99);
  });

  test("set email on anonymous cart", async () => {
    let result;
    try {
      result = await setEmailOnAnonymousCart({
        input: {
          cartId: opaqueCartId,
          cartToken,
          email: "test@email.com"
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    opaqueCartId = result.setEmailOnAnonymousCart.cart._id;

    expect(result.setEmailOnAnonymousCart.cart.email).toEqual("test@email.com");
    expect(result.setEmailOnAnonymousCart.cart.items.nodes[0].quantity).toEqual(2);
    expect(result.setEmailOnAnonymousCart.cart.items.nodes[0].price.amount).toEqual(19.99);
  });

  test("set shipping address on cart", async () => {
    let result;
    try {
      result = await setShippingAddressOnCart({
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
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    opaqueFulfillmentGroupId = result.setShippingAddressOnCart.cart.checkout.fulfillmentGroups[0]._id;

    expect(result.setShippingAddressOnCart.cart.checkout.fulfillmentGroups[0].shippingAddress).toEqual({
      address1: "12345 Drive Lane",
      address2: null,
      city: "The city",
      company: null,
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
    });
  });

  test("get available fulfillment options", async () => {
    let result;
    try {
      result = await updateFulfillmentOptionsForGroup({
        input: {
          cartId: opaqueCartId,
          cartToken,
          fulfillmentGroupId: opaqueFulfillmentGroupId
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    const mockFulfillmentMethodId = "mockMethod";
    const opaqueMockFulfillmentMethodId = encodeOpaqueId("reaction/fulfillmentMethod", mockFulfillmentMethodId);

    // From the multiple Fulfillment methods, find out the exact method we are looking for
    const options = result.updateFulfillmentOptionsForGroup.cart.checkout.fulfillmentGroups[0].availableFulfillmentOptions;
    const option = options.find((opt) => opt.fulfillmentMethod._id === opaqueMockFulfillmentMethodId);
    opaqueFulfillmentMethodId = option.fulfillmentMethod._id;

    expect(option).toEqual({
      fulfillmentMethod: {
        _id: opaqueFulfillmentMethodId,
        displayName: "Standard mockMethod",
        fulfillmentTypes: ["shipping"]
      },
      handlingPrice: {
        amount: 1.5
      },
      price: {
        amount: 2.5
      }
    });
  });

  test("select the `Standard mockMethod` fulfillment option", async () => {
    let result;
    try {
      result = await selectFulfillmentOptionForGroup({
        input: {
          cartId: opaqueCartId,
          cartToken,
          fulfillmentGroupId: opaqueFulfillmentGroupId,
          fulfillmentMethodId: opaqueFulfillmentMethodId
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    latestCartSummary = result.selectFulfillmentOptionForGroup.cart.checkout.summary;

    expect(result.selectFulfillmentOptionForGroup.cart.checkout.fulfillmentGroups[0].selectedFulfillmentOption).toEqual({
      fulfillmentMethod: {
        _id: opaqueFulfillmentMethodId,
        displayName: "Standard mockMethod",
        fulfillmentTypes: ["shipping"]
      },
      handlingPrice: {
        amount: 1.5
      },
      price: {
        amount: 2.5
      }
    });
  });

  test("place order", async () => {
    let result;

    // Get available payment methods
    const paymentMethods = await availablePaymentMethods({
      shopId: opaqueShopId
    });

    expect(paymentMethods.availablePaymentMethods[0].name).toEqual("iou_example");
    expect(paymentMethods.availablePaymentMethods[0].isEnabled).toEqual(true);

    const paymentMethodName = paymentMethods.availablePaymentMethods[0].name;

    const { anonymousCartByCartId: anonymousCart } = await anonymousCartByCartQuery({
      cartId: opaqueCartId,
      cartToken
    });

    // Expect the email address on the cart to be set
    expect(anonymousCart.email).toEqual("test@email.com");

    try {
      result = await placeOrder({
        input: {
          order: {
            cartId: opaqueCartId,
            currencyCode: "USD",
            email: anonymousCart.email,
            fulfillmentGroups: [{
              data: {
                shippingAddress
              },
              items: [{
                price: 19.99,
                productConfiguration: {
                  productId: opaqueProductId,
                  productVariantId: opaqueCartProductVariantId
                },
                quantity: 2
              }],
              selectedFulfillmentMethodId: opaqueFulfillmentMethodId,
              shopId: opaqueShopId,
              type: "shipping",
              totalPrice: latestCartSummary.total.amount
            }],
            shopId: opaqueShopId
          },
          payments: [{
            amount: latestCartSummary.total.amount,
            method: paymentMethodName
          }]
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    expect(result.placeOrder.orders[0].email).toEqual("test@email.com");
  });
});


