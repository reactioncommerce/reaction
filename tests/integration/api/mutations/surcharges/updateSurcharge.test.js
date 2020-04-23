import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const CreateSurchargeMutation = importAsString("./CreateSurchargeMutation.graphql");
const UpdateSurchargeMutation = importAsString("./UpdateSurchargeMutation.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const surchargeAttributes = [
  { property: "vendor", value: "reaction", propertyType: "string", operator: "eq" },
  { property: "productType", value: "knife", propertyType: "string", operator: "eq" }
];

const surchargeMessagesByLanguage = [
  {
    content: "You are shipping hazardous items, there is a 19.99 surcharge",
    language: "en"
  }, {
    content: "Spanish - You are shipping hazardous items, there is a 19.99 surcharge",
    language: "es"
  }
];

const adminGroup = Factory.Group.makeOne({
  _id: "adminGroup",
  createdBy: null,
  name: "admin",
  permissions: ["reaction:legacy:surcharges/create", "reaction:legacy:surcharges/delete", "reaction:legacy:surcharges/update"],
  slug: "admin",
  shopId: internalShopId
});

const surchargeDestination = { region: ["CO", "NY"] };

const mockAdminAccount = Factory.Account.makeOne({
  groups: [adminGroup._id],
  shopId: internalShopId
});

let testApp;
let createSurcharge;
let updateSurcharge;
let createdSurchargeOpaqueId;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  await insertPrimaryShop(testApp.context, {
    _id: internalShopId,
    name: shopName,
    currency: "USD",
    shopType: "merchant",
    slug: "my-shop"
  });
  await testApp.collections.Groups.insertOne(adminGroup);
  await testApp.createUserAndAccount(mockAdminAccount);
  await testApp.setLoggedInUser(mockAdminAccount);

  createSurcharge = testApp.mutate(CreateSurchargeMutation);
  updateSurcharge = testApp.mutate(UpdateSurchargeMutation);

  const { createSurcharge: createdSurcharge } = await createSurcharge({
    createSurchargeInput: {
      shopId: opaqueShopId,
      surcharge: {
        amount: 19.99,
        messagesByLanguage: surchargeMessagesByLanguage,
        type: "surcharge",
        attributes: surchargeAttributes
      }
    }
  });
  createdSurchargeOpaqueId = createdSurcharge.surcharge._id;
});


// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

beforeEach(async () => {
  await testApp.clearLoggedInUser();
});

test("an authorized user can update a surcharge", async () => {
  await testApp.setLoggedInUser(mockAdminAccount);
  let result;

  try {
    result = await updateSurcharge({
      updateSurchargeInput: {
        shopId: opaqueShopId,
        surchargeId: createdSurchargeOpaqueId,
        surcharge: {
          amount: 29.99,
          messagesByLanguage: [surchargeMessagesByLanguage[0]],
          type: "surcharge",
          attributes: [surchargeAttributes[1]],
          destination: surchargeDestination
        }
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
  }

  expect(result.updateSurcharge.surcharge.shopId).toEqual(opaqueShopId);
  expect(result.updateSurcharge.surcharge.amount.amount).toEqual(29.99);
  expect(result.updateSurcharge.surcharge.messagesByLanguage).toEqual([surchargeMessagesByLanguage[0]]);
  expect(result.updateSurcharge.surcharge.attributes).toEqual([surchargeAttributes[1]]);
  expect(result.updateSurcharge.surcharge.destination).toEqual(surchargeDestination);
});


test("an unauthorized user cannot update a surcharge", async () => {
  try {
    await updateSurcharge({
      updateSurchargeInput: {
        shopId: opaqueShopId,
        surchargeId: createdSurchargeOpaqueId,
        surcharge: {
          amount: 29.99,
          messagesByLanguage: [surchargeMessagesByLanguage[0]],
          type: "surcharge",
          attributes: [surchargeAttributes[1]],
          destination: surchargeDestination
        }
      }
    });
  } catch (error) {
    expect(error).toMatchSnapshot();
  }
});
