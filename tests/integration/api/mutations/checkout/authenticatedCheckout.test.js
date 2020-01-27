import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import getCommonData from "./checkoutTestsCommon.js";

const AccountCartByAccountIdQuery = importAsString("./AccountCartByAccountIdQuery.graphql");

let accountCartByAccountId;
let addCartItems;
let availablePaymentMethods;
let createCart;
let encodeProductOpaqueId;
let internalShopId;
let internalVariantIds;
let mockCustomerAccount;
let opaqueProductId;
let opaqueShopId;
let placeOrder;
let removeCartItems;
let selectFulfillmentOptionForGroup;
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
    internalShopId,
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

  accountCartByAccountId = testApp.query(AccountCartByAccountIdQuery);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

describe("as a signed in user", () => {
  let opaqueAccountId;
  let opaqueCartId;
  let opaqueCartItemId;
  let opaqueCartItemIdToRemove;
  let opaqueCartProductVariantId;
  let opaqueFulfillmentGroupId;
  let opaqueFulfillmentMethodId;
  let latestCartSummary;

  beforeAll(async () => {
    const customerGroup = Factory.Group.makeOne({
      _id: "customerGroup",
      createdBy: null,
      name: "customer",
      permissions: ["customer"],
      slug: "customer",
      shopId: internalShopId
    });
    await testApp.collections.Groups.insertOne(customerGroup);

    // create mock customer account
    mockCustomerAccount = Factory.Account.makeOne({
      _id: "mockCustomerAccountId",
      groups: [customerGroup._id],
      profile: {
        language: "en"
      },
      shopId: internalShopId
    });

    opaqueAccountId = encodeOpaqueId("reaction/account", mockCustomerAccount._id);
    opaqueCartProductVariantId = encodeProductOpaqueId(internalVariantIds[1]);

    await testApp.createUserAndAccount(mockCustomerAccount);
    await testApp.setLoggedInUser(mockCustomerAccount);
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

  test("add another item to the cart with a quantity of 5 with an invalid price", async () => {
    let result;
    try {
      result = await addCartItems({
        addCartItemsInput: {
          cartId: opaqueCartId,
          items: {
            price: {
              amount: 9999.99,
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

    expect(result.addCartItems.incorrectPriceFailures).toMatchSnapshot();
  });

  test("add another item to the cart with a quantity of 5 with a valid price", async () => {
    let result;
    try {
      result = await addCartItems({
        addCartItemsInput: {
          cartId: opaqueCartId,
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
          cartItemIds: [opaqueCartItemIdToRemove]
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

  test("set shipping address on cart", async () => {
    let result;
    try {
      result = await setShippingAddressOnCart({
        input: {
          cartId: opaqueCartId,
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
          fulfillmentGroupId: opaqueFulfillmentGroupId
        }
      });
    } catch (error) {
      expect(error).toBeUndefined();
      return;
    }

    const option = result.updateFulfillmentOptionsForGroup.cart.checkout.fulfillmentGroups[0].availableFulfillmentOptions[0];
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

    const { accountCartByAccountId: accountCart } = await accountCartByAccountId({
      accountId: opaqueAccountId,
      shopId: opaqueShopId
    });

    // Expect the email address on the cart to be null. A signed in user should
    // not have an email on the cart, it is provided when they place the order.
    expect(accountCart.email).toBeNull();

    try {
      result = await placeOrder({
        input: {
          order: {
            cartId: opaqueCartId,
            currencyCode: "USD",
            email: "test@email.com",
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
