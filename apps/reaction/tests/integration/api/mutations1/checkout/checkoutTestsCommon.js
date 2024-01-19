import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const AddCartItemsMutation = importAsString("./AddCartItemsMutation.graphql");
const AvailablePaymentMethodsQuery = importAsString("./AvailablePaymentMethodsQuery.graphql");
const CreateCartMutation = importAsString("./CreateCartMutation.graphql");
const CreateShopMutation = importAsString("./CreateShopMutation.graphql");
const PlaceOrderMutation = importAsString("./PlaceOrderMutation.graphql");
const PublishProductToCatalogMutation = importAsString("./PublishProductsToCatalogMutation.graphql");
const RemoveCartItemsMutation = importAsString("./RemoveCartItemsMutation.graphql");
const SelectFulfillmentOptionForGroupMutation = importAsString("./SelectFulfillmentOptionForGroupMutation.graphql");
const SetShippingAddressOnCartMutation = importAsString("./SetShippingAddressOnCartMutation.graphql");
const UpdateCartItemsQuantityMutation = importAsString("./UpdateCartItemsQuantityMutation.graphql");
const UpdateFulfillmentOptionsForGroupMutation = importAsString("./UpdateFulfillmentOptionsForGroupMutation.graphql");
const CreatePromotionMutation = importAsString("./CreatePromotionMutation.graphql");

jest.setTimeout(300000);

const encodeProductOpaqueId = encodeOpaqueId("reaction/product");

const internalProductId = "999";
const opaqueProductId = encodeProductOpaqueId(999);
const internalTagIds = ["923", "924"];
const internalVariantIds = ["875", "874", "925"];

const internalProductTwoId = "888";
const opaqueProductTwoId = encodeProductOpaqueId(888);
const internalVariantTwoIds = ["889", "890"];

const shopName = "Test Shop";

const mockProduct = {
  _id: internalProductId,
  ancestors: [],
  title: "Fake Product",
  isDeleted: false,
  isVisible: true,
  supportedFulfillmentTypes: ["shipping"]
};

const mockVariant = {
  _id: internalVariantIds[0],
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  title: "Fake Product Variant",
  isDeleted: false,
  isVisible: true
};

const mockOptionOne = {
  _id: internalVariantIds[1],
  ancestors: [internalProductId, internalVariantIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  isDeleted: false,
  isVisible: true,
  price: 19.99
};

const mockOptionTwo = {
  _id: internalVariantIds[2],
  ancestors: [internalProductId, internalVariantIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Option Two",
  isDeleted: false,
  isVisible: true,
  price: 29.99
};

const mockProductTwo = {
  _id: internalProductTwoId,
  ancestors: [],
  title: "Fake Product two",
  isDeleted: false,
  isVisible: true,
  supportedFulfillmentTypes: ["shipping"],
  vendor: "Nike"
};

const mockVariantTwo = {
  _id: internalVariantTwoIds[0],
  ancestors: [internalProductTwoId],
  attributeLabel: "Variant",
  title: "Fake Product Two Variant",
  isDeleted: false,
  isVisible: true
};

const mockOptionTwoOne = {
  _id: internalVariantTwoIds[1],
  ancestors: [internalProductTwoId, internalVariantTwoIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Two Option One",
  isDeleted: false,
  isVisible: true,
  price: 19.99
};

const mockShippingMethod = {
  _id: "mockShippingMethod",
  name: "Default Shipping Provider",
  provider: {
    enabled: true,
    label: "Flat Rate",
    name: "flatRates"
  },
  fulfillmentType: "shipping",
  methods: [
    {
      cost: 2.5,
      fulfillmentTypes: [
        "shipping"
      ],
      fulfillmentMethod: "flatRate",
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

let addCartItems;
let availablePaymentMethods;
let createCart;
let createShop;
let createPromotion;
let internalShopId;
let opaqueShopId;
let placeOrder;
let publishProducts;
let removeCartItems;
let selectFulfillmentOptionForGroup;
let setShippingAddressOnCart;
let testApp;
let updateCartItemsQuantity;
let updateFulfillmentOptionsForGroup;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  addCartItems = testApp.mutate(AddCartItemsMutation);
  availablePaymentMethods = testApp.query(AvailablePaymentMethodsQuery);
  createCart = testApp.mutate(CreateCartMutation);
  createShop = testApp.mutate(CreateShopMutation);
  placeOrder = testApp.mutate(PlaceOrderMutation);
  publishProducts = testApp.mutate(PublishProductToCatalogMutation);
  removeCartItems = testApp.mutate(RemoveCartItemsMutation);
  selectFulfillmentOptionForGroup = testApp.mutate(SelectFulfillmentOptionForGroupMutation);
  setShippingAddressOnCart = testApp.mutate(SetShippingAddressOnCartMutation);
  updateCartItemsQuantity = testApp.mutate(UpdateCartItemsQuantityMutation);
  updateFulfillmentOptionsForGroup = testApp.mutate(UpdateFulfillmentOptionsForGroupMutation);
  createPromotion = testApp.mutate(CreatePromotionMutation);

  const shopCreateGroup = Factory.Group.makeOne({
    _id: "shopCreateGroup",
    createdBy: null,
    name: "shopCreate",
    permissions: ["reaction:legacy:shops/create", "reaction:legacy:groups/manage:accounts"],
    slug: "shop-create",
    shopId: null
  });
  await testApp.collections.Groups.insertOne(shopCreateGroup);

  const mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccountId",
    groups: ["shopCreateGroup", "adminGroup"]
  });

  // Setup shop
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  const {
    createShop: {
      shop: { _id: newShopId }
    }
  } = await createShop({
    input: {
      name: shopName
    }
  });

  opaqueShopId = newShopId;
  internalShopId = decodeOpaqueIdForNamespace("reaction/shop", newShopId);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:products/publish", "reaction:legacy:promotions/create"],
    slug: "admin",
    shopId: internalShopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

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
  mockShippingMethod.shopId = internalShopId;
  await testApp.collections.Fulfillment.insertOne(mockShippingMethod);

  // Add Tags and products
  mockProduct.shopId = internalShopId;
  mockVariant.shopId = internalShopId;
  mockOptionOne.shopId = internalShopId;
  mockOptionTwo.shopId = internalShopId;
  mockProductTwo.shopId = internalShopId;
  mockVariantTwo.shopId = internalShopId;
  mockOptionTwoOne.shopId = internalShopId;
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insertOne({ _id, shopId: internalShopId, slug: `slug${_id}` })));
  await testApp.collections.Products.insertOne(mockProduct);
  await testApp.collections.Products.insertOne(mockVariant);
  await testApp.collections.Products.insertOne(mockOptionOne);
  await testApp.collections.Products.insertOne(mockOptionTwo);
  await testApp.collections.Products.insertOne(mockProductTwo);
  await testApp.collections.Products.insertOne(mockVariantTwo);
  await testApp.collections.Products.insertOne(mockOptionTwoOne);

  // Publish products to the catalog
  await publishProducts({ productIds: [opaqueProductId, opaqueProductTwoId] });
});

// eslint-disable-next-line require-jsdoc
export default function getCommonData() {
  return {
    addCartItems,
    availablePaymentMethods,
    createCart,
    createShop,
    createPromotion,
    encodeProductOpaqueId,
    internalShopId,
    internalVariantIds,
    internalVariantTwoIds,
    opaqueProductId,
    opaqueProductTwoId,
    opaqueShopId,
    placeOrder,
    publishProducts,
    removeCartItems,
    selectFulfillmentOptionForGroup,
    setShippingAddressOnCart,
    testApp,
    updateCartItemsQuantity,
    updateFulfillmentOptionsForGroup
  };
}
