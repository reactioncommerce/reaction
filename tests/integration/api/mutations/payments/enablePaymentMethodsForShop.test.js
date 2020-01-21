import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const EnablePaymentMethodsForShopMutation = importAsString("./EnablePaymentMethodsForShopMutation.graphql");

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";

const mockAdminAccount = Factory.Account.makeOne({
  roles: {
    [internalShopId]: ["reaction:legacy:shops/read", "reaction:legacy:shops/update"]
  }
});

jest.setTimeout(300000);

let testApp;
let enablePaymentMethodsForShop;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName, PaymentMethods: ["iou_example"] });
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  enablePaymentMethodsForShop = await testApp.mutate(EnablePaymentMethodsForShopMutation);
});

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an authorized user should be able to update the payment methods", async () => {
  let result;
  try {
    await testApp.setLoggedInUser(mockAdminAccount);
    result = await enablePaymentMethodsForShop({
      enablePaymentMethodForShopInput: {
        isEnabled: true,
        paymentMethodName: "iou_example",
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
  }

  const updatedPaymentMethod = result.enablePaymentMethodForShop.paymentMethods.find((paymentMethod) => paymentMethod.name === "iou_example");
  expect(typeof updatedPaymentMethod).toEqual("object");
  expect(updatedPaymentMethod).toEqual({ isEnabled: true, name: "iou_example" });
});

test("an unauthorized user should not be able to update the payment methods", async () => {
  try {
    await enablePaymentMethodsForShop({
      enablePaymentMethodForShopInput: {
        isEnabled: true,
        paymentMethodName: "iou_example",
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});
