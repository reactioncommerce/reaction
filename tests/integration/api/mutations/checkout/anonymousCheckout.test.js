import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const AvailablePaymentMethodsQuery = importAsString("./AvailablePaymentMethodsQuery.graphql");
const AddCartItemsMutation = importAsString("./AddCartItemsMutation.graphql");
const AnonymousCartByCartIdQuery = importAsString("./AnonymousCartByCartIdQuery.graphql");
const RemoveCartItemsMutation = importAsString("./RemoveCartItemsMutation.graphql");
const CreateCartMutation = importAsString("./CreateCartMutation.graphql");
const UpdateFulfillmentOptionsForGroupMutation = importAsString("./UpdateFulfillmentOptionsForGroupMutation.graphql");
const SelectFulfillmentOptionForGroupMutation = importAsString("./SelectFulfillmentOptionForGroupMutation.graphql");
const SetShippingAddressOnCartMutation = importAsString("./SetShippingAddressOnCartMutation.graphql");
const UpdateCartItemsQuantityMutation = importAsString("./UpdateCartItemsQuantityMutation.graphql");
const PlaceOrderMutation = importAsString("./PlaceOrderMutation.graphql");
const PublishProductToCatalogMutation = importAsString("./PublishProductsToCatalogMutation.graphql");
const SetEmailOnAnonymousCart = importAsString("./SetEmailOnAnonymousCartMutation.graphql");


jest.setTimeout(300000);

const encodeProductOpaqueId = encodeOpaqueId("reaction/product");
const encodeShopOpaqueId = encodeOpaqueId("reaction/shop");

const internalShopId = "123";
const opaqueShopId = encodeShopOpaqueId(123);
const internalProductId = "999";
const opaqueProductId = encodeProductOpaqueId(999);
const internalTagIds = ["923", "924"];
const internalVariantIds = ["875", "874", "925"];

const shopName = "Test Shop";

const mockProduct = {
  _id: internalProductId,
  ancestors: [],
  title: "Fake Product",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  supportedFulfillmentTypes: ["shipping"]
};

const mockVariant = {
  _id: internalVariantIds[0],
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  title: "Fake Product Variant",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true
};

const mockOptionOne = {
  _id: internalVariantIds[1],
  ancestors: [internalProductId, internalVariantIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  price: 19.99
};

const mockOptionTwo = {
  _id: internalVariantIds[2],
  ancestors: [internalProductId, internalVariantIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Option Two",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  price: 29.99
};

const mockShippingMethod = {
  _id: "mockShippingMethod",
  name: "Default Shipping Provider",
  shopId: internalShopId,
  provider: {
    enabled: true,
    label: "Flat Rate",
    name: "flatRates"
  },
  methods: [
    {
      cost: 2.5,
      fulfillmentTypes: [
        "shipping"
      ],
      group: "Ground",
      handling: 1.5,
      label: "Standard mockMethod",
      name: "mockMethod",
      rate: 1,
      _id: "mockMethod",
      enabled: true
    }
  ]
};

const mockAdminAccount = Factory.Account.makeOne({
  _id: "mockAdminAccountId",
  roles: {
    [internalShopId]: ["admin", "createProduct"]
  },
  shopId: internalShopId
});

let testApp;
let addCartItems;
let anonymousCartByCartQuery;
let availablePaymentMethods;
let createCart;
let removeCartItems;
let placeOrder;
let publishProducts;
let selectFulfillmentOptionForGroup;
let setEmailOnAnonymousCart;
let setShippingAddressOnCart;
let updateCartItemsQuantity;
let updateFulfillmentOptionsForGroup;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  addCartItems = testApp.mutate(AddCartItemsMutation);
  anonymousCartByCartQuery = testApp.mutate(AnonymousCartByCartIdQuery);
  availablePaymentMethods = testApp.query(AvailablePaymentMethodsQuery);
  createCart = testApp.mutate(CreateCartMutation);
  removeCartItems = testApp.mutate(RemoveCartItemsMutation);
  placeOrder = testApp.mutate(PlaceOrderMutation);
  publishProducts = testApp.mutate(PublishProductToCatalogMutation);
  removeCartItems = testApp.mutate(RemoveCartItemsMutation);
  setEmailOnAnonymousCart = testApp.mutate(SetEmailOnAnonymousCart);
  selectFulfillmentOptionForGroup = testApp.mutate(SelectFulfillmentOptionForGroupMutation);
  setShippingAddressOnCart = testApp.mutate(SetShippingAddressOnCartMutation);
  updateCartItemsQuantity = testApp.mutate(UpdateCartItemsQuantityMutation);
  updateFulfillmentOptionsForGroup = testApp.mutate(UpdateFulfillmentOptionsForGroupMutation);

  // Setup shop
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);
  await testApp.context.mutations.createShop({ ...testApp.context, isInternalCall: true }, {
    name: shopName,
    shopId: internalShopId
  });

  // Set other shop settings
  await testApp.collections.Shops.updateOne(
    { _id: internalShopId },
    {
      $set: {
        allowGuestCheckout: true,
        availablePaymentMethods: ["iou_example"],
        emails: [{ address: "testing@reactioncommerce.com" }]
      }
    }
  );

  // Add shipping methods
  await testApp.collections.Shipping.insertOne(mockShippingMethod);

  // Add Tags and products
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insertOne({ _id, shopId: internalShopId, slug: `slug${_id}` })));
  await testApp.collections.Products.insertOne(mockProduct);
  await testApp.collections.Products.insertOne(mockVariant);
  await testApp.collections.Products.insertOne(mockOptionOne);
  await testApp.collections.Products.insertOne(mockOptionTwo);

  // Publish products to the catalog
  await publishProducts({ productIds: [opaqueProductId] });
});

afterAll(async () => {
  await testApp.collections.Accounts.deleteMany({});
  await testApp.collections.Shipping.deleteMany({});
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Products.deleteMany({});
  await testApp.collections.users.deleteMany({});
  await testApp.clearLoggedInUser();
  await testApp.stop();
});

describe("as an anonymous user", () => {
  let cartToken;
  let opaqueCartId;
  let opaqueCartItemId;
  let opaqueCartItemIdToRemove;
  let opaqueFulfillmentGroupId;
  let opaqueFulfillmentMethodId;
  let latestCartSummary;

  const opaqueCartProductVariantId = encodeProductOpaqueId(internalVariantIds[1]);

  beforeAll(async () => {
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


