import TestApp from "/imports/test-utils/helpers/TestApp";
import CloneProductVariantsMutation from "./cloneProductVariants.graphql";

jest.setTimeout(300000);

const internalShopId = "123";
const internalProductId = "999";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalVariantIds = ["875", "874", "925"];
const opaqueVariantIdOne = "cmVhY3Rpb24vcHJvZHVjdDo4NzU="; // reaction/product:875

const shopName = "Test Shop";

const mockProduct = {
  _id: internalProductId,
  ancestors: [],
  title: "Fake Product",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  supportedFulfillmentTypes: ["shipping"],
  type: "simple"
};

const mockVariant = {
  _id: internalVariantIds[0],
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  title: "Fake Product Variant",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  type: "variant"
};

const mockOptionOne = {
  _id: internalVariantIds[1],
  ancestors: [internalProductId, internalVariantIds[0]],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  type: "variant"
};

const expectedClonedVariant = {
  variants: [
    {
      isDeleted: false,
      isVisible: true,
      options: [
        {
          title: "Fake Product Option One"
        }
      ],
      shop: {
        _id: opaqueShopId
      },
      title: "Fake Product Variant - copy"
    }]
};

let testApp;
let mutate;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  mutate = testApp.mutate(CloneProductVariantsMutation);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Products.insertOne(mockProduct);
  await testApp.collections.Products.insertOne(mockVariant);
  await testApp.collections.Products.insertOne(mockOptionOne);

  await testApp.setLoggedInUser({
    _id: "123",
    roles: { [internalShopId]: ["createProduct"] }
  });
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Products.deleteOne({ _id: internalProductId });
  await testApp.collections.Products.deleteOne({ _id: internalVariantIds[0] });
  await testApp.collections.Products.deleteOne({ _id: internalVariantIds[1] });
  await testApp.clearLoggedInUser();
  await testApp.stop();
});

// create a new product
test("expect a variant and all variants options to be cloned using `[variantIds]` as input", async () => {
  let result;
  try {
    result = await mutate({ input: { shopId: opaqueShopId, variantIds: [opaqueVariantIdOne] } });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({ cloneProductVariants: expectedClonedVariant });
});
