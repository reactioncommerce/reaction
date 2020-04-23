import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const approveOrderPayments = importAsString("./approveOrderPayments.graphql");

jest.setTimeout(300000);

const shopId = "123";
const opaqueShopId = encodeOpaqueId("reaction/shop", shopId); // reaction/shop:123
const orderId = "456";
const opaqueOrderId = encodeOpaqueId("reaction/order", orderId);
const paymentId = "789";
const opaquePaymentId = encodeOpaqueId("reaction/payment", paymentId);
const productId = "product1";
const productVariantId = "variant1";

const shopName = "Test Shop";

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:orders/approve:payment"],
  slug: "admin",
  shopId
});

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId
});

const product = Factory.Product.makeOne({
  _id: productId,
  ancestors: [],
  handle: "test-product",
  isDeleted: false,
  isVisible: true,
  shopId,
  type: "simple"
});

const variant = Factory.Product.makeOne({
  _id: productVariantId,
  ancestors: [productId],
  attributeLabel: "Variant",
  isDeleted: false,
  isVisible: true,
  shopId,
  type: "variant"
});

let testApp;
let approveOrderPaymentsMutation;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();

  await insertPrimaryShop(testApp.context, { _id: shopId, name: shopName });
  await testApp.collections.Products.insertOne(product);
  await testApp.collections.Products.insertOne(variant);
  await testApp.publishProducts([productId]);

  // Place an order
  const orderItem = Factory.OrderItem.makeOne({
    productId,
    variantId: productVariantId,
    quantity: 2,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const order = Factory.Order.makeOne({
    _id: orderId,
    accountId: "123",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: [orderItem]
      })
    ],
    payments: [Factory.Payment.makeOne({
      _id: paymentId,
      name: "iou_example",
      status: "created"
    })],
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  await testApp.collections.Orders.insertOne(order);

  await testApp.collections.Groups.insertOne(adminGroup);

  await testApp.createUserAndAccount(mockAdminAccount);
  approveOrderPaymentsMutation = testApp.mutate(approveOrderPayments);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("an anonymous user should not be able to approve order payments", async () => {
  try {
    await approveOrderPaymentsMutation({
      input: {
        orderId: opaqueOrderId,
        paymentIds: [opaquePaymentId],
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
    return;
  }
});

test("an admin user should be able to approve order payments", async () => {
  let result;
  await testApp.setLoggedInUser(mockAdminAccount);

  // Verify order status is initially set to "created"
  const existingOrder = await testApp.collections.Orders.findOne({ _id: orderId });
  expect(existingOrder.payments[0].status).toEqual("created");

  try {
    result = await approveOrderPaymentsMutation({
      input: {
        orderId: opaqueOrderId,
        paymentIds: [opaquePaymentId],
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.approveOrderPayments.order.payments[0].status).toEqual("approved");
});
