import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const UpdateOrderMutation = importAsString("./UpdateOrderMutation.graphql");

jest.setTimeout(300000);

let testApp;
let updateOrder;
let catalogItem;
let mockOrdersAccount;
let shopId;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  shopId = await insertPrimaryShop(testApp.context);

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:orders/update"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  mockOrdersAccount = Factory.Account.makeOne({
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockOrdersAccount);

  catalogItem = Factory.Catalog.makeOne({
    isDeleted: false,
    product: Factory.CatalogProduct.makeOne({
      isDeleted: false,
      isVisible: true,
      variants: Factory.CatalogProductVariant.makeMany(1)
    })
  });
  await testApp.collections.Catalog.insertOne(catalogItem);

  updateOrder = testApp.mutate(UpdateOrderMutation);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("user with `reaction:legacy:orders/update role can update an order", async () => {
  await testApp.setLoggedInUser(mockOrdersAccount);

  const orderItem = Factory.OrderItem.makeOne({
    productId: catalogItem.product.productId,
    quantity: 2,
    variantId: catalogItem.product.variants[0].variantId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });

  const order = Factory.Order.makeOne({
    accountId: "123",
    shipping: [
      Factory.OrderFulfillmentGroup.makeOne({
        items: [orderItem]
      })
    ],
    shopId,
    workflow: {
      status: "new",
      workflow: ["new"]
    }
  });
  await testApp.collections.Orders.insertOne(order);

  let result;
  try {
    result = await updateOrder({
      email: "new@email.com",
      orderId: encodeOpaqueId("reaction/order", order._id),
      status: "NEW_STATUS"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.updateOrder.order.email).toBe("new@email.com");
  expect(result.updateOrder.order.status).toBe("NEW_STATUS");
});
