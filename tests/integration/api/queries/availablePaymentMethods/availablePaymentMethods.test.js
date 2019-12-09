import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";

const AvailablePaymentMethodsQuery = importAsString("./AvailablePaymentMethodsQuery.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", internalShopId); // reaction/shop:123
const shopName = "Test Shop";
let availablePaymentMethods;
let testApp;

const examplePaymentMethod = {
  _id: "euAJq7W8MzPJPm7Ne",
  name: "example-paymentmethod",
  shopId: "J8Bhq3uTtdgwZx3rz",
  enabled: true,
  icon: null,
  registry: [
    {
      label: "Example Payment",
      provides: [
        "paymentSettings"
      ],
      container: "dashboard",
      template: "exampleSettings"
    }
  ],
  settings: {
    mode: false,
    apiKey: "",
    example: {
      enabled: false
    },
    support: [
      "Authorize",
      "Capture",
      "Refund"
    ]
  },
  version: null
};


beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();

  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName, availablePaymentMethods: ["iou_example"] });
  await testApp.collections.Packages.insertOne(examplePaymentMethod);
  availablePaymentMethods = testApp.query(AvailablePaymentMethodsQuery);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteMany({});
  await testApp.collections.Packages.deleteMany({});
  await testApp.stop();
});

test("retrieves all available payment methods", async () => {
  let result;
  try {
    result = await availablePaymentMethods({
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.availablePaymentMethods[0].name).toEqual("iou_example");
  expect(result.availablePaymentMethods[0].isEnabled).toEqual(true);
});
