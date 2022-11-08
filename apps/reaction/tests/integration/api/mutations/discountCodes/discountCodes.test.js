import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const createDiscountCodeMutation = importAsString("./createDiscountCodeMutation.graphql");
const updateDiscountCodeMutation = importAsString("./updateDiscountCodeMutation.graphql");
const deleteDiscountCodeMutation = importAsString("./deleteDiscountCodeMutation.graphql");

jest.setTimeout(300000);

let createDiscountCode;
let mockAdminAccount;
let deleteDiscountCode;
let shopId;
let shopOpaqueId;
let testApp;
let discountCodeOpaqueId;
let updateDiscountCode;

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
    permissions: ["reaction:legacy:discounts/create", "reaction:legacy:discounts/delete", "reaction:legacy:discounts/read", "reaction:legacy:discounts/update"],
    slug: "admin",
    shopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  createDiscountCode = testApp.mutate(createDiscountCodeMutation);
  updateDiscountCode = testApp.mutate(updateDiscountCodeMutation);
  deleteDiscountCode = testApp.mutate(deleteDiscountCodeMutation);

  mockAdminAccount = Factory.Account.makeOne({
    _id: "mockAdminAccount",
    groups: [adminGroup._id],
    shopId
  });
  await testApp.createUserAndAccount(mockAdminAccount);

  shopOpaqueId = encodeOpaqueId("reaction/shop", shopId);
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("user can add a discount code", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const discountCodeInput = {
    shopId: shopOpaqueId,
    discountCode: {
      code: "25OFF",
      label: "25% Off",
      description: "Take 25% on all orders under $400",
      discount: "0.25",
      discountMethod: "code",
      calculation: {
        method: "discount"
      },
      conditions: {
        accountLimit: 1,
        order: {
          min: 0.00,
          max: 400.00,
          startDate: "2019-11-14T18:30:03.658Z",
          endDate: "2021-01-01T08:00:00.000Z"
        },
        redemptionLimit: 0,
        audience: ["customer"],
        permissions: ["guest", "anonymous"],
        products: ["product-id"],
        tags: ["tag-id"],
        enabled: true
      },
      transactions: [{
        cartId: "cart-id",
        userId: "user-id",
        appliedAt: "2019-11-18T18:30:03.658Z"
      }]
    }
  };

  let result;
  try {
    result = await createDiscountCode(discountCodeInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: createdDiscountCodeOpaqueId, ...createdDiscountCode } = result.createDiscountCode.discountCode;

  // Save this for the next tests for updating and deleting;
  discountCodeOpaqueId = createdDiscountCodeOpaqueId;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  const expectedDiscountCodeResponse = {
    shop: {
      _id: shopOpaqueId
    },
    code: "25OFF",
    label: "25% Off",
    description: "Take 25% on all orders under $400",
    discount: "0.25",
    discountMethod: "code",
    calculation: {
      method: "discount"
    },
    conditions: {
      accountLimit: 1,
      order: {
        min: 0.00,
        max: 400.00,
        startDate: "2019-11-14T18:30:03.658Z",
        endDate: "2021-01-01T08:00:00.000Z"
      },
      redemptionLimit: 0,
      audience: ["customer"],
      permissions: ["guest", "anonymous"],
      products: ["product-id"],
      tags: ["tag-id"],
      enabled: true
    },
    transactions: [{
      cartId: "cart-id",
      userId: "user-id",
      appliedAt: "2019-11-18T18:30:03.658Z"
    }]
  };

  expect(createdDiscountCode).toEqual(expectedDiscountCodeResponse);
});

test("user can update an existing discount code", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const discountCodeInput = {
    discountCodeId: discountCodeOpaqueId,
    shopId: shopOpaqueId,
    discountCode: {
      code: "50OFF",
      label: "50% Off",
      description: "Take 50% on all orders over $100",
      discount: "0.50",
      discountMethod: "code",
      calculation: {
        method: "discount"
      },
      conditions: {
        accountLimit: 1,
        order: {
          min: 100.00,
          startDate: "2019-11-14T18:30:03.658Z",
          endDate: "2021-01-01T08:00:00.000Z"
        },
        redemptionLimit: 0,
        audience: ["customer"],
        permissions: ["guest", "anonymous"],
        products: ["product-id"],
        tags: ["tag-id"],
        enabled: true
      }
    }
  };

  let result;
  try {
    result = await updateDiscountCode(discountCodeInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: updatedDiscountCodeOpaqueId, ...updatedDiscountCode } = result.updateDiscountCode.discountCode;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  const expectedDiscountCodeResponse = {
    shop: {
      _id: shopOpaqueId
    },
    code: "50OFF",
    label: "50% Off",
    description: "Take 50% on all orders over $100",
    discount: "0.50",
    discountMethod: "code",
    calculation: {
      method: "discount"
    },
    conditions: {
      accountLimit: 1,
      order: {
        min: 100.00,
        max: null,
        startDate: "2019-11-14T18:30:03.658Z",
        endDate: "2021-01-01T08:00:00.000Z"
      },
      redemptionLimit: 0,
      audience: ["customer"],
      permissions: ["guest", "anonymous"],
      products: ["product-id"],
      tags: ["tag-id"],
      enabled: true
    },
    transactions: [{
      cartId: "cart-id",
      userId: "user-id",
      appliedAt: "2019-11-18T18:30:03.658Z"
    }]
  };

  expect(updatedDiscountCode).toEqual(expectedDiscountCodeResponse);
});

test("user can delete an existing discount code", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);

  const discountCodeInput = {
    discountCodeId: discountCodeOpaqueId,
    shopId: shopOpaqueId
  };

  let result;
  try {
    result = await deleteDiscountCode(discountCodeInput);
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  const { _id: deletedDiscountCodeOpaqueId, ...deletedDiscountCode } = result.deleteDiscountCode.discountCode;

  // Validate the response
  // _id is omitted since the ID is tested for proper opaque ID conversion in the DB test below.
  const expectedDiscountCodeResponse = {
    shop: {
      _id: shopOpaqueId
    },
    code: "50OFF",
    label: "50% Off",
    description: "Take 50% on all orders over $100",
    discount: "0.50",
    discountMethod: "code",
    calculation: {
      method: "discount"
    },
    conditions: {
      accountLimit: 1,
      order: {
        min: 100.00,
        max: null,
        startDate: "2019-11-14T18:30:03.658Z",
        endDate: "2021-01-01T08:00:00.000Z"
      },
      redemptionLimit: 0,
      audience: ["customer"],
      permissions: ["guest", "anonymous"],
      products: ["product-id"],
      tags: ["tag-id"],
      enabled: true
    },
    transactions: [{
      cartId: "cart-id",
      userId: "user-id",
      appliedAt: "2019-11-18T18:30:03.658Z"
    }]
  };

  expect(deletedDiscountCode).toEqual(expectedDiscountCodeResponse);

  // Check the database for the deleted DiscountCode document
  const deletedDiscountCodeDatabaseId = decodeOpaqueIdForNamespace("reaction/discount")(deletedDiscountCodeOpaqueId);

  const removedDiscountCode = await testApp.collections.Discounts.findOne({
    _id: deletedDiscountCodeDatabaseId,
    shopId
  });

  // Expect the discount code to be removed from the database
  expect(removedDiscountCode).toBeNull();
});
